/**
 * NEXUS: THE LIVING CITY
 * Baseten AI Service — OpenAI-Compatible API Integration
 *
 * Uses the Baseten hosted model endpoint with an OpenAI-compatible
 * chat completions interface. Auth is handled via `Api-Key` header.
 *
 * @see https://docs.baseten.co/api-reference/openai
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * Get active Baseten API key.
 * Checks VITE_BASETEN_API_KEY from environment (Vercel / .env)
 * or localStorage for instant browser test overrides.
 */
export const getBasetenApiKey = (): string => {
  const envKey = (import.meta.env.VITE_BASETEN_API_KEY as string | undefined)?.trim();
  if (envKey && envKey !== 'your_baseten_api_key_here') return envKey;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const local = window.localStorage.getItem('VITE_BASETEN_API_KEY') || window.localStorage.getItem('nexus_baseten_key');
      if (local?.trim()) return local.trim();
    }
  } catch {}
  return '';
};

/**
 * Persist Baseten API key into browser localStorage for immediate live sessions.
 */
export const setBasetenApiKey = (key: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('nexus_baseten_key', key.trim());
    }
  } catch {}
};

/**
 * Your deployed model / pipeline ID on Baseten.
 * Defaults to Hackathon Meta model: meta-models/muse-spark-open-1026.
 */
export const BASETEN_MODEL_ID =
  (import.meta.env.VITE_BASETEN_MODEL_ID as string | undefined)?.trim() ||
  'meta-models/muse-spark-open-1026';

/**
 * Base URL for the Baseten OpenAI-compatible endpoint.
 * Defaults to: https://inference.baseten.co/v1
 * Chat completions endpoint will be: ${baseUrl}/chat/completions
 */
export const resolveBaseUrl = (): string => {
  let base = (import.meta.env.VITE_BASETEN_BASE_URL as string | undefined)?.trim();

  if (!base) {
    return 'https://inference.baseten.co/v1';
  }

  base = base.replace(/\/$/, '');

  // If user entered 'https://inference.baseten.co' without the '/v1' path, append '/v1' automatically
  if (base.includes('inference.baseten.co') && !base.endsWith('/v1')) {
    base = `${base}/v1`;
  }

  return base;
};

// ---------------------------------------------------------------------------
// TypeScript Interfaces
// ---------------------------------------------------------------------------

/** A single message in a chat completion request (mirrors OpenAI spec). */
export interface BasetenChatMessage {
  /** The role of the message author. */
  role: 'system' | 'user' | 'assistant' | 'tool';
  /** The text content of the message. */
  content: string;
  /** Optional name to disambiguate between multiple participants with the same role. */
  name?: string;
}

/** Request body sent to the Baseten chat completions endpoint. */
export interface BasetenChatRequest {
  /** Conversation history / prompt messages. */
  messages: BasetenChatMessage[];
  /** Optional API key override for this single request. */
  apiKey?: string;
  /**
   * Model name to use on the shared inference endpoint.
   * Auto-populated from BASETEN_MODEL_ID if not provided.
   * @example "meta-models/muse-spark-open-1026"
   */
  model?: string;
  /**
   * Max tokens to generate.
   * @default 768
   */
  max_tokens?: number;
  /**
   * Sampling temperature (0 = deterministic, 1 = creative).
   * @default 0.7
   */
  temperature?: number;
  /**
   * Nucleus sampling probability mass.
   * @default 1
   */
  top_p?: number;
  /** Stop sequences — generation halts when any of these strings are produced. */
  stop?: string | string[];
  /** Whether to stream partial tokens. Must be false for this helper. */
  stream?: false;
}

/** A single choice returned inside a chat completion response. */
export interface BasetenChatChoice {
  index: number;
  message: {
    role: 'assistant';
    content: string | null;
    reasoning_content?: string | null;
  };
  finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null;
}

/** Helper to extract readable assistant text from choice, supporting reasoning models */
export function extractChoiceText(choice?: BasetenChatChoice): string {
  if (!choice?.message) return '';
  if (choice.message.content && choice.message.content.trim()) {
    return choice.message.content.trim();
  }
  if (choice.message.reasoning_content && choice.message.reasoning_content.trim()) {
    const raw = choice.message.reasoning_content.trim();
    // Look for quoted conclusion or action statement formulated by reasoning models
    const quoteMatches = Array.from(raw.matchAll(/"([^"]{12,280})"/g));
    if (quoteMatches.length > 0) {
      return quoteMatches[quoteMatches.length - 1][1];
    }
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    const nonMetaLines = lines.slice().reverse().find(l => 
      !l.toLowerCase().startsWith('we ') && 
      !l.toLowerCase().startsWith('make sure') &&
      !l.toLowerCase().startsWith('possibly') &&
      !l.toLowerCase().startsWith('should ') &&
      !l.toLowerCase().startsWith('let ')
    );
    return nonMetaLines || lines[lines.length - 1] || raw;
  }
  return '';
}

/** Token usage statistics returned by Baseten. */
export interface BasetenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

/** Successful response from the Baseten chat completions endpoint. */
export interface BasetenChatResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: BasetenChatChoice[];
  usage: BasetenUsage;
  latencyMs?: number;
}

/** Structured error returned when the request fails. */
export interface BasetenError {
  /** Human-readable description of what went wrong. */
  message: string;
  /** HTTP status code, if available. */
  status?: number;
  /** Raw error body from the API, if parseable. */
  raw?: unknown;
}

/** Discriminated union result — either a success or a typed error. */
export type BasetenResult =
  | { ok: true; data: BasetenChatResponse }
  | { ok: false; error: BasetenError };

// ---------------------------------------------------------------------------
// Core API Call
// ---------------------------------------------------------------------------

/**
 * Send a chat completion request to the Baseten OpenAI-compatible endpoint.
 *
 * @param request - The chat request payload.
 * @returns A discriminated union of `{ ok: true, data }` or `{ ok: false, error }`.
 */
export async function callBaseten(request: BasetenChatRequest): Promise<BasetenResult> {
  const baseUrl = resolveBaseUrl();
  const endpoint = `${baseUrl}/chat/completions`;
  const startTime = performance.now();

  const apiKey = (request.apiKey || getBasetenApiKey())?.trim();

  // --- Validate API key ---
  if (!apiKey) {
    const error: BasetenError = {
      message:
        'VITE_BASETEN_API_KEY is not configured. ' +
        'Add it to your Vercel Project Settings > Environment Variables or save it in the Evaluator HUD.',
    };
    console.warn('[NEXUS/Baseten]', error.message);
    return { ok: false, error };
  }

  // OpenAI-standard Authorization format
  const authHeader = apiKey.startsWith('Bearer ') ? apiKey : `Bearer ${apiKey}`;

  // --- Build payload with safe defaults ---
  const payload = {
    model: request.model || BASETEN_MODEL_ID,
    max_tokens: request.max_tokens ?? 768,
    temperature: request.temperature ?? 0.7,
    top_p: request.top_p ?? 1,
    stream: false,
    messages: request.messages,
  };

  try {
    const rawKey = apiKey.replace(/^Bearer\s+/i, '').trim();
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
        'Api-Key': rawKey,
      },
      body: JSON.stringify(payload),
    });

    const elapsed = Math.round(performance.now() - startTime);

    // --- Parse error responses ---
    if (!response.ok) {
      let raw: unknown;
      try {
        raw = await response.json();
      } catch {
        raw = await response.text().catch(() => null);
      }

      const error: BasetenError = {
        message: `Baseten API HTTP ${response.status}: ${typeof raw === 'object' && raw ? JSON.stringify(raw) : (raw || response.statusText)}`,
        status: response.status,
        raw,
      };
      console.error('[NEXUS/Baseten] Request failed:', error);
      return { ok: false, error };
    }

    // --- Parse successful response ---
    const data = (await response.json()) as BasetenChatResponse;
    data.latencyMs = elapsed;
    return { ok: true, data };
  } catch (caught) {
    // --- Network / fetch errors ---
    const message =
      caught instanceof Error
        ? caught.message
        : 'An unknown network error occurred while calling Baseten.';

    const error: BasetenError = { message, raw: caught };
    console.error('[NEXUS/Baseten] Network error:', error);
    return { ok: false, error };
  }
}

// ---------------------------------------------------------------------------
// Convenience Helper
// ---------------------------------------------------------------------------

/**
 * Send a single user prompt to the NEXUS City AI Agent and return the
 * assistant reply text, or a fallback string on error.
 *
 * @param userPrompt   - The user's message.
 * @param systemPrompt - Optional system instruction (defaults to a NEXUS persona).
 * @param fallback     - Text returned when the request fails.
 * @returns The assistant reply or the fallback string.
 *
 * @example
 * const reply = await askNexusAgent('What is the current traffic status in Bole?');
 */
export async function askNexusAgent(
  userPrompt: string,
  systemPrompt = NEXUS_SYSTEM_PROMPT,
  fallback = NEXUS_FALLBACK_RESPONSE,
): Promise<string> {
  const result = await callBaseten({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 768,
  });

  if (result.ok) {
    const text = extractChoiceText(result.data.choices[0]);
    if (text) return text;
  }

  const errMessage = !result.ok ? result.error.message : 'Empty response payload';
  console.warn('[NEXUS/Baseten] Falling back to offline response:', errMessage);
  return fallback;
}

// ---------------------------------------------------------------------------
// NEXUS Default Prompts
// ---------------------------------------------------------------------------

/** Default system prompt that grounds the model as the NEXUS city AI. */
export const NEXUS_SYSTEM_PROMPT = `You are NEXUS — an autonomous AI Digital Twin for the city of Addis Ababa, Ethiopia.
You coordinate a multi-agent network covering: traffic, energy, water, emergency response,
health, environment, public transit, economics, and urban planning.

Your responses are:
- Concise, data-driven, and action-oriented.
- Written in English with occasional Amharic phrases for local cultural context.
- Structured with clear sections when reporting on multiple city systems.

Current simulation context: Real-time city management, incident response, and scenario forecasting.`;

/**
 * Offline fallback response used when the Baseten endpoint is unreachable
 * or the API key is not configured.
 */
export const NEXUS_FALLBACK_RESPONSE =
  '[NEXUS OFFLINE] AI agent network is operating in autonomous simulation mode. ' +
  'External Baseten endpoint is unavailable. All city systems are running on ' +
  'pre-programmed heuristics. Please check VITE_BASETEN_API_KEY configuration.';

// ---------------------------------------------------------------------------
// Test / Debug Utility
// ---------------------------------------------------------------------------

/**
 * Smoke-test the Baseten integration by sending a known initialization prompt.
 *
 * Call this from the browser console or a debug panel:
 * ```ts
 * import { testBasetenAgent } from '@/services/baseten';
 * await testBasetenAgent();
 * ```
 *
 * @returns The assistant reply string (or fallback on error).
 */
export async function testBasetenAgent(): Promise<string> {
  const TEST_PROMPT = 'Initialize NEXUS City AI Agent';

  console.group('[NEXUS/Baseten] Running integration test...');
  console.log('Prompt:', TEST_PROMPT);
  console.log('Endpoint base:', resolveBaseUrl());
  console.log('API key present:', Boolean(getBasetenApiKey()));

  const result = await callBaseten({
    messages: [
      { role: 'system', content: NEXUS_SYSTEM_PROMPT },
      { role: 'user', content: TEST_PROMPT },
    ],
    max_tokens: 512,
    temperature: 0.5,
  });

  if (result.ok) {
    const reply = extractChoiceText(result.data.choices[0]) || '(empty response)';
    console.log('Success!');
    console.log('Model:', result.data.model);
    console.log('Usage:', result.data.usage);
    console.log('Reply:\n', reply);
    console.groupEnd();
    return reply;
  } else {
    console.error('Test failed:', result.error.message);
    if (result.error.raw) console.error('Raw error:', result.error.raw);
    console.groupEnd();
    return NEXUS_FALLBACK_RESPONSE;
  }
}


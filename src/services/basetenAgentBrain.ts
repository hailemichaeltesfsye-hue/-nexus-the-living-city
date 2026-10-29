/**
 * NEXUS: THE LIVING CITY
 * Baseten AI Agent Brain — Live DeepSeek-powered reasoning for the multi-agent system.
 *
 * This module wraps callBaseten() and provides typed AI generation functions for each
 * agent role: domain agent proposals, supervisor arbitration, and critic evaluation.
 *
 * Design principle: ALL functions return a string and NEVER throw.
 * On any error, a deterministic fallback string is returned so the simulation
 * continues uninterrupted.
 */

import { callBaseten, extractChoiceText, NEXUS_SYSTEM_PROMPT } from './baseten';
import type { Incident, AgentId } from '../types/city';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/** Run a single-turn completion with the NEXUS system persona and return the text. */
async function nexusCompletion(userPrompt: string, fallback: string, maxTokens = 600): Promise<string> {
  const result = await callBaseten({
    messages: [
      { role: 'system', content: NEXUS_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: Math.max(maxTokens, 600),
    temperature: 0.7,
  });

  if (result.ok) {
    const text = extractChoiceText(result.data.choices[0]);
    if (text) return text;
  }

  console.warn('[NEXUS/Brain] Using fallback for:', userPrompt.slice(0, 60));
  return fallback;
}

// ---------------------------------------------------------------------------
// Domain Agent Proposals
// ---------------------------------------------------------------------------

export interface AgentProposal {
  proposal: string;
  shortClaim: string;
}

/**
 * Generate a domain agent's proposal for a given incident using live AI.
 *
 * @param agentId - Which domain agent is speaking
 * @param incident - The active incident being responded to
 * @param fallback - Pre-written fallback text
 */
export async function generateAgentProposal(
  agentId: AgentId,
  incident: Incident,
  fallback: AgentProposal,
): Promise<AgentProposal> {
  const agentRoles: Partial<Record<AgentId, string>> = {
    traffic:     'Traffic Flow Controller — prioritizes road throughput and junction efficiency',
    emergency:   'Emergency Response Coordinator — prioritizes ambulance/fire ingress speed',
    energy:      'Energy Grid Manager — prioritizes grid stability and load balancing',
    water:       'Water Systems Manager — prioritizes reservoir pressure and flood control',
    health:      'Public Health Supervisor — prioritizes hospital capacity and patient safety',
    environment: 'Environmental Monitor — prioritizes air/water quality and pollution control',
    transit:     'Public Transit Orchestrator — prioritizes maglev and bus punctuality',
    economy:     'Economic Systems Advisor — prioritizes business continuity and supply chains',
    planner:     'Urban Infrastructure Planner — prioritizes long-term city resilience',
  };

  const role = agentRoles[agentId] ?? agentId;

  const prompt = `You are the ${role} AI agent inside NEXUS — Addis Ababa city command.

A ${incident.severity} incident has occurred: "${incident.title}" in ${incident.district.replace('_', ' ')} district.
Incident details: ${incident.description}

As the ${agentId.toUpperCase()} agent, provide your single most important action proposal in 1–2 sentences.
Then on a new line write "SHORT:" followed by a 4–6 word summary of your claim.

Format:
<Your full proposal here>
SHORT: <4–6 word claim>`;

  const fallbackText = `${fallback.proposal}\nSHORT: ${fallback.shortClaim}`;
  const raw = await nexusCompletion(prompt, fallbackText, 120);

  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  const shortLine = lines.find((l) => l.toLowerCase().startsWith('short:'));
  const proposalLines = lines.filter((l) => !l.toLowerCase().startsWith('short:'));

  return {
    proposal: proposalLines.join(' ') || fallback.proposal,
    shortClaim: shortLine ? shortLine.replace(/^short:\s*/i, '') : fallback.shortClaim,
  };
}

// ---------------------------------------------------------------------------
// Supervisor Arbitration
// ---------------------------------------------------------------------------

export interface SupervisorArbitration {
  conflictSummary: string;
  proposedSolution: string;
  coordinatedSteps: string[];
}

/**
 * Generate the Supervisor's conflict resolution reasoning using live AI.
 *
 * @param incident  - The active incident
 * @param claimA    - Domain agent A's proposal
 * @param claimB    - Domain agent B's proposal
 * @param agentAId  - Agent A's ID
 * @param agentBId  - Agent B's ID
 * @param fallback  - Pre-written fallback arbitration
 */
export async function generateSupervisorArbitration(
  incident: Incident,
  claimA: string,
  claimB: string,
  agentAId: AgentId,
  agentBId: AgentId,
  fallback: SupervisorArbitration,
): Promise<SupervisorArbitration> {
  const prompt = `You are the NEXUS Supervisor AI — multi-objective conflict arbitrator for Addis Ababa.

Active incident: "${incident.title}" (${incident.severity}) in ${incident.district.replace('_', ' ')}.

CONFLICT:
- ${agentAId.toUpperCase()} says: "${claimA}"
- ${agentBId.toUpperCase()} says: "${claimB}"

Respond in exactly this format (no extra text):
CONFLICT: <1–2 sentence summary of why these goals conflict>
SOLUTION: <1 sentence coordinated resolution that satisfies both agents>
STEP1: <Concrete action 1>
STEP2: <Concrete action 2>
STEP3: <Concrete action 3>
STEP4: <Concrete action 4>`;

  const raw = await nexusCompletion(prompt, '', 220);

  try {
    const get = (key: string) => {
      const match = raw.match(new RegExp(`^${key}:\\s*(.+)`, 'm'));
      return match ? match[1].trim() : '';
    };

    const conflictSummary = get('CONFLICT') || fallback.conflictSummary;
    const proposedSolution = get('SOLUTION') || fallback.proposedSolution;
    const steps = [
      get('STEP1'), get('STEP2'), get('STEP3'), get('STEP4'),
    ].filter(Boolean);

    return {
      conflictSummary,
      proposedSolution,
      coordinatedSteps: steps.length >= 2 ? steps : fallback.coordinatedSteps,
    };
  } catch {
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Critic Evaluation
// ---------------------------------------------------------------------------

export interface CriticAssessment {
  score: number;       // 0–100
  feedback: string;
  approved: boolean;
  criteria: {
    effectiveness: number;
    safety: number;
    resourceUsage: number;
    responseTime: number;
    impactOnOtherSystems: number;
    confidence: number;
  };
}

/**
 * Generate the Critic agent's safety evaluation score using live AI.
 *
 * @param solution      - The proposed coordinated solution text
 * @param incident      - The active incident
 * @param attemptNumber - Which retry attempt this is (1 = first, usually fails)
 * @param fallback      - Pre-written fallback evaluation
 */
export async function generateCriticEvaluation(
  solution: string,
  incident: Incident,
  attemptNumber: number,
  fallback: CriticAssessment,
): Promise<CriticAssessment> {
  const prompt = `You are the NEXUS Critic & Judge AI — algorithmic safety auditor. Safety floor threshold: 75/100.

Incident: "${incident.title}" (${incident.severity}).
Proposed solution: "${solution}"
Evaluation attempt: ${attemptNumber} of 3.
${attemptNumber === 1 ? 'Note: Be strict. Identify a real safety gap. Score should be 65–74.' : 'Note: The solution has been refined. Score should be 88–97 if genuinely improved.'}

Respond in exactly this format:
EFFECTIVENESS: <number 0-100>
SAFETY: <number 0-100>
RESOURCE_USAGE: <number 0-100>
RESPONSE_TIME: <number 0-100>
SYSTEM_IMPACT: <number 0-100>
CONFIDENCE: <number 0-100>
FEEDBACK: <1–2 sentences of specific critical feedback>`;

  const raw = await nexusCompletion(prompt, '', 160);

  try {
    const num = (key: string, def: number) => {
      const m = raw.match(new RegExp(`^${key}:\\s*(\\d+)`, 'm'));
      return m ? Math.min(100, Math.max(0, parseInt(m[1]))) : def;
    };
    const feedbackMatch = raw.match(/^FEEDBACK:\s*(.+)/m);
    const feedback = feedbackMatch ? feedbackMatch[1].trim() : fallback.feedback;

    const criteria = {
      effectiveness:        num('EFFECTIVENESS', fallback.criteria.effectiveness),
      safety:               num('SAFETY', fallback.criteria.safety),
      resourceUsage:        num('RESOURCE_USAGE', fallback.criteria.resourceUsage),
      responseTime:         num('RESPONSE_TIME', fallback.criteria.responseTime),
      impactOnOtherSystems: num('SYSTEM_IMPACT', fallback.criteria.impactOnOtherSystems),
      confidence:           num('CONFIDENCE', fallback.criteria.confidence),
    };

    const score = Math.round(
      (criteria.effectiveness + criteria.safety + criteria.resourceUsage +
       criteria.responseTime + criteria.impactOnOtherSystems + criteria.confidence) / 6
    );

    return { score, feedback, approved: score >= 75, criteria };
  } catch {
    return fallback;
  }
}

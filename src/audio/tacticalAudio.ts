/**
 * NEXUS: THE LIVING CITY
 * Tactical Audio Synthesis Engine (Web Audio API & Radio Voice Dispatch)
 * Multi-Tier Audio Engine with Guaranteed Audible Amharic & English Speech
 */

class TacticalAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private voiceEnabled: boolean = true;
  private ambientGain: GainNode | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private currentLanguage: 'am' | 'en' | 'bilingual' = 'bilingual';

  // Manifest of pre-rendered high-definition Amharic audio assets
  private readonly amharicAudioMap: Record<string, string> = {
    'kazanchis_flood': '/audio/amharic/kazanchis_flood.mp3',
    'cmd-kazanchis-flood': '/audio/amharic/kazanchis_flood.mp3',
    'gotera_signals': '/audio/amharic/gotera_signals.mp3',
    'cmd-gotera-signals': '/audio/amharic/gotera_signals.mp3',
    'tikur_anbessa_icu': '/audio/amharic/tikur_anbessa_icu.mp3',
    'cmd-tikur-anbessa-icu': '/audio/amharic/tikur_anbessa_icu.mp3',
    'gerd_healing': '/audio/amharic/gerd_healing.mp3',
    'cmd-gerd-healing': '/audio/amharic/gerd_healing.mp3',
    'drone_sam': '/audio/amharic/drone_sam.mp3',
    'cmd-drone-sam': '/audio/amharic/drone_sam.mp3',
    'debate_dag': '/audio/amharic/debate_dag.mp3',
    'cmd-debate-dag': '/audio/amharic/debate_dag.mp3',
    'confirm_general': '/audio/amharic/confirm_general.mp3',

    // Debate turns
    'debate_turn_1': '/audio/amharic/debate_turn_1.mp3',
    'debate_turn_2': '/audio/amharic/debate_turn_2.mp3',
    'debate_turn_3': '/audio/amharic/debate_turn_3.mp3',
    'debate_turn_4': '/audio/amharic/debate_turn_4.mp3',
    'debate_turn_5': '/audio/amharic/debate_turn_5.mp3',
    'debate_turn_6': '/audio/amharic/debate_turn_6.mp3',
    'debate_turn_7': '/audio/amharic/debate_turn_7.mp3',

    // Agent individual voices
    'agent_traffic': '/audio/amharic/agent_traffic.mp3',
    'agent_emergency': '/audio/amharic/agent_emergency.mp3',
    'agent_health': '/audio/amharic/agent_health.mp3',
    'agent_energy': '/audio/amharic/agent_energy.mp3',
    'agent_water': '/audio/amharic/agent_water.mp3',
    'agent_critic': '/audio/amharic/agent_critic.mp3',
    'agent_supervisor': '/audio/amharic/agent_supervisor.mp3',
    'agent_transit': '/audio/amharic/agent_transit.mp3',
    'agent_environment': '/audio/amharic/agent_environment.mp3',
    'agent_spatial': '/audio/amharic/agent_spatial.mp3',
    'agent_security': '/audio/amharic/agent_security.mp3',
  };

  constructor() {
    // Initialized on first user interaction to comply with browser autoplay policies
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.startAmbientHum();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public stopAllAudio() {
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch {
        // ignore
      }
      this.currentAudioElement = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopAllAudio();
    }
    if (this.ambientGain) {
      this.ambientGain.gain.setValueAtTime(muted ? 0 : 0.04, this.ctx?.currentTime || 0);
    }
  }

  public toggleMute(): boolean {
    this.initContext();
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setLanguage(lang: 'am' | 'en' | 'bilingual') {
    this.currentLanguage = lang;
  }

  public getLanguage(): 'am' | 'en' | 'bilingual' {
    return this.currentLanguage;
  }

  // Futuristic UI click / blip
  public playTacticalClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // Audio fallback
    }
  }

  // Tactical alert / conflict detection ping
  public playAlertPing() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(now + 0.25);
    } catch {
      // Audio fallback
    }
  }

  // Emergency Siren chirps
  public playEmergencySirenChirp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(950, now + 0.15);
      osc.frequency.linearRampToValueAtTime(600, now + 0.3);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(now + 0.3);
    } catch {
      // Audio fallback
    }
  }

  // Ambient cybernetic city room hum
  private startAmbientHum() {
    if (!this.ctx) return;
    try {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      this.ambientGain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(55, this.ctx.currentTime); // Low A hum

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(110, this.ctx.currentTime);

      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.03, this.ctx.currentTime);

      osc1.connect(this.ambientGain);
      osc2.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
    } catch {
      // Audio fallback
    }
  }

  // Text sanitizer: guarantees speech synthesis NEVER speaks "dot", "period", "dash", or punctuation noise
  public sanitizeSpeechText(text: string, lang: 'am' | 'en' = 'en'): string {
    if (!text) return '';
    let s = text;

    if (lang === 'am') {
      s = s.replace(/(\d+)\.(\d+)/g, '$1 ነጥብ $2');
      s = s.replace(/SAM\s*3\.1/gi, 'ሳም ሶስት');
      s = s.replace(/ሳ\.ሜ\.?/gi, 'ሳንቲሜትር');
      s = s.replace(/ኪ\.ሜ\.?/gi, 'ኪሎሜትር');
    } else {
      s = s.replace(/(\d+)\.(\d+)/g, '$1 point $2');
      s = s.replace(/SAM\s*3\.1/gi, 'SAM three point one');
    }

    s = s.replace(/\bMW\b/g, 'megawatts');
    s = s.replace(/\bkm\/h\b/gi, 'kilometers per hour');
    s = s.replace(/\bEMS\b/g, 'E M S');
    s = s.replace(/\bICU\b/g, 'I C U');
    s = s.replace(/\bDAG\b/g, 'D A G');
    s = s.replace(/\bP2P\b/gi, 'peer to peer');

    s = s.replace(/\.{2,}/g, ' ');
    s = s.replace(/[•·▪●◦§]/g, ' ');
    s = s.replace(/\b(dot|period|bullet)\b/gi, ' ');
    s = s.replace(/[.\-—_!?:;,/\\"'`~@#$%^&*()[\]{}|<>+=]/g, ' ');
    s = s.replace(/[።፣፤፦]/g, ' ');

    return s.replace(/\s+/g, ' ').trim();
  }

  /**
   * Play crystal-clear Amharic voice audio with multi-tier fallback:
   * Tier 1: Local pristine pre-rendered audio asset (/audio/amharic/*.mp3)
   * Tier 2: Dynamic online stream (Google TTS endpoint with no-referrer)
   * Tier 3: Browser SpeechSynthesis with am/et voice or phonetic fallback
   */
  public playAmharicAudio(
    textOrKey: string,
    onEnd?: () => void,
    phoneticFallback?: string
  ) {
    if (this.isMuted || !this.voiceEnabled || typeof window === 'undefined') {
      onEnd?.();
      return;
    }

    this.stopAllAudio();
    this.playTacticalClick();

    // Check if key matches our local pre-rendered audio files
    const localFile = this.amharicAudioMap[textOrKey] ||
      (textOrKey.includes('kazanchis') ? this.amharicAudioMap['kazanchis_flood'] : null) ||
      (textOrKey.includes('gotera') ? this.amharicAudioMap['gotera_signals'] : null) ||
      (textOrKey.includes('tikur') || textOrKey.includes('ጥቁር') ? this.amharicAudioMap['tikur_anbessa_icu'] : null) ||
      (textOrKey.includes('gerd') || textOrKey.includes('ህዳሴ') ? this.amharicAudioMap['gerd_healing'] : null) ||
      (textOrKey.includes('sam') || textOrKey.includes('drone') || textOrKey.includes('ድሮን') ? this.amharicAudioMap['drone_sam'] : null) ||
      (textOrKey.includes('debate') || textOrKey.includes('ክርክር') ? this.amharicAudioMap['debate_dag'] : null);

    if (localFile) {
      try {
        const audio = new Audio(localFile);
        audio.volume = 1.0;
        this.currentAudioElement = audio;

        let finished = false;
        const done = () => {
          if (!finished) {
            finished = true;
            this.currentAudioElement = null;
            onEnd?.();
          }
        };

        audio.onended = done;
        audio.onerror = () => {
          // If local audio fails to load, fall back to online TTS
          this.streamAmharicTTS(textOrKey, onEnd, phoneticFallback);
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            this.streamAmharicTTS(textOrKey, onEnd, phoneticFallback);
          });
        }
        return;
      } catch {
        this.streamAmharicTTS(textOrKey, onEnd, phoneticFallback);
        return;
      }
    }

    // Dynamic Amharic text
    this.streamAmharicTTS(textOrKey, onEnd, phoneticFallback);
  }

  private streamAmharicTTS(text: string, onEnd?: () => void, phoneticFallback?: string) {
    if (typeof window === 'undefined') {
      onEnd?.();
      return;
    }

    const clean = this.sanitizeSpeechText(text, 'am');
    if (!clean) {
      onEnd?.();
      return;
    }

    try {
      const encoded = encodeURIComponent(clean.slice(0, 160));
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=am&client=tw-ob&q=${encoded}`;

      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.src = url;
      audio.volume = 1.0;
      this.currentAudioElement = audio;

      let finished = false;
      const done = () => {
        if (!finished) {
          finished = true;
          this.currentAudioElement = null;
          onEnd?.();
        }
      };

      audio.onended = done;
      audio.onerror = () => {
        // Fall back to SpeechSynthesis
        this.speakWithSpeechSynthesisAmharic(clean, phoneticFallback, onEnd);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          this.speakWithSpeechSynthesisAmharic(clean, phoneticFallback, onEnd);
        });
      }
    } catch {
      this.speakWithSpeechSynthesisAmharic(clean, phoneticFallback, onEnd);
    }
  }

  private speakWithSpeechSynthesisAmharic(textAm: string, phoneticFallback?: string, onEnd?: () => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }

    try {
      const voices = window.speechSynthesis.getVoices();
      const amVoice = voices.find(
        (v) =>
          v.lang.startsWith('am') ||
          v.lang.toLowerCase().includes('et') ||
          v.name.toLowerCase().includes('amharic')
      );

      const targetText = amVoice ? textAm : phoneticFallback || textAm;
      const utter = new SpeechSynthesisUtterance(targetText);
      utter.rate = amVoice ? 0.95 : 0.88;
      utter.pitch = 0.94;
      utter.volume = 1.0;

      if (amVoice) {
        utter.voice = amVoice;
        utter.lang = amVoice.lang || 'am-ET';
      } else {
        const enVoice = voices.find((v) => v.lang.startsWith('en'));
        if (enVoice) utter.voice = enVoice;
        utter.lang = 'en-US';
      }

      utter.onend = () => onEnd?.();
      utter.onerror = () => onEnd?.();

      window.speechSynthesis.speak(utter);
    } catch {
      onEnd?.();
    }
  }

  // Bilingual Sequential Tactical Dispatch: Speaks English FIRST, then immediately follows with audible Amharic!
  public speakBilingualDispatch(
    textEn: string,
    textAm: string,
    phoneticAm: string,
    onComplete?: () => void,
    directiveKey?: string
  ) {
    if (this.isMuted || !this.voiceEnabled || typeof window === 'undefined') {
      onComplete?.();
      return;
    }

    this.stopAllAudio();
    this.playTacticalClick();

    const cleanEn = this.sanitizeSpeechText(textEn, 'en');

    if (!('speechSynthesis' in window)) {
      // Direct Amharic playback
      this.playAmharicAudio(directiveKey || textAm, onComplete, phoneticAm);
      return;
    }

    try {
      const utterEn = new SpeechSynthesisUtterance(cleanEn);
      utterEn.lang = 'en-US';
      utterEn.rate = 1.0;
      utterEn.pitch = 0.96;
      utterEn.volume = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const enVoice =
        voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('David') ||
              v.name.includes('Samantha') ||
              v.name.includes('Alex'))
        ) || voices.find((v) => v.lang.startsWith('en'));
      if (enVoice) utterEn.voice = enVoice;

      utterEn.onend = () => {
        // 200ms tactical radio pause, then play crystal-clear Amharic
        setTimeout(() => {
          this.playAmharicAudio(directiveKey || textAm, onComplete, phoneticAm);
        }, 200);
      };

      utterEn.onerror = () => {
        this.playAmharicAudio(directiveKey || textAm, onComplete, phoneticAm);
      };

      window.speechSynthesis.speak(utterEn);
    } catch {
      this.playAmharicAudio(directiveKey || textAm, onComplete, phoneticAm);
    }
  }

  // Speak with customized acoustic profile for each specific domain agent
  public speakWithAgentVoice(
    role: string,
    text: string,
    lang: 'am' | 'en' = 'en',
    onEnd?: () => void,
    amharicKey?: string
  ) {
    if (this.isMuted || !this.voiceEnabled || typeof window === 'undefined') {
      onEnd?.();
      return;
    }

    if (lang === 'am') {
      const key = amharicKey || `agent_${role}`;
      this.playAmharicAudio(key, onEnd);
      return;
    }

    if (!('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }

    try {
      this.stopAllAudio();
      const cleanText = this.sanitizeSpeechText(text, 'en');
      if (!cleanText) {
        onEnd?.();
        return;
      }

      const utter = new SpeechSynthesisUtterance(cleanText);
      const voices = window.speechSynthesis.getVoices();

      let pitch = 1.0;
      let rate = 1.0;

      switch (role) {
        case 'traffic':
          pitch = 1.06;
          rate = 1.05;
          break;
        case 'emergency':
          pitch = 1.14;
          rate = 1.1;
          break;
        case 'health':
          pitch = 1.0;
          rate = 0.95;
          break;
        case 'energy':
          pitch = 0.88;
          rate = 0.96;
          break;
        case 'critic':
          pitch = 0.84;
          rate = 0.92;
          break;
        case 'supervisor':
          pitch = 0.95;
          rate = 0.94;
          break;
        default:
          pitch = 1.0;
          rate = 1.0;
      }

      const enVoice =
        voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('David') ||
              v.name.includes('Samantha') ||
              v.name.includes('Alex'))
        ) || voices.find((v) => v.lang.startsWith('en'));
      if (enVoice) utter.voice = enVoice;
      utter.lang = 'en-US';

      utter.pitch = pitch;
      utter.rate = rate;
      utter.volume = 1.0;

      utter.onend = () => onEnd?.();
      utter.onerror = () => onEnd?.();

      this.playTacticalClick();
      window.speechSynthesis.speak(utter);
    } catch {
      onEnd?.();
    }
  }

  // Tactical Voice Dispatch Entrypoint
  public speakTacticalDispatch(
    phrase: string,
    langPreference?: 'am' | 'en' | 'bilingual',
    phoneticOverride?: string,
    key?: string,
    onEnd?: () => void
  ) {
    if (this.isMuted || !this.voiceEnabled || typeof window === 'undefined') {
      onEnd?.();
      return;
    }

    const targetLang = langPreference || this.currentLanguage;

    if (targetLang === 'bilingual') {
      const enPhrase = phrase.replace(/[\u1200-\u137F]+/g, '').trim() || 'Directive received and verified.';
      const amPhrase = key || 'confirm_general';
      this.speakBilingualDispatch(enPhrase, amPhrase, phoneticOverride || '', onEnd, key);
      return;
    }

    if (targetLang === 'am') {
      this.playAmharicAudio(key || phrase, onEnd, phoneticOverride);
      return;
    }

    // English
    if (!('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }

    try {
      this.stopAllAudio();
      const cleanText = this.sanitizeSpeechText(phrase, 'en');
      const utter = new SpeechSynthesisUtterance(cleanText);
      utter.rate = 1.0;
      utter.pitch = 0.95;
      utter.lang = 'en-US';

      const voices = window.speechSynthesis.getVoices();
      const enVoice = voices.find((v) => v.lang.startsWith('en'));
      if (enVoice) utter.voice = enVoice;

      utter.onend = () => onEnd?.();
      utter.onerror = () => onEnd?.();

      this.playTacticalClick();
      window.speechSynthesis.speak(utter);
    } catch {
      onEnd?.();
    }
  }
}

export const tacticalAudio = new TacticalAudioEngine();



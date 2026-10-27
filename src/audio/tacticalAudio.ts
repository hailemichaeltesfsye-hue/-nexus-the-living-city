/**
 * NEXUS: THE LIVING CITY
 * Tactical Audio Synthesis Engine (Web Audio API & Radio Voice Dispatch)
 * 100% Procedural - Zero External Audio File Dependencies
 */

class TacticalAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private voiceEnabled: boolean = true;
  private ambientGain: GainNode | null = null;

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

  public setMuted(muted: boolean) {
    this.isMuted = muted;
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

  private currentLanguage: 'am' | 'en' | 'bilingual' = 'bilingual';

  public setLanguage(lang: 'am' | 'en' | 'bilingual') {
    this.currentLanguage = lang;
  }

  public getLanguage(): 'am' | 'en' | 'bilingual' {
    return this.currentLanguage;
  }

  // Bulletproof text sanitizer: guarantees speech synthesis NEVER speaks "dot", "period", "dash", or punctuation noise
  public sanitizeSpeechText(text: string, lang: 'am' | 'en' = 'en'): string {
    if (!text) return '';
    let s = text;

    // Convert decimal points to spoken words so TTS engines NEVER say "dot"
    if (lang === 'am') {
      s = s.replace(/(\d+)\.(\d+)/g, '$1 ነጥብ $2');
      s = s.replace(/SAM\s*3\.1/gi, 'ሳም ሶስት');
      s = s.replace(/ሳ\.ሜ\.?/gi, 'ሳንቲሜትር');
      s = s.replace(/ኪ\.ሜ\.?/gi, 'ኪሎሜትር');
    } else {
      s = s.replace(/(\d+)\.(\d+)/g, '$1 point $2');
      s = s.replace(/SAM\s*3\.1/gi, 'SAM three');
    }

    // Units and acronyms pronunciation
    s = s.replace(/\bMW\b/g, 'megawatts');
    s = s.replace(/\bkm\/h\b/gi, 'kilometers per hour');
    s = s.replace(/\bEMS\b/g, 'E M S');
    s = s.replace(/\bICU\b/g, 'I C U');
    s = s.replace(/\bDAG\b/g, 'D A G');
    s = s.replace(/\bP2P\b/gi, 'peer to peer');

    // Remove any ellipsis (...) and bullets
    s = s.replace(/\.{2,}/g, ' ');
    s = s.replace(/[•·▪●◦§]/g, ' ');

    // Strip out all literal occurrences of "dot", "period" words and raw punctuation
    s = s.replace(/\b(dot|period|bullet)\b/gi, ' ');
    s = s.replace(/[.\-—_!?:;,/\\"'`~@#$%^&*()[\]{}|<>+=]/g, ' ');
    s = s.replace(/[።፣፤፦]/g, ' '); // Ethiopic punctuation marks

    // Collapse whitespace
    return s.replace(/\s+/g, ' ').trim();
  }

  // Speak with customized acoustic profile for each specific domain agent
  public speakWithAgentVoice(
    role: string,
    text: string,
    lang: 'am' | 'en' = 'en',
    onEnd?: () => void
  ) {
    if (this.isMuted || !this.voiceEnabled || typeof window === 'undefined') {
      onEnd?.();
      return;
    }
    if (!('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const cleanText = this.sanitizeSpeechText(text, lang);
      if (!cleanText) {
        onEnd?.();
        return;
      }

      const utter = new SpeechSynthesisUtterance(cleanText);
      const voices = window.speechSynthesis.getVoices();
      const amVoice = voices.find(
        (v) =>
          v.lang.startsWith('am') ||
          v.lang.toLowerCase().includes('et') ||
          v.name.toLowerCase().includes('amharic')
      );

      // Distinct acoustic parameters per agent persona
      let pitch = 1.0;
      let rate = 1.0;

      switch (role) {
        case 'traffic':
          pitch = 1.06;
          rate = 1.05; // Quick and responsive
          break;
        case 'emergency':
          pitch = 1.14;
          rate = 1.1; // High priority & urgency
          break;
        case 'health':
          pitch = 1.0;
          rate = 0.95; // Clinical and calm
          break;
        case 'energy':
          pitch = 0.88;
          rate = 0.96; // Deep and grounded
          break;
        case 'critic':
          pitch = 0.84;
          rate = 0.92; // Authoritative, constitutional judge
          break;
        case 'supervisor':
          pitch = 0.95;
          rate = 0.94; // Resonant orchestrator
          break;
        default:
          pitch = 1.0;
          rate = 1.0;
      }

      if (lang === 'am' && amVoice) {
        utter.voice = amVoice;
        utter.lang = amVoice.lang || 'am-ET';
      } else {
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
      }

      utter.pitch = pitch;
      utter.rate = rate;
      utter.volume = 1.0;

      utter.onend = () => {
        onEnd?.();
      };
      utter.onerror = () => {
        onEnd?.();
      };

      this.playTacticalClick();
      window.speechSynthesis.speak(utter);
    } catch {
      onEnd?.();
    }
  }

  // Bilingual Sequential Tactical Dispatch: Speaks English FIRST, then immediately follows with Amharic!
  public speakBilingualDispatch(
    textEn: string,
    textAm: string,
    phoneticAm: string,
    onComplete?: () => void
  ) {
    if (this.isMuted || !this.voiceEnabled || typeof window === 'undefined') {
      onComplete?.();
      return;
    }
    if (!('speechSynthesis' in window)) {
      onComplete?.();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const cleanEn = this.sanitizeSpeechText(textEn, 'en');
      const cleanAm = this.sanitizeSpeechText(textAm, 'am');
      const cleanPhonetic = this.sanitizeSpeechText(phoneticAm, 'en');

      const voices = window.speechSynthesis.getVoices();
      const amVoice = voices.find(
        (v) =>
          v.lang.startsWith('am') ||
          v.lang.toLowerCase().includes('et') ||
          v.name.toLowerCase().includes('amharic')
      );

      const utterEn = new SpeechSynthesisUtterance(cleanEn);
      utterEn.lang = 'en-US';
      utterEn.rate = 1.0;
      utterEn.pitch = 0.96;

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

      const utterAm = new SpeechSynthesisUtterance(amVoice ? cleanAm : cleanPhonetic || cleanAm);
      utterAm.rate = amVoice ? 0.95 : 0.88;
      utterAm.pitch = 0.94;
      if (amVoice) {
        utterAm.voice = amVoice;
        utterAm.lang = amVoice.lang || 'am-ET';
      } else {
        if (enVoice) utterAm.voice = enVoice;
        utterAm.lang = 'en-US';
      }

      utterEn.onend = () => {
        // Short pause between English and Amharic
        setTimeout(() => {
          utterAm.onend = () => onComplete?.();
          utterAm.onerror = () => onComplete?.();
          window.speechSynthesis.speak(utterAm);
        }, 220);
      };
      utterEn.onerror = () => {
        window.speechSynthesis.speak(utterAm);
      };

      this.playTacticalClick();
      window.speechSynthesis.speak(utterEn);
    } catch {
      onComplete?.();
    }
  }

  // Autonomous Tactical Voice Dispatch (Dual Amharic & English SpeechSynthesis)
  public speakTacticalDispatch(phrase: string, langPreference?: 'am' | 'en' | 'bilingual', phoneticOverride?: string) {
    if (this.isMuted || !this.voiceEnabled || typeof window === 'undefined') return;
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const targetLang = langPreference || this.currentLanguage;

      if (targetLang === 'bilingual') {
        const enPhrase = phrase.replace(/[\u1200-\u137F]+/g, '').trim() || phrase;
        const amPhrase = phoneticOverride || 'ትዕዛዝ ተፈጽሟል ማዕከላዊ ቁጥጥር ኤጀንቶቹን አሰማርቷል';
        this.speakBilingualDispatch(enPhrase, amPhrase, phoneticOverride || amPhrase);
        return;
      }

      const cleanText = this.sanitizeSpeechText(phrase, targetLang === 'am' ? 'am' : 'en');
      const utter = new SpeechSynthesisUtterance(cleanText);
      utter.rate = targetLang === 'am' ? 0.92 : 1.0;
      utter.pitch = 0.95;
      utter.lang = targetLang === 'am' ? 'am-ET' : 'en-US';

      this.playTacticalClick();
      window.speechSynthesis.speak(utter);
    } catch {
      // Audio fallback
    }
  }
}

export const tacticalAudio = new TacticalAudioEngine();


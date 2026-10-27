/**
 * NEXUS: THE LIVING CITY
 * SoundEngine.ts — Web Audio API SFX Engine v2.0
 *
 * Synthesizes:
 *   • Hazard telemetry pulse beeps (red-amber crisis tones)
 *   • P2P agent synapse data-packet tones
 *   • Cinema tour navigation sweeps
 *   • Evacuation corridor activation chord
 *   • All procedural — zero external audio file deps
 */

class NexusSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted = false;

  // ─── AudioContext lazy-init (browser autoplay policy) ─────────────────────
  private boot() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    if (typeof window === 'undefined') return;
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return;
    this.ctx = new Ctor();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  // ─── Utils ────────────────────────────────────────────────────────────────
  private osc(
    type: OscillatorType,
    freq: number,
    gainVal: number,
    duration: number,
    freqEnd?: number,
    delay = 0,
  ) {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime + delay;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(gainVal, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      g.connect(this.masterGain);

      const o = this.ctx.createOscillator();
      o.type = type;
      o.frequency.setValueAtTime(freq, now);
      if (freqEnd !== undefined) {
        o.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), now + duration);
      }
      o.connect(g);
      o.start(now);
      o.stop(now + duration + 0.01);
    } catch {
      /* no-op */
    }
  }

  private noise(gainVal: number, duration: number, delay = 0) {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime + delay;
      const bufSize = this.ctx.sampleRate * Math.min(duration, 1);
      const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

      const src = this.ctx.createBufferSource();
      src.buffer = buf;

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(gainVal, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      // High-pass to make it hissy
      const hp = this.ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 4000;

      src.connect(hp);
      hp.connect(g);
      g.connect(this.masterGain);
      src.start(now);
      src.stop(now + duration + 0.01);
    } catch {
      /* no-op */
    }
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  public toggleMute(): boolean {
    this.boot();
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(
        this.isMuted ? 0 : 1,
        this.ctx.currentTime,
      );
    }
    return this.isMuted;
  }

  public setMuted(m: boolean) {
    this.isMuted = m;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(m ? 0 : 1, this.ctx.currentTime);
    }
  }

  public getIsMuted() {
    return this.isMuted;
  }

  /**
   * HAZARD ALERT — dual-tone pulsing beep sequence (red crisis)
   * Triggered when hazard overlay activates over Meskel / Kazanchis.
   */
  public playHazardAlert() {
    this.boot();
    if (!this.ctx) return;
    // Three rising stabs — urgent emergency tone
    this.osc('square', 440, 0.08, 0.12, 660);
    this.osc('square', 440, 0.05, 0.12, 660, 0.18);
    this.osc('square', 550, 0.1, 0.22, 880, 0.36);
    // Sub-bass thump
    this.osc('sine', 60, 0.15, 0.3, 20);
    // Hiss noise burst
    this.noise(0.03, 0.15, 0.36);
  }

  /**
   * HAZARD PULSE TICK — Silenced to eliminate repetitive dot/tick background noise
   */
  public playHazardPulseTick() {
    // Pure silence: eliminates annoying dot/tick pulse during hazard runs
  }

  /**
   * EVACUATION ROUTE ACTIVATED — rising triumphant chord
   */
  public playEvacuationActivated() {
    this.boot();
    // Staggered major chord: C4 E4 G4 C5
    [261.6, 329.6, 392.0, 523.3].forEach((freq, i) => {
      this.osc('triangle', freq, 0.05, 0.4, freq * 1.02, i * 0.05);
    });
  }

  /**
   * P2P SYNAPSE PING — Silenced so agent voice is pristine and undisturbed
   */
  public playP2PSynapse() {
    // Pure silence: eliminates background dot/ping noise
  }

  /**
   * P2P CRISIS SYNAPSE — Silenced so agent voice is pristine and undisturbed
   */
  public playP2PCrisisSynapse() {
    // Pure silence: eliminates background crisis noise
  }

  /**
   * CINEMA TOUR TRANSITION — whoosh sweep for each camera fly-stop
   */
  public playCinemaTourWhoosh() {
    this.boot();
    this.osc('sawtooth', 2000, 0.06, 0.45, 200);
    this.noise(0.025, 0.4, 0.0);
    this.osc('sine', 180, 0.08, 0.5, 80, 0.05);
  }

  /**
   * CINEMA TOUR START — dramatic multi-layer launch chord
   */
  public playCinemaTourStart() {
    this.boot();
    this.osc('sine', 110, 0.12, 1.2, 55);
    this.osc('triangle', 220, 0.08, 0.9, 330, 0.1);
    this.osc('square', 440, 0.04, 0.6, 660, 0.2);
    this.noise(0.04, 0.5, 0.0);
  }

  /**
   * CINEMA TOUR END — resolution landing tone
   */
  public playCinemaTourEnd() {
    this.boot();
    [523.3, 659.3, 783.9].forEach((f, i) =>
      this.osc('triangle', f, 0.07, 0.8, f, i * 0.1),
    );
  }

  /**
   * UI CLICK — micro-feedback for buttons
   */
  public playUiClick() {
    this.boot();
    this.osc('sine', 900, 0.04, 0.04, 1400);
  }
}

export const soundEngine = new NexusSoundEngine();

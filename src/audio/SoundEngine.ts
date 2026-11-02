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
  private isMuted = true; // Muted by default so no unwanted sound/noise ever plays

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

  // ─── Utils — Completely silenced so zero electronic oscillator noises can ever play ────
  private osc(
    _type: OscillatorType,
    _freq: number,
    _gainVal: number,
    _duration: number,
    _freqEnd?: number,
    _delay = 0,
  ) {
    // Pure silence: zero electronic beeps, pings, or chirps
    return;
  }

  private noise(_gainVal: number, _duration: number, _delay = 0) {
    // Pure silence: zero noise bursts
    return;
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
   * HAZARD ALERT — Silenced to eliminate repetitive electronic beep/alarm noise
   */
  public playHazardAlert() {
    // Pure silence: eliminates annoying alert stabs and electronic chirps
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
   * UI CLICK — Silenced for pure quiet clicks
   */
  public playUiClick() {
    // Pure silence: eliminates repetitive dot/tick noise
  }
}

export const soundEngine = new NexusSoundEngine();

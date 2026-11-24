/**
 * The press-room sound kit. Everything is synthesized with WebAudio: no samples, no downloads.
 *
 * Two kinds of sound:
 * - Explicit sounds (playChord) play when the reader presses a Play button. That press is consent.
 * - Interface sounds (tick, thunk, pageTurn, lamp, click) are ambient. They stay silent until the
 *   reader turns Sound on, and that choice persists. Default is off.
 */

const PREF_KEY = 'si.sound.v1';

type Listener = (enabled: boolean) => void;

class CarbonSynthEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private enabled = false;
  private chordActive = false;
  private loadedPref = false;
  private listeners = new Set<Listener>();

  private loadPref(): void {
    if (this.loadedPref || typeof window === 'undefined') return;
    this.loadedPref = true;
    try {
      this.enabled = localStorage.getItem(PREF_KEY) === 'on';
    } catch {
      this.enabled = false;
    }
    if (this.enabled) {
      // Browsers only start audio after a gesture, so wake up on the first one.
      const wake = () => {
        this.ensureContext();
        window.removeEventListener('pointerdown', wake);
        window.removeEventListener('keydown', wake);
      };
      window.addEventListener('pointerdown', wake, { once: true });
      window.addEventListener('keydown', wake, { once: true });
    }
  }

  private ensureContext(): boolean {
    if (typeof window === 'undefined') return false;
    if (!this.ctx) {
      const AudioCtor =
        window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtor) return false;
      this.ctx = new AudioCtor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.42;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return true;
  }

  isEnabled(): boolean {
    this.loadPref();
    return this.enabled;
  }

  setEnabled(on: boolean): void {
    this.loadPref();
    this.enabled = on;
    try {
      localStorage.setItem(PREF_KEY, on ? 'on' : 'off');
    } catch {
      // Private browsing: the choice lasts for this page only.
    }
    if (on) {
      this.ensureContext();
      this.tick(980);
    }
    for (const fn of this.listeners) fn(on);
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  isPlaying(): boolean {
    return this.chordActive;
  }

  private ambient(): boolean {
    this.loadPref();
    return this.enabled && this.ensureContext() && Boolean(this.ctx && this.master);
  }

  private noiseBurst(duration: number, from: number, to: number, gainPeak: number, delay = 0): void {
    if (!this.ctx || !this.master) return;
    const start = this.ctx.currentTime + delay;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * duration));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const band = this.ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.Q.value = 1.1;
    band.frequency.setValueAtTime(from, start);
    band.frequency.exponentialRampToValueAtTime(to, start + duration);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, start);
    g.gain.linearRampToValueAtTime(gainPeak, start + duration * 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    src.connect(band);
    band.connect(g);
    g.connect(this.master);
    src.start(start);
    src.stop(start + duration + 0.02);
  }

  private tone(freq: number, type: OscillatorType, start: number, dur: number, peak: number, glideTo?: number): void {
    if (!this.ctx || !this.master) return;
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, start + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, start);
    g.gain.linearRampToValueAtTime(peak, start + Math.min(0.02, dur * 0.2));
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g);
    g.connect(this.master);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }

  /** A chord the reader asked for. Plays even with interface sounds off. */
  playChord(freqs: number[] = [261.63, 329.63, 392.0, 523.25]): void {
    if (!this.ensureContext() || !this.ctx) return;
    this.chordActive = true;
    const now = this.ctx.currentTime;
    this.noiseBurst(0.35, 2400, 1400, 0.025);
    freqs.forEach((f, idx) => {
      const start = now + 0.04 + idx * 0.11;
      this.tone(f, 'triangle', start, 1.05, 0.12, f * 1.0025);
      this.tone(f * 0.5, 'sine', start, 1.05, 0.07);
    });
    window.setTimeout(() => {
      this.chordActive = false;
    }, 1500);
  }

  /** Legacy transport control used by the flexi-disc dock. */
  toggle(force?: boolean): boolean {
    const next = typeof force === 'boolean' ? force : !this.chordActive;
    if (!next && this.ctx && this.master) {
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setTargetAtTime(0.0001, now, 0.05);
      this.master.gain.setTargetAtTime(0.42, now + 0.4, 0.05);
      this.chordActive = false;
    }
    return next;
  }

  /** A pen tick on paper. */
  tick(pitch = 1400): void {
    if (!this.ambient() || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.tone(pitch, 'square', now, 0.03, 0.035, pitch * 0.5);
  }

  /** Kept for older callers: a relay click, now routed through tick. */
  click(pitch = 680): void {
    this.tick(pitch * 1.6);
  }

  /** The press coming down on the sheet. */
  thunk(): void {
    if (!this.ambient() || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.tone(96, 'sine', now, 0.42, 0.32, 44);
    this.noiseBurst(0.12, 900, 200, 0.12);
  }

  /** A page turning. */
  pageTurn(forward = true): void {
    if (!this.ambient()) return;
    this.noiseBurst(0.28, forward ? 900 : 3600, forward ? 3600 : 900, 0.09);
  }

  /** The reading lamp clicking on, with a warm hum behind it. */
  lamp(on = true): void {
    if (!this.ambient() || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.tone(on ? 1900 : 1500, 'square', now, 0.025, 0.04);
    if (on) {
      [196.0, 293.66, 392.0].forEach((f, i) => this.tone(f, 'sine', now + 0.05 + i * 0.06, 1.6, 0.05));
    } else {
      this.tone(120, 'sine', now + 0.02, 0.9, 0.06, 60);
    }
  }
}

export const carbonSynth = new CarbonSynthEngine();

/**
 * CARBON TONEWHEEL & 33⅓ RPM FLEXI-DISC SYNTHESIZER
 *
 * Pure WebAudio procedural synthesizer uniting Issue 01's vinyl flexi-disc crackle
 * with harmonic voicings from Ussyverse Eras II–VI (Helix Organum stops & Solaris ninths).
 */

class CarbonSynthEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private active = false;

  private ensureContext(): boolean {
    if (typeof window === 'undefined') return false;
    if (this.ctx) return true;
    const AudioCtor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return false;

    this.ctx = new AudioCtor();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.0;
    this.masterGain.connect(this.ctx.destination);
    this.startSurfaceBed();
    return true;
  }

  private startSurfaceBed(): void {
    if (!this.ctx || !this.masterGain) return;
    const rate = this.ctx.sampleRate;
    const length = rate * 2.5;
    const buffer = this.ctx.createBuffer(1, length, rate);
    const channel = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const pop = Math.random() > 0.9988 ? (Math.random() * 2 - 1) * 0.32 : 0;
      channel[i] = (Math.random() * 2 - 1) * 0.008 + pop;
    }

    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1750;
    filter.Q.value = 0.85;

    const bedGain = this.ctx.createGain();
    bedGain.gain.value = 0.2;

    src.connect(filter);
    filter.connect(bedGain);
    bedGain.connect(this.masterGain);
    src.start();
  }

  isPlaying(): boolean {
    return this.active;
  }

  toggle(force?: boolean): boolean {
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return false;
    this.active = typeof force === 'boolean' ? force : !this.active;
    if (this.ctx.state === 'suspended' && this.active) {
      void this.ctx.resume();
    }
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setTargetAtTime(this.active ? 0.45 : 0.0, now, 0.12);
    if (this.active) {
      this.playChord([261.63, 329.63, 440.0, 587.33]);
    }
    return this.active;
  }

  playChord(freqs: number[] = [261.63, 329.63, 392.0, 523.25]): void {
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;
    if (!this.active) {
      this.active = true;
      this.masterGain.gain.setTargetAtTime(0.45, this.ctx.currentTime, 0.08);
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const start = now + idx * 0.11;
      const osc = this.ctx.createOscillator();
      const sub = this.ctx.createOscillator();
      osc.type = 'triangle';
      sub.type = 'sine';

      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.linearRampToValueAtTime(freq * 1.0025, start + 0.5);
      sub.frequency.setValueAtTime(freq * 0.5, start);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.13, start + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.05);

      osc.connect(gain);
      sub.connect(gain);
      gain.connect(this.masterGain);

      osc.start(start);
      sub.start(start);
      osc.stop(start + 1.1);
      sub.stop(start + 1.1);
    });
  }

  click(pitch = 640): void {
    if (!this.ctx || !this.masterGain || !this.active) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.42, now + 0.03);

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.06, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.04);
  }
}

export const carbonSynth = new CarbonSynthEngine();

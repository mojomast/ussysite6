/**
 * USSYSITE6 // THE SLOP COMPUTING ANNUAL
 * 33⅓ RPM BOUND-IN FLEXI-DISC & BELL-RELAY MODEM AUDIO SYNTHESIZER
 *
 * Pure WebAudio procedural synthesizer recreating the experience of playing
 * a bound-in vinyl Sound Sheet / Flexi-Disc from a classic 1980s computing magazine:
 * - Warm vinyl surface crackle & 33⅓ RPM groove wow/flutter
 * - Article-specific acoustic/electronic tone programs (`flexiFreqs`)
 * - Tactile mechanical paper-stamp & relay-click sound effects
 */

export class FlexiDiscSynth {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.crackleSource = null;
    this.isPlaying = false;
    this.loopTimer = null;
  }

  init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.0;
    this.masterGain.connect(this.ctx.destination);

    this._startVinylCrackleBed();
  }

  _startVinylCrackleBed() {
    if (!this.ctx) return;
    const rate = this.ctx.sampleRate;
    const len = rate * 3;
    const buf = this.ctx.createBuffer(1, len, rate);
    const data = buf.getChannelData(0);

    for (let i = 0; i < len; i++) {
      // Soft surface hiss + occasional vinyl dust pop
      const dustPop = Math.random() > 0.9985 ? (Math.random() * 2 - 1) * 0.45 : 0;
      data[i] = (Math.random() * 2 - 1) * 0.012 + dustPop;
    }

    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 1850;
    bandpass.Q.value = 0.9;

    const crackleGain = this.ctx.createGain();
    crackleGain.gain.value = 0.25;

    src.connect(bandpass);
    bandpass.connect(crackleGain);
    crackleGain.connect(this.masterGain);
    src.start();
    this.crackleSource = src;
  }

  toggle(forceState) {
    if (!this.ctx) this.init();
    if (!this.ctx) return false;

    this.isPlaying = typeof forceState === 'boolean' ? forceState : !this.isPlaying;
    if (this.ctx.state === 'suspended' && this.isPlaying) {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setTargetAtTime(this.isPlaying ? 0.5 : 0.0, now, 0.15);

    if (this.isPlaying) {
      this.playToneProgram([261.63, 329.63, 392.00, 493.88]);
    }
    return this.isPlaying;
  }

  /**
   * Plays an article's bound-in Flexi-Disc tone sequence.
   */
  playToneProgram(freqs = [261.63, 329.63, 392.00, 493.88]) {
    if (!this.ctx) this.init();
    if (!this.ctx) return;
    if (!this.isPlaying) {
      this.toggle(true);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    freqs.forEach((f, idx) => {
      const start = now + idx * 0.12;
      const osc = this.ctx.createOscillator();
      const sub = this.ctx.createOscillator();
      osc.type = 'triangle';
      sub.type = 'sine';
      osc.frequency.setValueAtTime(f, start);
      // Slight 33⅓ RPM vinyl wow pitch drift
      osc.frequency.linearRampToValueAtTime(f * 1.003, start + 0.45);
      sub.frequency.setValueAtTime(f * 0.5, start);

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, start);
      g.gain.linearRampToValueAtTime(0.14, start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, start + 0.95);

      osc.connect(g);
      sub.connect(g);
      g.connect(this.masterGain);

      osc.start(start);
      sub.start(start);
      osc.stop(start + 1.0);
      sub.stop(start + 1.0);
    });
  }

  /**
   * Short mechanical telegraph relay click for interactive lab buttons & bingo card stamps.
   */
  playRelayClick(pitch = 680) {
    if (!this.ctx || !this.isPlaying) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.4, now + 0.035);

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.08, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.045);
  }
}

// === Cyber-Synth Procedural Music Generator v3 ===
// Richer, louder electronic BGM

class CyberSynth {
  constructor(ctx) {
    this.ctx = ctx;
    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 0.12;
    this.masterGain.connect(ctx.destination);
    // Reverb-like delay node for extra depth
    this.delayNode = ctx.createDelay(0.3);
    this.delayNode.delayTime.value = 0.18;
    this.delayGain = ctx.createGain();
    this.delayGain.gain.value = 0.15;
    this.delayNode.connect(this.delayGain);
    this.delayGain.connect(this.masterGain);

    this.currentMode = 'menu';
    this.currentWave = 1;
    this._running = false;
    this._nextBeat = 0;
    this._bpm = 70;
    this._beat = 0;
    this._fadeTarget = 0.12;
    this._fadeCurrent = 0.12;
  }

  _outputNodes() { return [this.masterGain, this.delayGain]; }

  // === SOUND GENERATORS ===

  _osc(type, freq, time, dur, gain = 0.1, filterFreq = 0) {
    const osc = this.ctx.createOscillator();
    osc.type = type; osc.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(gain, time + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, time + dur);
    if (filterFreq > 0) {
      const f = this.ctx.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = filterFreq; f.Q.value = 1.5;
      osc.connect(f); f.connect(g);
    } else { osc.connect(g); }
    this._outputNodes().forEach(d => g.connect(d));
    osc.start(time); osc.stop(time + dur + 0.05);
  }

  _lead(freq, time, dur, gain = 0.09) {
    this._osc('sawtooth', freq, time, dur, gain * 0.7, 1500);
    this._osc('square', freq * 1.003, time, dur, gain * 0.45, 1200);
    this._osc('triangle', freq * 2, time, dur, gain * 0.15, 3000);
  }

  _bass(freq, time, dur, gain = 0.16) {
    this._osc('sawtooth', freq, time, dur, gain * 0.55, 400);
    this._osc('triangle', freq * 0.5, time, dur, gain * 0.75);
    this._osc('square', freq * 1.0, time + 0.01, dur * 0.5, gain * 0.2, 200);
  }

  _pad(notes, time, dur, gain = 0.05) {
    notes.forEach(f => {
      this._osc('sawtooth', f, time, dur, gain * 0.45, 350);
      this._osc('triangle', f * 1.005, time + 0.02, dur, gain * 0.35, 280);
    });
  }

  _chordStab(notes, time, dur, gain = 0.06) {
    notes.forEach(f => this._osc('square', f, time, dur, gain, 800));
  }

  _kick(time, gain = 0.18) {
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, time);
    osc.frequency.exponentialRampToValueAtTime(32, time + 0.1);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.13);
    osc.connect(g);
    this._outputNodes().forEach(d => g.connect(d));
    osc.start(time); osc.stop(time + 0.15);
  }

  _snare(time, gain = 0.05) {
    this._osc('triangle', 200, time, 0.06, gain * 0.7);
    const buf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.04), this.ctx.sampleRate);
    for (let i = 0; i < buf.length; i++) buf.getChannelData(0)[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 4000;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain * 1.3, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    src.connect(hp); hp.connect(g);
    this._outputNodes().forEach(d => g.connect(d));
    src.start(time);
  }

  _hat(time, gain = 0.03) {
    const buf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.025), this.ctx.sampleRate);
    for (let i = 0; i < buf.length; i++) buf.getChannelData(0)[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 9000;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.02);
    src.connect(hp); hp.connect(g); g.connect(this.masterGain);
    src.start(time);
  }

  // === C Phrygian scale ===
  _n(n, oct = 0) {
    const base = [261.63, 277.18, 311.13, 349.23, 392.00, 415.30, 466.16];
    const idx = ((n % 7) + 7) % 7;
    const octShift = Math.floor(n / 7) + oct;
    return base[idx] * Math.pow(2, octShift);
  }

  // === MENU — signature cyber ambient (loudest, most distinctive) ===
  _menuBeat(n) {
    const t = this.ctx.currentTime;
    const bp = 60 / 70;

    // Lush evolving pad — foundation always present, changes every 32 beats
    if (n % 32 === 0) {
      const root = [0, -4, -2, 3][(n / 32) % 4];
      this._pad([this._n(root, -1), this._n(root + 2, -1), this._n(root + 4, -1), this._n(root + 6, -1), this._n(root, 0)], t, bp * 32, 0.06);
    }
    // Warm lower pad layer
    if (n % 16 === 0) {
      const root = [0, -2, -4, 2][(n / 16) % 4];
      this._pad([this._n(root, -2), this._n(root + 3, -2), this._n(root + 5, -2)], t + bp * 0.5, bp * 16, 0.04);
    }
    // Signature melody — the memorable hook
    if (n % 3 === 0) {
      const mel = [0, 3, 5, 7, 10, 7, 5, 3, 0, -2, 0, 3, 5, 3, 2, 0, -1, 2, 4, 5, 7, 5, 4, 2];
      this._lead(this._n(mel[n % 24], 0), t, 1.6, 0.05);
      this._osc('triangle', this._n(mel[n % 24] + 4, 0), t + 0.12, 1.2, 0.022, 2500);
    }
    // Gentle arp sparkles
    if (n % 2 === 0) {
      const sparkle = [7, 11, 14, 11, 7, 4, 0, 4, 5, 10, 12, 10, 5, 2, -2, 2];
      this._osc('sine', this._n(sparkle[n % 16], 1), t + bp * 0.3, 0.4, 0.015, 4000);
    }
    // Very subtle low pulse — no "Duang"
    if (n % 16 === 0) {
      this._osc('sine', this._n(0, -2), t, 3.0, 0.04);
    }
  }

  // === COMBAT — driving synthwave ===
  _combatBeat(n) {
    const t = this.ctx.currentTime;
    const bp = 60 / this._bpm;

    // Drums
    if (n % 4 === 0) this._kick(t, 0.14);
    if (n % 4 === 2) this._snare(t, 0.05);
    if (n % 2 === 1) this._hat(t, 0.025);
    if (n % 4 === 0) this._hat(t + bp * 0.5, 0.02);

    // Bass line — groovy 8-beat
    const bassPat = [0, 0, 0, 0, -2, -2, -2, -2, 3, 3, 3, 3, -4, -4, -2, 0];
    if (n % 2 === 0) this._bass(this._n(bassPat[n % 16], -2), t, bp * 1.5, 0.12);

    // Chord stabs — rhythmic accent
    if (n % 8 === 0) {
      this._chordStab([this._n(0, -1), this._n(2, -1), this._n(4, -1)], t, bp * 2.5, 0.03);
    }
    if (n % 8 === 4) {
      this._chordStab([this._n(-2, -1), this._n(0, -1), this._n(3, -1)], t, bp * 2.5, 0.025);
    }

    // Lead melody — 16-beat phrase
    const mel = [0, 2, 3, 5, 7, 5, 3, 2, 0, 3, 5, 7, 10, 7, 5, 3, 0, -1, -2, 0, 2, 3, 5, 3, 2, 0, -1, 0, 3, 2, 0, -2];
    if (n % 2 === 0) this._lead(this._n(mel[n % 32], 0), t, 0.65, 0.04);

    // Arp layer — fills the high end
    const arp = [7, 11, 14, 11, 7, 4, 7, 4, 5, 10, 12, 10, 5, 2, 3, 2, 7, 11, 14, 11, 7, 4, 3, 4, 5, 10, 12, 10, 5, 2, 0, 2];
    this._osc('square', this._n(arp[n % 32], 0), t + bp * 0.12, 0.28, 0.022, 2200);

    // Pad foundation — every 16 beats
    if (n % 16 === 0) {
      this._pad([this._n(0, -1), this._n(2, -1), this._n(4, -1), this._n(6, -1)], t, bp * 16, 0.03);
    }
  }

  // === BOSS — intense electronic assault ===
  _bossBeat(n) {
    const t = this.ctx.currentTime;
    const bp = 60 / this._bpm;

    // Drums
    if (n % 2 === 0) this._kick(t, 0.17);
    if (n % 2 === 1) this._snare(t, 0.06);
    this._hat(t, 0.028);
    if (n % 4 === 0) this._hat(t + bp * 0.5, 0.02);

    // Aggressive bass
    const bassLine = [0, -5, -2, -3, 0, -5, -2, -3, 0, -5, 3, 0, -2, -5, -2, 0, 0, -5, -2, -3, 3, -5, -2, 0, 0, -5, 3, 0, -2, -5, 0, -5];
    this._bass(this._n(bassLine[n % 32], -2), t, bp * 1.0, 0.18);

    // Stab chords — aggressive
    if (n % 8 === 0) this._chordStab([this._n(0, -1), this._n(3, -1), this._n(7, -1)], t, bp * 1.5, 0.04);
    if (n % 8 === 4) this._chordStab([this._n(-5, -1), this._n(-2, -1), this._n(3, -1)], t, bp * 1.2, 0.035);

    // Lead — threatening
    if (n % 2 === 0) {
      const bossMel = [0, 5, 3, 7, 0, 10, 7, 11, 0, 5, 3, 0, -2, 3, 0, -5, 0, 5, 3, 7, 10, 12, 7, 8, 0, 5, 3, 0, -2, -5, 3, 0];
      this._lead(this._n(bossMel[n % 32], 0), t, 0.45, 0.05);
    }

    // High arp
    const arp = [14, 10, 7, 3, 12, 7, 3, 0, 11, 7, 5, 2, 10, 5, 2, -2];
    this._osc('square', this._n(arp[n % 16], 0), t + bp * 0.08, 0.18, 0.03, 2800);

    // Alarm tone
    if (n % 8 === 0) {
      this._osc('sawtooth', this._n(0, 1), t, bp * 1.0, 0.05);
      this._osc('sawtooth', this._n(7, 0), t + 0.03, bp * 1.0, 0.04);
    }

    // Dark pad
    if (n % 16 === 0) {
      this._pad([this._n(0, -1), this._n(3, -1), this._n(7, -1)], t, bp * 16, 0.04);
    }
  }

  // === PUBLIC API ===

  start() {
    if (this._running) return;
    this._running = true;
    this._nextBeat = this.ctx.currentTime;
    this._beat = 0;
    this._scheduleLoop();
  }

  stop() {
    this._running = false;
    this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
  }

  switchMode(mode, wave = 1) {
    this.currentMode = mode;
    this.currentWave = wave;
    if (mode === 'menu') { this._bpm = 70; this._fadeTarget = 0.14; }
    else if (mode === 'boss') { this._bpm = 88 + wave * 1.5; this._fadeTarget = 0.12; }
    else { this._bpm = 82 + Math.min(wave, 18) * 0.8; this._fadeTarget = 0.11; }
    this._nextBeat = this.ctx.currentTime + 0.1;
    this._beat = 0;
  }

  _scheduleLoop() {
    if (!this._running) return;
    const bp = 60 / this._bpm;
    const now = this.ctx.currentTime;
    const lookAhead = 0.18;

    while (this._nextBeat < now + lookAhead) {
      const n = this._beat;
      if (this.currentMode === 'combat') this._combatBeat(n);
      else if (this.currentMode === 'boss') this._bossBeat(n);
      else this._menuBeat(n);
      this._nextBeat += bp;
      this._beat++;
    }

    if (Math.abs(this._fadeCurrent - this._fadeTarget) > 0.0005) {
      this._fadeCurrent += (this._fadeTarget - this._fadeCurrent) * 0.03;
      this.masterGain.gain.value = Math.max(0, this._fadeCurrent);
    }

    setTimeout(() => this._scheduleLoop(), 40);
  }

  fadeIn(target = 0.12) { this._fadeTarget = target; }
  fadeOut() { this._fadeTarget = 0.0001; }
}

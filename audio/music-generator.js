// === Cyber-Synth Procedural Music Generator v2 ===
// Electronic BGM — richer melodies, less drum-heavy

class CyberSynth {
  constructor(ctx) {
    this.ctx = ctx;
    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 0.06;
    this.masterGain.connect(ctx.destination);

    this.currentMode = 'menu';
    this.currentWave = 1;
    this._running = false;
    this._nextBeat = 0;
    this._bpm = 70;
    this._beat = 0;
    this._fadeTarget = 0.06;
    this._fadeCurrent = 0.06;
    this._melodyPhase = 0;
  }

  // === OSCILLATOR HELPERS ===

  _osc(type, freq, time, dur, gain = 0.1, filterFreq = 0) {
    const osc = this.ctx.createOscillator();
    osc.type = type; osc.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(gain, time + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, time + dur);
    let dest = g;
    if (filterFreq > 0) {
      const f = this.ctx.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = filterFreq; f.Q.value = 2;
      osc.connect(f); f.connect(g);
    } else { osc.connect(g); }
    g.connect(this.masterGain);
    osc.start(time); osc.stop(time + dur + 0.05);
  }

  _lead(freq, time, dur, gain = 0.07) {
    // Rich lead synth — saw + square detuned
    this._osc('sawtooth', freq, time, dur, gain * 0.6, 1200);
    this._osc('square', freq * 1.003, time, dur, gain * 0.4, 1000);
  }

  _bass(freq, time, dur, gain = 0.14) {
    this._osc('sawtooth', freq, time, dur, gain * 0.5, 500);
    this._osc('triangle', freq * 0.5, time, dur, gain * 0.8);
  }

  _pad(noteFreqs, time, dur, gain = 0.04) {
    noteFreqs.forEach(f => {
      this._osc('sawtooth', f, time, dur, gain * 0.4, 300);
      this._osc('triangle', f * 1.005, time, dur, gain * 0.3, 250);
    });
  }

  _kick(time, gain = 0.16) {
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(35, time + 0.1);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.13);
    osc.connect(g); g.connect(this.masterGain);
    osc.start(time); osc.stop(time + 0.15);
  }

  _snare(time, gain = 0.04) {
    this._osc('triangle', 180, time, 0.07, gain * 0.6);
    const buf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.04), this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 5000;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain * 1.2, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
    src.connect(hp); hp.connect(g); g.connect(this.masterGain);
    src.start(time);
  }

  _hat(time, gain = 0.025) {
    const buf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.03), this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 8000;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.025);
    src.connect(hp); hp.connect(g); g.connect(this.masterGain);
    src.start(time);
  }

  // === SCALE SYSTEM (C Phrygian — dark electronic) ===
  _n(n, oct = 0) {
    const base = [261.63, 277.18, 311.13, 349.23, 392.00, 415.30, 466.16];
    const idx = ((n % 7) + 7) % 7;
    const octShift = Math.floor(n / 7) + oct;
    return base[idx] * Math.pow(2, octShift);
  }

  // === MENU — atmospheric cyber ambient ===
  _menuBeat(n) {
    const t = this.ctx.currentTime;
    // Evolving pad — every 16 beats
    if (n % 16 === 0) {
      const root = [0, -2, -4, 2][(n / 16) % 4];
      this._pad([this._n(root, -1), this._n(root + 2, -1), this._n(root + 4, -1), this._n(root + 6, -1)], t, 60/70 * 16, 0.04);
    }
    // Gentle melody — every 4 beats
    if (n % 4 === 0) {
      const mel = [0, 3, 5, 7, 5, 3, 0, -1, 0, 2, 3, 2, 0, -1, -3, -1][(n / 4) % 16];
      this._lead(this._n(mel, 0), t, 1.8, 0.025);
    }
    // Subtle bass pulse — every 8 beats
    if (n % 8 === 0) {
      this._bass(this._n(0, -2), t, 2.5, 0.06);
    }
  }

  // === COMBAT — driving synthwave ===
  _combatBeat(n) {
    const t = this.ctx.currentTime;
    const bp = 60 / this._bpm;
    // Drums — lighter than before
    if (n % 4 === 0) this._kick(t, 0.12);
    if (n % 4 === 2) this._snare(t, 0.04);
    if (n % 2 === 1) this._hat(t, 0.02);

    // Grooving bass — 8-beat pattern
    const bassPat = [0, 0, 0, 0, -2, -2, -2, -2, 3, 3, 3, 3, -4, -4, -4, -4];
    if (n % 2 === 0) this._bass(this._n(bassPat[n % 16], -2), t, bp * 1.6, 0.1);

    // Lead melody — 8-beat phrase
    const leadMel = [0, 2, 3, 5, 7, 5, 3, 2, 0, 3, 5, 7, 10, 7, 5, 3];
    if (n % 2 === 0) this._lead(this._n(leadMel[n % 16], 0), t, 0.7, 0.03);

    // Arp counter-melody — 4-beat cycle
    if (n % 1 === 0) {
      const arp = [7, 11, 14, 11, 7, 4, 7, 4, 5, 10, 12, 10, 5, 2, 3, 2];
      this._osc('square', this._n(arp[n % 16], 0), t + bp * 0.25, 0.3, 0.018, 2000);
    }

    // Pad swell — every 16 beats
    if (n % 16 === 0) {
      const chord = [0, 2, 4, 6];
      this._pad(chord.map(c => this._n(c, -1)), t, bp * 16, 0.025);
    }
  }

  // === BOSS — intense cyber onslaught ===
  _bossBeat(n) {
    const t = this.ctx.currentTime;
    const bp = 60 / this._bpm;

    // Drums — driving but not overwhelming
    if (n % 2 === 0) this._kick(t, 0.15);
    if (n % 2 === 1) this._snare(t, 0.05);
    this._hat(t, 0.022);
    if (n % 4 === 0) this._hat(t + bp * 0.5, 0.018);

    // Aggressive bass — 4-beat pattern
    const bassLine = [0, -5, -2, -3, 0, -5, -2, -3, 0, -5, 3, 0, -2, -5, -2, 0];
    this._bass(this._n(bassLine[n % 16], -2), t, bp * 1.1, 0.16);

    // Menacing lead — 4-beat phrase
    if (n % 2 === 0) {
      const bossMel = [0, 5, 3, 7, 0, 10, 7, 11, 0, 5, 3, 0, -2, 3, 0, -5];
      this._lead(this._n(bossMel[n % 16], 0), t, 0.5, 0.04);
    }

    // Fast arp — every beat
    const arp = [14, 10, 7, 3, 12, 7, 3, 0, 11, 7, 5, 2, 10, 5, 2, -2];
    this._osc('square', this._n(arp[n % 16], 0), t + bp * 0.12, 0.2, 0.025, 2500);

    // Alarm chord — every 8 beats
    if (n % 8 === 0) {
      this._osc('sawtooth', this._n(0, 1), t, bp * 1.2, 0.04);
      this._osc('sawtooth', this._n(7, 0), t + 0.02, bp * 1.2, 0.03);
    }

    // Dark pad
    if (n % 16 === 0) {
      this._pad([this._n(0, -1), this._n(3, -1), this._n(7, -1)], t, bp * 16, 0.03);
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
    if (mode === 'menu') this._bpm = 70;
    else if (mode === 'boss') this._bpm = 88 + wave * 1.5;
    else this._bpm = 82 + Math.min(wave, 18) * 0.8;
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

  fadeIn(target = 0.06) { this._fadeTarget = target; }
  fadeOut() { this._fadeTarget = 0.0001; }
}

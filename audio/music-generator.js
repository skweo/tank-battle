// === Cyber-Synth Procedural Music Generator ===
// Generates electronic BGM using Web Audio API — no external files needed

class CyberSynth {
  constructor(ctx) {
    this.ctx = ctx;
    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 0.08; // Low master — music is background
    this.masterGain.connect(ctx.destination);

    this.currentMode = 'menu'; // menu | combat | boss
    this.currentWave = 1;
    this.scheduledNodes = [];
    this._running = false;
    this._nextBeat = 0;
    this._bpm = 80;
    this._beat = 0;
    this._phase = 0;
    this._fadeTarget = 0.08;
    this._fadeCurrent = 0.08;
  }

  // === SOUND GENERATORS ===

  _osc(type, freq, duration, gain = 0.15, dest = this.masterGain) {
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, this.ctx.currentTime);
    g.gain.linearRampToValueAtTime(gain, this.ctx.currentTime + 0.01);
    g.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);
    osc.connect(g); g.connect(dest);
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + duration + 0.05);
    return osc;
  }

  _noise(duration, gain = 0.06, dest = this.masterGain) {
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800 + Math.random() * 2400;
    filter.Q.value = 1.5;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, this.ctx.currentTime);
    g.gain.linearRampToValueAtTime(gain, this.ctx.currentTime + 0.01);
    g.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);
    src.connect(filter); filter.connect(g); g.connect(dest);
    src.start(this.ctx.currentTime);
    return src;
  }

  _bass(freq, duration, gain = 0.2) {
    const saw = this._osc('sawtooth', freq, duration, gain * 0.5);
    const sub = this._osc('sine', freq * 0.5, duration, gain);
  }

  // === INSTRUMENTS ===

  _synthPluck(freq, time, gain = 0.1) {
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = freq;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 6, time);
    filter.frequency.exponentialRampToValueAtTime(freq * 0.5, time + 0.12);
    filter.Q.value = 6;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(gain, time + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, time + duration);
    osc.connect(filter); filter.connect(g); g.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + duration + 0.05);
  }

  _pad(freq, time, duration, gain = 0.04) {
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sawtooth'; osc1.frequency.value = freq;
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sawtooth'; osc2.frequency.value = freq * 1.007;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    filter.Q.value = 0.5;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(gain, time + 0.3);
    g.gain.linearRampToValueAtTime(0, time + duration);
    osc1.connect(filter); osc2.connect(filter); filter.connect(g); g.connect(this.masterGain);
    osc1.start(time); osc2.start(time);
    osc1.stop(time + duration + 0.05); osc2.stop(time + duration + 0.05);
  }

  _kick(time, gain = 0.18) {
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.12);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    osc.connect(g); g.connect(this.masterGain);
    osc.start(time); osc.stop(time + 0.16);
  }

  _hat(time, gain = 0.04) {
    this._noise(0.05, gain);
    // Fix noise timing by scheduling it manually via an offset
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.05);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 6000;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
    src.connect(hp); hp.connect(g); g.connect(this.masterGain);
    src.start(time);
  }

  _snare(time, gain = 0.06) {
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.08);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    osc.connect(g); g.connect(this.masterGain);
    osc.start(time); osc.stop(time + 0.11);
    this._noise(0.06, gain * 1.2);
  }

  // === MUSICAL PATTERNS ===

  _note(n, octave = 0) {
    // Convert scale degree to frequency (C minor scale)
    const base = [261.63, 293.66, 311.13, 349.23, 392.00, 415.30, 466.16];
    const idx = (n % 7 + 7) % 7;
    const oct = Math.floor(n / 7) + octave;
    return base[idx] * Math.pow(2, oct);
  }

  // === MENU MUSIC — ambient, mysterious ===
  _playMenuBeat(n) {
    const t = this.ctx.currentTime;
    const beatLen = 60 / 70; // 70 BPM for menu

    // Slow pad chords — change every 8 beats
    if (n % 8 === 0) {
      const chordRoot = [0, -2, 3, 1][(n / 8) % 4];
      this._pad(this._note(chordRoot, 0), t, beatLen * 8, 0.05);
      this._pad(this._note(chordRoot + 2, -1), t, beatLen * 8, 0.035);
      this._pad(this._note(chordRoot + 4, -1), t, beatLen * 8, 0.03);
    }

    // Gentle pluck arpeggio — every 2 beats
    if (n % 2 === 0) {
      const arp = [0, 4, 7, 11, 7, 4][(n / 2) % 6];
      this._synthPluck(this._note(arp, 0), t, 0.6, 0.03);
    }

    // Occasional bass rumble
    if (n % 16 === 0) {
      this._kick(t, 0.08);
    }
  }

  // === COMBAT MUSIC — driving, tense ===
  _playCombatBeat(n) {
    const t = this.ctx.currentTime;
    const bp = 60 / this._bpm;

    // Kick — four on the floor
    if (n % 2 === 0) this._kick(t, 0.15);
    // Snare — backbeat
    if (n % 4 === 2) this._snare(t, 0.05);
    // Hi-hat — offbeat
    if (n % 1 === 0) this._hat(t + bp * 0.5, 0.025);

    // Bass line — root note every 2 beats
    const bassRoot = [0, 0, -2, -2, 3, 3, -4, -4][n % 8];
    this._bass(this._note(bassRoot, -2), bp * 1.5, 0.15);

    // Synth arp — 16th note pattern
    const arpNotes = [0, 4, 7, 11, 14, 11, 7, 4, 0, 2, 4, 5, 7, 5, 4, 2];
    const arpIdx = n % arpNotes.length;
    this._synthPluck(this._note(arpNotes[arpIdx], 0), t, 0.35, 0.04);

    // Rising pad — changes every 8 beats
    if (n % 8 === 0) {
      const chord = [0, 3, 5, 7][(n / 8) % 4];
      this._pad(this._note(chord, -1), t, bp * 8, 0.03);
    }
  }

  // === BOSS MUSIC — aggressive, urgent ===
  _playBossBeat(n) {
    const t = this.ctx.currentTime;
    const bp = 60 / this._bpm;

    // Fast kick — every beat
    this._kick(t, 0.2);
    // Snare — beats 2+4
    if (n % 2 === 1) this._snare(t, 0.08);
    // Double hi-hat
    this._hat(t, 0.03);
    this._hat(t + bp * 0.5, 0.03);

    // Aggressive bass — every beat
    const bassLine = [0, 0, 0, 0, -5, -5, -2, -2, 0, 0, 3, 3, -2, -2, -5, -5];
    this._bass(this._note(bassLine[n % 16], -2), bp * 1.2, 0.22);

    // Fast synth arp
    const arp = [0, 3, 7, 10, 14, 10, 7, 3, -2, 1, 4, 8, 11, 8, 4, 1];
    this._synthPluck(this._note(arp[n % 16], 0), t, 0.25, 0.06);

    // Alarm stab — every 8 beats
    if (n % 8 === 0) {
      this._osc('sawtooth', this._note(0, 1), bp * 1.5, 0.06);
      this._osc('sawtooth', this._note(7, 0), bp * 1.5, 0.04);
    }

    // Dark pad
    if (n % 16 === 0) {
      this._pad(this._note(0, -1), t, bp * 16, 0.04);
      this._pad(this._note(7, -1), t, bp * 16, 0.03);
    }
  }

  // === PUBLIC API ===

  start() {
    if (this._running) return;
    this._running = true;
    this._scheduleLoop();
  }

  stop() {
    this._running = false;
    this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
  }

  switchMode(mode, wave = 1) {
    this.currentMode = mode;
    this.currentWave = wave;
    if (mode === 'menu') this._bpm = 70;
    else if (mode === 'boss') this._bpm = 85 + wave * 2;
    else this._bpm = 78 + Math.min(wave, 20) * 1.2;
  }

  _scheduleLoop() {
    if (!this._running) return;

    const bp = 60 / this._bpm;
    const lookAhead = 0.15;
    const now = this.ctx.currentTime;

    // Schedule beats that haven't been scheduled yet
    while (this._nextBeat < now + lookAhead) {
      const beatNum = this._beat;
      const mode = this.currentMode;

      if (mode === 'combat') this._playCombatBeat(beatNum);
      else if (mode === 'boss') this._playBossBeat(beatNum);
      else this._playMenuBeat(beatNum);

      this._nextBeat += bp;
      this._beat++;
    }

    // Smooth fade
    if (Math.abs(this._fadeCurrent - this._fadeTarget) > 0.001) {
      this._fadeCurrent += (this._fadeTarget - this._fadeCurrent) * 0.02;
      this.masterGain.gain.value = this._fadeCurrent;
    }

    setTimeout(() => this._scheduleLoop(), 50);
  }

  fadeIn(target = 0.08) { this._fadeTarget = target; }
  fadeOut() { this._fadeTarget = 0.001; }
}

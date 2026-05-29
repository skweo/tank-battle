// === Cyber-Synth Procedural Music v4 ===
// Multiple track presets, Hollow Knight-inspired mood, higher volume

class CyberSynth {
  constructor(ctx) {
    this.ctx = ctx;
    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 0.18;
    this.masterGain.connect(ctx.destination);

    // Reverb chain — deeper space
    this.preVerb = ctx.createGain(); this.preVerb.gain.value = 0.35;
    this.delay1 = ctx.createDelay(0.22); this.delay2 = ctx.createDelay(0.35);
    this.feedback1 = ctx.createGain(); this.feedback1.gain.value = 0.12;
    this.feedback2 = ctx.createGain(); this.feedback2.gain.value = 0.08;
    this.verbOut = ctx.createGain(); this.verbOut.gain.value = 0.5;
    this.preVerb.connect(this.delay1); this.preVerb.connect(this.delay2);
    this.delay1.connect(this.feedback1); this.feedback1.connect(this.delay1);
    this.delay2.connect(this.feedback2); this.feedback2.connect(this.delay2);
    this.delay1.connect(this.verbOut); this.delay2.connect(this.verbOut);
    this.verbOut.connect(this.masterGain);

    // Track selection
    this._menuTracks = ['menu_crystal', 'menu_void', 'menu_echo'];
    this._combatTracks = ['combat_pulse', 'combat_chase', 'combat_siege'];
    this._bossTracks = ['boss_abyss', 'boss_judgment'];
    this._activeTrack = 'menu_crystal';
    this._trackPool = [];

    this.currentMode = 'menu';
    this.currentWave = 1;
    this._running = false;
    this._nextBeat = 0;
    this._bpm = 70;
    this._beat = 0;
    this._fadeTarget = 0.18;
    this._fadeCurrent = 0.18;
  }

  // Reverb send for instruments
  _sendToVerb(src) { src.connect(this.preVerb); }

  // === OSCILLATORS ===
  _osc(type, freq, time, dur, gain = 0.1, filterFreq = 0, verb = true) {
    const osc = this.ctx.createOscillator();
    osc.type = type; osc.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(gain, time + 0.008);
    g.gain.exponentialRampToValueAtTime(0.001, time + dur);
    if (filterFreq > 0) {
      const f = this.ctx.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = filterFreq; f.Q.value = 1.2;
      osc.connect(f); f.connect(g);
    } else { osc.connect(g); }
    g.connect(this.masterGain);
    if (verb) this._sendToVerb(g);
    osc.start(time); osc.stop(time + dur + 0.05);
  }

  // === INSTRUMENTS ===

  _lead(freq, time, dur, gain = 0.08) {
    this._osc('sawtooth', freq, time, dur, gain * 0.6, 1800);
    this._osc('triangle', freq * 1.003, time, dur, gain * 0.4, 1200);
    this._osc('square', freq * 2, time, dur, gain * 0.12, 3500, false);
  }

  _bass(freq, time, dur, gain = 0.14) {
    this._osc('sawtooth', freq, time, dur, gain * 0.45, 350, false);
    this._osc('triangle', freq * 0.5, time, dur, gain * 0.7, 0, false);
  }

  _pad(notes, time, dur, gain = 0.045) {
    notes.forEach(f => {
      this._osc('sawtooth', f, time, dur, gain * 0.4, 280);
      this._osc('triangle', f * 1.005, time + 0.03, dur, gain * 0.3, 220);
    });
  }

  _chordStab(notes, time, dur, gain = 0.05) {
    notes.forEach(f => this._osc('square', f, time, dur, gain, 600));
  }

  _bell(freq, time, dur, gain = 0.06) {
    this._osc('sine', freq, time, dur * 0.6, gain);
    this._osc('sine', freq * 2.76, time, dur * 0.3, gain * 0.3, 5000, false);
    this._osc('sine', freq * 5.4, time, dur * 0.15, gain * 0.15, 8000, false);
  }

  _kick(time, gain = 0.15) {
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + 0.1);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.13);
    osc.connect(g); g.connect(this.masterGain);
    osc.start(time); osc.stop(time + 0.15);
  }

  _snare(time, gain = 0.045) {
    this._osc('triangle', 200, time, 0.06, gain * 0.6, 0, false);
    const buf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.04), this.ctx.sampleRate);
    for (let i = 0; i < buf.length; i++) buf.getChannelData(0)[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const hp = this.ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 4000;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain * 1.2, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    src.connect(hp); hp.connect(g); g.connect(this.masterGain);
    src.start(time);
  }

  _hat(time, gain = 0.025) {
    const buf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.02), this.ctx.sampleRate);
    for (let i = 0; i < buf.length; i++) buf.getChannelData(0)[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const hp = this.ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 9000;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.018);
    src.connect(hp); hp.connect(g); g.connect(this.masterGain);
    src.start(time);
  }

  // === SCALE: C Phrygian + Dorian flavor ===
  _n(n, oct = 0) {
    const base = [261.63, 277.18, 311.13, 349.23, 392.00, 415.30, 466.16];
    const idx = ((n % 7) + 7) % 7;
    return base[idx] * Math.pow(2, Math.floor(n / 7) + oct);
  }

  // ============================================
  // === MENU TRACKS ===
  // ============================================

  // Track 1: Crystal — bright, mysterious bells
  _menuCrystal(n) {
    const t = this.ctx.currentTime; const bp = 60 / 70;
    if (n % 32 === 0) {
      this._pad([this._n(0,-1),this._n(2,-1),this._n(4,-1),this._n(6,-1),this._n(0,0)], t, bp*32, 0.05);
      this._pad([this._n(-2,-2),this._n(0,-2),this._n(3,-2)], t+bp*0.5, bp*32, 0.035);
    }
    if (n % 16 === 0) {
      this._chordStab([this._n(0,-1),this._n(2,-1),this._n(5,-1)], t+bp*0.4, bp*4, 0.02);
    }
    if (n % 3 === 0) {
      const mel = [0,2,4,5,7,5,4,2,0,-2,0,2,4,2,0,-2, -1,0,2,4,5,4,2,0];
      this._bell(this._n(mel[n%24], 0), t, 1.8, 0.05);
    }
    if (n % 6 === 1) this._osc('triangle', this._n([7,11,14,11][(n/6)%4], 0), t+bp*0.2, 0.8, 0.018, 3000);
    if (n % 24 === 0) this._osc('sine', this._n(0, -2), t, 3.5, 0.03, 0, false);
  }

  // Track 2: Void — deep, haunting pads
  _menuVoid(n) {
    const t = this.ctx.currentTime; const bp = 60 / 70;
    if (n % 24 === 0) {
      this._pad([this._n(-4,-1),this._n(0,-1),this._n(3,-1),this._n(7,-1)], t, bp*24, 0.055);
    }
    if (n % 12 === 0) this._pad([this._n(-2,-2),this._n(0,-2),this._n(5,-2)], t+bp*0.6, bp*12, 0.03);
    if (n % 4 === 0) {
      const mel = [-2,0,3,5,3,0,-2,-3, -4,-2,0,3,5,3,0,-2];
      this._lead(this._n(mel[(n/4)%16], 0), t, 2.2, 0.03);
    }
    if (n % 8 === 0) this._bell(this._n([0,3,7,3][(n/8)%4], 0), t+bp*0.3, 2.5, 0.035);
    if (n % 16 === 0) this._osc('sine', this._n(-4, -2), t, 3.0, 0.035, 0, false);
  }

  // Track 3: Echo — gentle, melancholic arpeggios
  _menuEcho(n) {
    const t = this.ctx.currentTime; const bp = 60 / 65;
    if (n % 20 === 0) {
      this._pad([this._n(0,-1),this._n(4,-1),this._n(7,-1),this._n(11,-1)], t, bp*20, 0.045);
    }
    if (n % 2 === 0) {
      const arp = [0,4,7,11,14,11,7,4, 2,5,9,12,14,12,9,5, 3,7,10,14,17,14,10,7];
      this._bell(this._n(arp[n%24], -1), t, 0.7, 0.03);
    }
    if (n % 5 === 0) {
      const mel = [0,3,5,7,10,7,5,3,2,5,7,9,12,9,7,5];
      this._osc('triangle', this._n(mel[(n/5)%16], 0), t+bp*0.15, 1.2, 0.022, 2000);
    }
    if (n % 20 === 0) this._osc('sine', this._n(0, -2), t, 3.0, 0.028, 0, false);
  }

  // ============================================
  // === COMBAT TRACKS ===
  // ============================================

  // Track 1: Pulse — driving synthwave
  _combatPulse(n) {
    const t = this.ctx.currentTime; const bp = 60 / this._bpm;
    if (n % 4 === 0) this._kick(t, 0.13);
    if (n % 4 === 2) this._snare(t, 0.045);
    if (n % 2 === 1) this._hat(t, 0.022);
    const bassPat = [0,0,0,0,-2,-2,-2,-2,3,3,3,3,-4,-4,0,0];
    if (n % 2 === 0) this._bass(this._n(bassPat[n%16], -2), t, bp*1.5, 0.11);
    if (n % 8 === 0) this._chordStab([this._n(0,-1),this._n(2,-1),this._n(4,-1)], t, bp*2.5, 0.025);
    if (n % 8 === 4) this._chordStab([this._n(-2,-1),this._n(0,-1),this._n(3,-1)], t, bp*2.5, 0.022);
    const mel = [0,2,3,5,7,5,3,2, 0,3,5,7,10,7,5,3, 0,-1,-2,0,2,3,5,3, 2,0,-1,0,3,2,0,-2];
    if (n % 2 === 0) this._lead(this._n(mel[n%32], 0), t, 0.6, 0.038);
    const arp = [7,11,14,11,7,4,7,4, 5,10,12,10,5,2,3,2, 7,11,14,11,7,4,3,4, 5,10,12,10,5,2,0,2];
    this._osc('square', this._n(arp[n%32], 0), t+bp*0.1, 0.25, 0.02, 2200);
    if (n % 16 === 0) this._pad([this._n(0,-1),this._n(2,-1),this._n(4,-1),this._n(6,-1)], t, bp*16, 0.025);
  }

  // Track 2: Chase — urgent, tense strings feel
  _combatChase(n) {
    const t = this.ctx.currentTime; const bp = 60 / (this._bpm + 3);
    if (n % 4 === 0) this._kick(t, 0.12);
    if (n % 4 === 2) this._snare(t, 0.04);
    if (n % 1 === 0 && n % 2 === 1) this._hat(t, 0.02);
    const bassPat = [0,-5,-2,-3, 3,-5,-2,0, 0,-5,3,0, -2,-5,0,-3];
    this._bass(this._n(bassPat[n%16], -2), t, bp*0.9, 0.12);
    if (n % 8 === 0) this._chordStab([this._n(0,-1),this._n(3,-1),this._n(7,-1)], t, bp*1.8, 0.028);
    if (n % 3 === 0) {
      const mel = [0,5,3,7,10,7,5,3, 0,3,7,10,12,10,7,5, 3,7,10,14,12,10,7,3, 0,5,3,0,-2,0,3,5];
      this._lead(this._n(mel[n%32], 0), t, 0.55, 0.04);
    }
    if (n % 2 === 0) this._bell(this._n([7,10,14,10,7,3,5,7][(n/2)%8], 0), t+bp*0.15, 0.4, 0.018);
    if (n % 16 === 0) this._pad([this._n(-2,-1),this._n(0,-1),this._n(3,-1)], t, bp*16, 0.022);
  }

  // Track 3: Siege — heavy, impending doom
  _combatSiege(n) {
    const t = this.ctx.currentTime; const bp = 60 / (this._bpm - 2);
    if (n % 4 === 0) this._kick(t, 0.15);
    if (n % 4 === 2) this._snare(t, 0.05);
    if (n % 8 === 0) this._hat(t+bp*0.5, 0.022);
    const bassPat = [0,-5,-7,-5, 3,-5,-2,0, 0,-5,-2,-5, 3,0,-2,-5];
    this._bass(this._n(bassPat[n%16], -2), t, bp*1.0, 0.14);
    if (n % 8 === 0) this._chordStab([this._n(-5,-2),this._n(0,-1),this._n(3,-1)], t, bp*2, 0.03);
    if (n % 2 === 0) {
      const mel = [0,-5,3,0,7,3,10,7, 0,-5,3,7,10,7,3,0, -2,-7,0,-2,5,0,7,3, 0,-5,-2,-7,0,-5,3,-2];
      this._lead(this._n(mel[n%32], 0), t, 0.5, 0.045);
    }
    this._osc('square', this._n([7,11,14,17,14,11,7,4][n%8], 0), t+bp*0.08, 0.22, 0.022, 2000);
    if (n % 16 === 0) this._pad([this._n(-5,-1),this._n(0,-1),this._n(3,-1),this._n(7,-1)], t, bp*16, 0.03);
  }

  // ============================================
  // === BOSS TRACKS ===
  // ============================================

  _bossAbyss(n) {
    const t = this.ctx.currentTime; const bp = 60 / this._bpm;
    if (n % 2 === 0) this._kick(t, 0.16);
    if (n % 2 === 1) this._snare(t, 0.055);
    this._hat(t, 0.025);
    if (n % 4 === 0) this._hat(t+bp*0.5, 0.02);
    const bassLine = [0,-5,-2,-3, 0,-5,-2,-3, 0,-5,3,0, -2,-5,-2,0, 0,-5,-2,-3, 3,-5,-2,0, 0,-5,3,0, -2,-5,0,-5];
    this._bass(this._n(bassLine[n%32], -2), t, bp*0.95, 0.16);
    if (n % 8 === 0) this._chordStab([this._n(0,-1),this._n(3,-1),this._n(7,-1)], t, bp*1.2, 0.035);
    if (n % 8 === 4) this._chordStab([this._n(-5,-1),this._n(-2,-1),this._n(3,-1)], t, bp*1.0, 0.03);
    if (n % 2 === 0) {
      const bossMel = [0,5,3,7,0,10,7,11, 0,5,3,0,-2,3,0,-5, 0,5,3,7,10,12,7,8, 0,5,3,0,-2,-5,3,0];
      this._lead(this._n(bossMel[n%32], 0), t, 0.4, 0.048);
    }
    const arp = [14,10,7,3,12,7,3,0,11,7,5,2,10,5,2,-2, 14,10,7,3,12,7,3,0,11,7,5,2,10,5,2,-2];
    this._osc('square', this._n(arp[n%32], 0), t+bp*0.06, 0.16, 0.028, 2800);
    if (n % 8 === 0) { this._osc('sawtooth',this._n(0,1),t,bp,0.045); this._osc('sawtooth',this._n(7,0),t+0.02,bp,0.035); }
    if (n % 16 === 0) this._pad([this._n(0,-1),this._n(3,-1),this._n(7,-1)], t, bp*16, 0.035);
  }

  _bossJudgment(n) {
    const t = this.ctx.currentTime; const bp = 60 / (this._bpm + 4);
    if (n % 2 === 0) this._kick(t, 0.17);
    if (n % 2 === 1) this._snare(t, 0.06);
    this._hat(t, 0.026);
    if (n % 3 === 0) this._hat(t+bp*0.5, 0.02);
    const bassLine = [0,-7,-5,-3, 0,-7,-5,0, 3,-5,0,-2, -5,-7,-2,0, 0,-7,-5,-3, 3,-5,0,-2, -5,-7,-2,3, 0,-5,-7,0];
    this._bass(this._n(bassLine[n%32], -2), t, bp*0.85, 0.17);
    if (n % 8 === 0) this._chordStab([this._n(0,-1),this._n(4,-1),this._n(7,-1),this._n(11,-1)], t, bp*1.5, 0.04);
    if (n % 2 === 0) {
      const mel = [0,7,5,10,7,12,10,14, 0,7,5,3,7,5,3,0, -2,5,3,7,5,10,7,12, 0,-2,-5,-2,0,3,5,7];
      this._lead(this._n(mel[n%32], 0), t, 0.42, 0.05);
    }
    this._bell(this._n([7,14,10,14,7,10,3,7][n%8], 0), t+bp*0.1, 0.3, 0.025);
    this._osc('square', this._n([17,14,10,7,3,7,10,14][n%8], 0), t+bp*0.06, 0.15, 0.025, 3000);
    if (n % 8 === 0) { this._osc('sawtooth',this._n(0,1),t,bp*1.2,0.05); this._osc('triangle',this._n(4,1),t+0.03,bp,0.03); }
    if (n % 16 === 0) this._pad([this._n(0,-1),this._n(4,-1),this._n(7,-1),this._n(11,-1)], t, bp*16, 0.04);
  }

  // ============================================
  // === DISPATCH ===
  // ============================================

  _playBeat(n) {
    const t = this.ctx.currentTime;
    switch (this._activeTrack) {
      // Menu
      case 'menu_crystal': this._menuCrystal(n); break;
      case 'menu_void': this._menuVoid(n); break;
      case 'menu_echo': this._menuEcho(n); break;
      // Combat
      case 'combat_pulse': this._combatPulse(n); break;
      case 'combat_chase': this._combatChase(n); break;
      case 'combat_siege': this._combatSiege(n); break;
      // Boss
      case 'boss_abyss': this._bossAbyss(n); break;
      case 'boss_judgment': this._bossJudgment(n); break;
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
    // Pick random track from pool for variety
    if (mode === 'menu') {
      this._activeTrack = this._menuTracks[Math.floor(Math.random() * this._menuTracks.length)];
      this._bpm = 70;
    } else if (mode === 'boss') {
      this._activeTrack = this._bossTracks[Math.floor(Math.random() * this._bossTracks.length)];
      this._bpm = 90 + wave * 1.5;
    } else {
      this._activeTrack = this._combatTracks[Math.floor(Math.random() * this._combatTracks.length)];
      this._bpm = 82 + Math.min(wave, 18) * 0.8;
    }
    this._fadeTarget = 0.18;
    this._nextBeat = this.ctx.currentTime + 0.1;
    this._beat = 0;
  }

  _scheduleLoop() {
    if (!this._running) return;
    const bp = 60 / this._bpm;
    const now = this.ctx.currentTime;
    while (this._nextBeat < now + 0.18) {
      this._playBeat(this._beat);
      this._nextBeat += bp;
      this._beat++;
    }
    if (Math.abs(this._fadeCurrent - this._fadeTarget) > 0.0005) {
      this._fadeCurrent += (this._fadeTarget - this._fadeCurrent) * 0.03;
      this.masterGain.gain.value = Math.max(0, this._fadeCurrent);
    }
    setTimeout(() => this._scheduleLoop(), 40);
  }

  fadeIn(target = 0.18) { this._fadeTarget = target; }
  fadeOut() { this._fadeTarget = 0.0001; }
}

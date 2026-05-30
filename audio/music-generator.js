// === Cyber-Synth v5 — Rich Layered Music ===
// Deeper arrangements: 4-5 simultaneous voices per beat

class CyberSynth {
  constructor(ctx) {
    this.ctx = ctx;
    this.masterGain = ctx.createGain(); this.masterGain.gain.value = 0.45;
    this.masterGain.connect(ctx.destination);
    // Cathedral reverb — Hollow Knight style space
    this.preVerb = ctx.createGain(); this.preVerb.gain.value = 0.45;
    this.d1 = ctx.createDelay(0.28); this.d2 = ctx.createDelay(0.52);
    this.f1 = ctx.createGain(); this.f1.gain.value = 0.15;
    this.f2 = ctx.createGain(); this.f2.gain.value = 0.08;
    this.vOut = ctx.createGain(); this.vOut.gain.value = 0.7;
    this.preVerb.connect(this.d1); this.preVerb.connect(this.d2);
    this.d1.connect(this.f1); this.f1.connect(this.d1);
    this.d2.connect(this.f2); this.f2.connect(this.d2);
    this.d1.connect(this.vOut); this.d2.connect(this.vOut);
    this.vOut.connect(this.masterGain);

    this._menuTracks = ['menu_crystal', 'menu_void', 'menu_echo'];
    this._combatTracks = ['combat_pulse', 'combat_chase', 'combat_siege'];
    this._bossTracks = ['boss_abyss', 'boss_judgment'];
    this._activeTrack = 'menu_crystal';
    this.currentMode = 'menu'; this.currentWave = 1;
    this._running = false; this._nextBeat = 0; this._bpm = 70; this._beat = 0;
    this._fadeTarget = 0.45; this._fadeCurrent = 0.38;
    this.intensity = 0.5;
  }

  _verb(src) { src.connect(this.preVerb); }

  // === RICH INSTRUMENTS ===
  _osc(type, freq, t, dur, g = 0.1, filt = 0, verb = true) {
    const osc = this.ctx.createOscillator(); osc.type = type; osc.frequency.value = freq;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(g, t + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    let dest = gain;
    if (filt > 0) { const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = filt; f.Q.value = 1.1; osc.connect(f); f.connect(gain); }
    else { osc.connect(gain); }
    gain.connect(this.masterGain);
    if (verb) this._verb(gain);
    osc.start(t); osc.stop(t + dur + 0.05);
  }

  // String swell — slow attack, orchestral feel
  _string(freq, t, dur, g = 0.05) {
    const osc = this.ctx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = freq;
    const osc2 = this.ctx.createOscillator(); osc2.type = 'triangle'; osc2.frequency.value = freq * 1.006;
    const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 600; f.Q.value = 0.5;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(g, t + 0.4); // Slow fade in
    gain.gain.linearRampToValueAtTime(g * 0.7, t + dur * 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(f); osc2.connect(f); f.connect(gain);
    gain.connect(this.masterGain); this._verb(gain);
    osc.start(t); osc2.start(t); osc.stop(t + dur + 0.05); osc2.stop(t + dur + 0.05);
  }

  // Nier-style vocal lead — sine with vibrato, emotional
  _vox(freq, t, dur, g = 0.06) {
    const osc = this.ctx.createOscillator(); osc.type = 'sine';
    const vib = this.ctx.createOscillator(); vib.type = 'sine';
    vib.frequency.value = 5.5; // Vibrato speed
    const vibGain = this.ctx.createGain(); vibGain.gain.value = 2.5; // Vibrato depth
    vib.connect(vibGain); vibGain.connect(osc.frequency);
    const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2000; f.Q.value = 0.7;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(g, t + 0.15);
    gain.gain.linearRampToValueAtTime(g * 0.8, t + dur * 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(f); f.connect(gain);
    gain.connect(this.masterGain); this._verb(gain);
    osc.start(t); vib.start(t); osc.stop(t + dur + 0.05); vib.stop(t + dur + 0.05);
  }

  // Rich lead — 3 osc detuned
  _lead(freq, t, dur, g = 0.07) {
    this._osc('sawtooth', freq, t, dur, g * 0.55, 1600);
    this._osc('square', freq * 1.004, t, dur, g * 0.3, 1200);
    this._osc('triangle', freq * 2, t, dur, g * 0.1, 3500, false);
  }

  // Thick bass — 3 osc
  _bass(freq, t, dur, g = 0.13) {
    this._osc('sawtooth', freq, t, dur, g * 0.4, 300, false);
    this._osc('triangle', freq * 0.5, t, dur, g * 0.65, 0, false);
    this._osc('square', freq * 0.25, t + 0.005, dur * 0.7, g * 0.3, 150, false);
  }

  // Lush pad — 2 saws detuned
  _pad(notes, t, dur, g = 0.04) {
    notes.forEach(f => {
      this._osc('sawtooth', f, t, dur, g * 0.35, 260);
      this._osc('triangle', f * 1.006, t + 0.02, dur, g * 0.28, 200);
    });
  }

  _chord(notes, t, dur, g = 0.04) {
    notes.forEach(f => this._osc('square', f, t, dur, g, 500));
  }

  // Bell with rich overtones
  _bell(freq, t, dur, g = 0.05) {
    this._osc('sine', freq, t, dur * 0.6, g);
    this._osc('sine', freq * 2.76, t, dur * 0.35, g * 0.25, 6000, false);
    this._osc('sine', freq * 5.4, t, dur * 0.18, g * 0.12, 9000, false);
    this._osc('sine', freq * 7.2, t + 0.01, dur * 0.1, g * 0.06, 11000, false);
  }

  // Arp — bright and fast
  _arp(freq, t, dur, g = 0.025) {
    this._osc('square', freq, t, dur, g, 2500);
    this._osc('triangle', freq * 2, t + 0.01, dur * 0.5, g * 0.15, 5000, false);
  }

  _kick(t, g = 0.14) {
    const osc = this.ctx.createOscillator(); osc.type = 'sine';
    osc.frequency.setValueAtTime(160, t); osc.frequency.exponentialRampToValueAtTime(28, t + 0.1);
    const gain = this.ctx.createGain(); gain.gain.setValueAtTime(g, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
    osc.connect(gain); gain.connect(this.masterGain); osc.start(t); osc.stop(t + 0.15);
  }

  _snare(t, g = 0.04) {
    this._osc('triangle', 200, t, 0.05, g * 0.5, 0, false);
    const buf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.04), this.ctx.sampleRate);
    for (let i = 0; i < buf.length; i++) buf.getChannelData(0)[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const hp = this.ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 4000;
    const gain = this.ctx.createGain(); gain.gain.setValueAtTime(g * 1.2, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    src.connect(hp); hp.connect(gain); gain.connect(this.masterGain); src.start(t);
  }

  _hat(t, g = 0.022) {
    const buf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.018), this.ctx.sampleRate);
    for (let i = 0; i < buf.length; i++) buf.getChannelData(0)[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const hp = this.ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 10000;
    const gain = this.ctx.createGain(); gain.gain.setValueAtTime(g, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.016);
    src.connect(hp); hp.connect(gain); gain.connect(this.masterGain); src.start(t);
  }

  _n(n, oct = 0) {
    const b = [261.63, 277.18, 311.13, 349.23, 392.00, 415.30, 466.16];
    return b[((n % 7) + 7) % 7] * Math.pow(2, Math.floor(n / 7) + oct);
  }

  // ============================================
  // === MENU — rich atmospheric layers ===
  // ============================================
  _menuCrystal(n) {
    const t = this.ctx.currentTime, bp = 60 / 70;
    const section = Math.floor(n / 48) % 2; // A/B sections, 48 beats each = 96 beat cycle
    const sn = n % 48;
    // Pad — changes per section
    if (sn === 0) {
      const chordRoot = section === 0 ? 0 : -4;
      this._pad([this._n(chordRoot,-1),this._n(chordRoot+2,-1),this._n(chordRoot+4,-1),this._n(chordRoot+6,-1),this._n(chordRoot,0)], t, bp*48, 0.045);
    }
    // Sub pad
    if (sn % 24 === 0) {
      const r = section === 0 ? [0,-2,-4,2][(sn/24)%2] : [-4,-2,0,3][(sn/24)%2];
      this._pad([this._n(r,-2),this._n(r+3,-2),this._n(r+5,-2)], t+bp*0.5, bp*24, 0.03);
    }
    // Bell melody — 48-beat phrase with 2 variations
    const mel = section === 0
      ? [0,2,4,5,7,5,4,2, 0,-2,0,2,4,2,0,-2, -1,0,2,4,5,4,2,0, 0,2,4,5,7,5,4,2, 3,5,7,10,12,10,7,5, 3,2,0,-2,0,2,3,5]
      : [3,2,0,-2,-4,-2,0,2, 3,5,3,2,0,2,3,5, 0,2,4,5,7,5,4,2, -1,0,2,4,5,4,2,0, -2,0,2,3,5,3,2,0, -1,0,2,4,5,4,2,0];
    if (sn % 3 === 0) this._bell(this._n(mel[sn%48], 0), t, 1.8, 0.04);
    // Sparkle
    if (sn % 8 === 1) {
      const sp = section === 0 ? [7,11,14,11,12,14,11,7] : [5,10,12,10,7,12,10,5];
      this._arp(this._n(sp[sn%8], 0), t+bp*0.2, 0.6, 0.015);
    }
    if (sn === 0) {
      // String swell opening — Hollow Knight style
      this._string(this._n(section===0?0:-4, -1), t, bp*12, 0.04);
      this._string(this._n(section===0?4:-2, -1), t+bp*0.5, bp*12, 0.03);
    }
    if (sn % 48 === 24) this._osc('sine', this._n(0, -2), t, 3.5, 0.02, 0, false);
    if (sn % 24 === 12) this._chord([this._n(0,-1),this._n(2,-1),this._n(5,-1)], t+bp*0.3, bp*4, 0.014);
  }

  _menuVoid(n) {
    const t = this.ctx.currentTime, bp = 60 / 70;
    if (n % 24 === 0) {
      this._pad([this._n(-4, -1), this._n(0, -1), this._n(3, -1), this._n(7, -1)], t, bp * 24, 0.05);
    }
    if (n % 12 === 0) this._pad([this._n(-2, -2), this._n(0, -2), this._n(5, -2)], t + bp * 0.5, bp * 12, 0.028);
    if (n % 4 === 0) {
      const mel = [-2, 0, 3, 5, 3, 0, -2, -3, -4, -2, 0, 3, 5, 3, 0, -2];
      this._lead(this._n(mel[(n / 4) % 16], 0), t, 2.2, 0.028);
    }
    if (n % 8 === 0) this._bell(this._n([0, 3, 7, 3][(n / 8) % 4], 0), t + bp * 0.25, 2.2, 0.03);
    if (n % 3 === 0) this._arp(this._n([7, 10, 14, 10, 12, 14, 10, 7][n % 8], 0), t + bp * 0.35, 0.5, 0.014);
    if (n % 16 === 0) this._osc('sine', this._n(-4, -2), t, 3.5, 0.03, 0, false);
  }

  _menuEcho(n) {
    const t = this.ctx.currentTime, bp = 60 / 65;
    if (n % 20 === 0) {
      this._pad([this._n(0, -1), this._n(4, -1), this._n(7, -1), this._n(11, -1)], t, bp * 20, 0.04);
    }
    if (n % 2 === 0) {
      const arp = [0, 4, 7, 11, 14, 11, 7, 4, 2, 5, 9, 12, 14, 12, 9, 5, 3, 7, 10, 14, 17, 14, 10, 7];
      this._bell(this._n(arp[n % 24], -1), t, 0.65, 0.028);
    }
    if (n % 5 === 0) {
      const mel = [0, 3, 5, 7, 10, 7, 5, 3, 2, 5, 7, 9, 12, 9, 7, 5];
      this._osc('triangle', this._n(mel[(n / 5) % 16], 0), t + bp * 0.12, 1.0, 0.02, 1800);
      this._arp(this._n(mel[(n / 5) % 16] + 7, 0), t + bp * 0.2, 0.55, 0.013);
    }
    if (n % 10 === 0) this._chord([this._n(0, -1), this._n(4, -1), this._n(7, -1)], t + bp * 0.4, bp * 3, 0.016);
    if (n % 20 === 0) this._osc('sine', this._n(0, -2), t, 3.0, 0.022, 0, false);
  }

  // ============================================
  // === COMBAT — dense layered arrangements ===
  // ============================================
  _combatPulse(n) {
    const t = this.ctx.currentTime, bp = 60 / this._bpm;
    const section = Math.floor(n / 72) % 3; // A(0-71) B(72-143) C(144-215)
    const sn = n % 72;

    // === SECTION A: Ambient intro — no drums, bell + vox ===
    if (section === 0) {
      if (sn === 0) this._pad([this._n(0,-1),this._n(2,-1),this._n(4,-1),this._n(6,-1)], t, bp*72, 0.04);
      if (sn % 24 === 0) {
        const bassNote = [0, -2, 3][sn/24];
        this._bass(this._n(bassNote, -2), t, bp*8, 0.07);
        this._string(this._n(bassNote, -1), t, bp*10, 0.03);
      }
      if (sn % 6 === 0) {
        const bellMel = [0,2,4,5,7,5,4,2, 0,-2,0,2,4,2,0,-1, 0,3,5,7,10,7,5,3, 2,0,-1,-2,0,2,3,5];
        this._bell(this._n(bellMel[(sn/6)%24], 0), t, 2.5, 0.04);
      }
      if (sn % 12 === 0) this._vox(this._n([0,3,5,7,10,7][(sn/12)%6], 0), t+bp*0.3, bp*5, 0.03);
      if (sn % 24 === 0) this._kick(t, 0.06);
      return;
    }

    if (section === 1) {
      // Minimal drums — only sparse kick + occasional snare
      if (sn === 0 || sn === 24 || sn === 48) this._kick(t, 0.14);
      if (sn === 12 || sn === 36 || sn === 60) this._kick(t, 0.10);
      if (sn === 18 || sn === 42) this._snare(t, 0.04);
      // No hats — they create the anxiety
      // Bass — slow, deep, breathing
      const bB = [0, -2, 3, -4, 0, -2, -5, 3];
      if (sn % 9 === 0) this._bass(this._n(bB[(sn/9)%8], -2), t, bp*2, 0.12);
      // Lead melody — sparse, emotional
      if (sn % 12 === 0 || sn % 12 === 6) {
        const melB = [0,3,5,7,10,7,5,3, 7,5,3,0,-2,3,5,7, 0,-2,0,3,5,3,2,0, 7,10,12,14,17,14,10,7];
        this._lead(this._n(melB[(sn/6)%16], 0), t, 0.45, 0.038);
      }
      // Soft bell accents instead of arp
      if (sn % 16 === 0) this._bell(this._n([0,3,7,10][(sn/16)%4], 0), t+bp*0.2, 2, 0.025);
      // Chords — wide, spaced
      if (sn === 0) this._chord([this._n(0,-1),this._n(3,-1),this._n(7,-1)], t, bp*12, 0.022);
      if (sn === 36) this._chord([this._n(-2,-1),this._n(0,-1),this._n(5,-1)], t, bp*8, 0.02);
      // Vox — floating
      if (sn % 24 === 12) this._vox(this._n([0,7,10][(sn/24)%3], 0), t+bp*0.2, bp*10, 0.025);
      if (sn === 0) this._pad([this._n(0,-1),this._n(3,-1),this._n(7,-1)], t, bp*72, 0.025);
      return;
    }

    // === SECTION C: Emotional — ambient, vox, no drums ===
    if (sn === 0) {
      this._pad([this._n(-2,-1),this._n(0,-1),this._n(3,-1),this._n(7,-1)], t, bp*72, 0.045);
      this._string(this._n(0, -1), t, bp*20, 0.04);
      this._string(this._n(3, -1), t+bp*3, bp*18, 0.03);
    }
    if (sn % 6 === 0) {
      const voxMelC = [0,3,5,7,10,7,5,3, 0,-2,0,3,5,3,2,0, 7,5,3,2,0,-2,-5,-2, 0,3,5,7,5,3,0,-2];
      this._vox(this._n(voxMelC[(sn/6)%24], 0), t, bp*4, 0.04);
    }
    if (sn % 8 === 4) this._bell(this._n([0,3,7,10,7,3][(sn/8)%6], 0), t+bp*0.3, 3, 0.03);
    if (sn === 0) this._bass(this._n(-2, -2), t, bp*8, 0.06);
    if (sn === 36) this._bass(this._n(0, -2), t, bp*8, 0.05);
    if (sn % 36 === 0) this._kick(t, 0.05);
  }
  _combatChase(n) {
    const t = this.ctx.currentTime, bp = 60 / (this._bpm + 3);
    // Minimal drums — no hats, sparse
    if (n % 16 === 0) this._kick(t, 0.12);
    if (n % 16 === 8) this._kick(t, 0.08);
    if (n % 32 === 16) this._snare(t, 0.035);
    // Slow bass pulse
    const bassP = [0, -5, 3, -2, 0, -5, 3, 0];
    if (n % 8 === 0) this._bass(this._n(bassP[(n/8)%8], -2), t, bp*3, 0.1);
    // Sparse melody
    if (n % 8 === 0) {
      const mel = [0, 5, 3, 7, 0, 10, 7, 11, 0, 3, 7, 10, 12, 10, 7, 5, 3, 7, 10, 14, 0, 5, 3, 0];
      this._lead(this._n(mel[(n/8)%24], 0), t, 0.45, 0.035);
    }
    if (n % 16 === 8) this._bell(this._n([0, 7, 10][(n/16)%3], 0), t+bp*0.3, 2, 0.022);
    if (n % 32 === 0) this._chord([this._n(0,-1),this._n(3,-1),this._n(7,-1)], t, bp*8, 0.022);
    if (n % 64 === 0) this._pad([this._n(-2,-1),this._n(0,-1),this._n(3,-1)], t, bp*64, 0.02);
    if (n % 16 === 0) this._vox(this._n([0,3,7][(n/16)%3], 0), t+bp*0.3, bp*8, 0.02);
  }

  _combatSiege(n) {
    const t = this.ctx.currentTime, bp = 60 / (this._bpm - 2);
    // Heavy but sparse — stomping, not clicking
    if (n % 12 === 0) this._kick(t, 0.15);
    if (n % 24 === 12) this._snare(t, 0.05);
    if (n % 48 === 36) this._snare(t, 0.06);
    // Deep bass
    const bassP = [0, -5, -7, 3, 0, -5, -2, 3];
    if (n % 6 === 0) this._bass(this._n(bassP[(n/6)%8], -2), t, bp*1.5, 0.14);
    // Heavy melody — slow
    if (n % 8 === 0) {
      const mel = [0, -5, 3, 7, 0, -5, 3, 10, 0, -7, 3, 0, -2, -5, 3, 7, 0, -5, -2, 3, 5, 0, 7, 10];
      this._lead(this._n(mel[(n/8)%24], 0), t, 0.42, 0.04);
    }
    // Bell accent
    if (n % 16 === 0) this._bell(this._n([0, 3, 7][(n/16)%3], 0), t+bp*0.2, 2, 0.025);
    if (n % 24 === 0) this._chord([this._n(-5,-2),this._n(0,-1),this._n(3,-1)], t, bp*4, 0.024);
    if (n % 48 === 0) this._pad([this._n(-5,-1),this._n(0,-1),this._n(3,-1),this._n(7,-1)], t, bp*48, 0.026);
    if (n % 24 === 0) this._vox(this._n([0,3,7][(n/24)%3], 0), t+bp*0.2, bp*10, 0.02);
  }

  // ============================================
  // === BOSS — aggressive rich onslaught ===
  // ============================================
  _bossAbyss(n) {
    const t = this.ctx.currentTime, bp = 60 / this._bpm;
    if (n % 2 === 0) this._kick(t, 0.15);
    if (n % 2 === 1) this._snare(t, 0.05);
    this._hat(t, 0.022);
    if (n % 4 === 0) this._hat(t + bp * 0.5, 0.016);
    const bl = [0, -5, -2, -3, 0, -5, -2, -3, 0, -5, 3, 0, -2, -5, -2, 0, 0, -5, -2, -3, 3, -5, -2, 0, 0, -5, 3, 0, -2, -5, 0, -5];
    this._bass(this._n(bl[n % 32], -2), t, bp * 0.9, 0.15);
    if (n % 8 === 0) this._chord([this._n(0, -1), this._n(3, -1), this._n(7, -1)], t, bp * 1.2, 0.032);
    if (n % 8 === 4) this._chord([this._n(-5, -1), this._n(-2, -1), this._n(3, -1)], t, bp * 1.0, 0.028);
    if (n % 2 === 0) {
      const mel = [0, 5, 3, 7, 0, 10, 7, 11, 0, 5, 3, 0, -2, 3, 0, -5, 0, 5, 3, 7, 10, 12, 7, 8, 0, 5, 3, 0, -2, -5, 3, 0];
      this._lead(this._n(mel[n % 32], 0), t, 0.4, 0.044);
    }
    const arp = [14, 10, 7, 3, 12, 7, 3, 0, 11, 7, 5, 2, 10, 5, 2, -2, 14, 10, 7, 3, 12, 7, 3, 0, 11, 7, 5, 2, 10, 5, 2, -2];
    this._arp(this._n(arp[n % 32], 0), t + bp * 0.06, 0.15, 0.024);
    if (n % 8 === 0) { this._osc('sawtooth', this._n(0, 1), t, bp, 0.04); this._osc('sawtooth', this._n(7, 0), t + 0.02, bp, 0.032); }
    if (n % 16 === 0) this._pad([this._n(0, -1), this._n(3, -1), this._n(7, -1)], t, bp * 16, 0.03);
  }

  _bossJudgment(n) {
    const t = this.ctx.currentTime, bp = 60 / (this._bpm + 4);
    if (n % 2 === 0) this._kick(t, 0.16);
    if (n % 2 === 1) this._snare(t, 0.055);
    this._hat(t, 0.024);
    if (n % 3 === 0) this._hat(t + bp * 0.5, 0.018);
    const bl = [0, -7, -5, -3, 0, -7, -5, 0, 3, -5, 0, -2, -5, -7, -2, 0, 0, -7, -5, -3, 3, -5, 0, -2, -5, -7, -2, 3, 0, -5, -7, 0];
    this._bass(this._n(bl[n % 32], -2), t, bp * 0.8, 0.16);
    if (n % 8 === 0) this._chord([this._n(0, -1), this._n(4, -1), this._n(7, -1), this._n(11, -1)], t, bp * 1.4, 0.036);
    if (n % 2 === 0) {
      const mel = [0, 7, 5, 10, 7, 12, 10, 14, 0, 7, 5, 3, 7, 5, 3, 0, -2, 5, 3, 7, 5, 10, 7, 12, 0, -2, -5, -2, 0, 3, 5, 7];
      this._lead(this._n(mel[n % 32], 0), t, 0.38, 0.046);
    }
    this._bell(this._n([7, 14, 10, 14, 7, 10, 3, 7][n % 8], 0), t + bp * 0.08, 0.28, 0.022);
    this._arp(this._n([17, 14, 10, 7, 3, 7, 10, 14][n % 8], 0), t + bp * 0.05, 0.14, 0.022);
    if (n % 8 === 0) { this._osc('sawtooth', this._n(0, 1), t, bp * 1.1, 0.045); this._osc('triangle', this._n(4, 1), t + 0.02, bp, 0.028); }
    if (n % 16 === 0) this._pad([this._n(0, -1), this._n(4, -1), this._n(7, -1), this._n(11, -1)], t, bp * 16, 0.035);
  }

  // ============================================
  // === DISPATCH ===
  // ============================================
  _playBeat(n) {
    switch (this._activeTrack) {
      case 'menu_crystal': this._menuCrystal(n); break;
      case 'menu_void': this._menuVoid(n); break;
      case 'menu_echo': this._menuEcho(n); break;
      case 'combat_pulse': this._combatPulse(n); break;
      case 'combat_chase': this._combatChase(n); break;
      case 'combat_siege': this._combatSiege(n); break;
      case 'boss_abyss': this._bossAbyss(n); break;
      case 'boss_judgment': this._bossJudgment(n); break;
    }
  }

  start() {
    if (this._running) return;
    this._running = true; this._nextBeat = this.ctx.currentTime; this._beat = 0; this._scheduleLoop();
  }
  stop() { this._running = false; this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5); }

  switchMode(mode, wave = 1) {
    this.currentMode = mode; this.currentWave = wave;
    if (mode === 'menu') { this._activeTrack = this._menuTracks[Math.floor(Math.random() * this._menuTracks.length)]; this._bpm = 70; this._fadeTarget = 0.45; }
    else if (mode === 'boss') { this._activeTrack = this._bossTracks[Math.floor(Math.random() * this._bossTracks.length)]; this._bpm = 90 + wave * 1.5; this._fadeTarget = 0.48; }
    else { this._activeTrack = this._combatTracks[Math.floor(Math.random() * this._combatTracks.length)]; this._bpm = 82 + Math.min(wave, 18) * 0.8; this._fadeTarget = 0.42; }
    this._nextBeat = this.ctx.currentTime + 0.1; this._beat = 0; this.intensity = 0.5;
  }
  setIntensity(v) {
    this.intensity = Math.max(0, Math.min(1, v));
    if (this.currentMode === 'combat') { this._bpm = 82 + Math.min(this.currentWave, 18) * 0.8 + this.intensity * 10; this._fadeTarget = 0.12 + this.intensity * 0.06; }
  }

  _scheduleLoop() {
    if (!this._running) return;
    const bp = 60 / this._bpm, now = this.ctx.currentTime;
    while (this._nextBeat < now + 0.18) { this._playBeat(this._beat); this._nextBeat += bp; this._beat++; }
    if (Math.abs(this._fadeCurrent - this._fadeTarget) > 0.0005) {
      this._fadeCurrent += (this._fadeTarget - this._fadeCurrent) * 0.03;
      this.masterGain.gain.value = Math.max(0, this._fadeCurrent);
    }
    setTimeout(() => this._scheduleLoop(), 40);
  }
  fadeIn(t = 0.16) { this._fadeTarget = t; }
  fadeOut() { this._fadeTarget = 0.0001; }
}

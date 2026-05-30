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

    this._menuTracks = ['menu_crystal','menu_void','menu_echo', 'menu_pulse','menu_chase','menu_siege'];
    this._combatTracks = ['boss_abyss', 'boss_judgment'];
    this._bossTracks = ['boss_onslaught', 'boss_cataclysm'];
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

  // Piano — warm, natural overtones (1, 2, 3, 4x harmonics)
  _piano(freq, t, dur, g = 0.05) {
    this._osc('sine', freq, t, dur * 0.5, g);
    this._osc('sine', freq * 2, t + 0.003, dur * 0.3, g * 0.3, 4000, false);
    this._osc('sine', freq * 3, t + 0.005, dur * 0.15, g * 0.12, 6000, false);
    this._osc('sine', freq * 4, t + 0.008, dur * 0.08, g * 0.05, 8000, false);
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
    // Piano main melody — warm, epic
    if (sn % 3 === 0) this._piano(this._n(mel[sn%48], 0), t, 2.0, 0.045);
    // Bell accent — sparkle on top
    if (sn % 6 === 0) this._bell(this._n(mel[(sn+3)%48], 0), t+bp*0.15, 1.2, 0.02);
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
    const t = this.ctx.currentTime, bp = 60 / 65; // Slower, more spacious
    // Deep cathedral pad — ever-present, hollow
    if (n % 32 === 0) {
      this._pad([this._n(-4,-2),this._n(0,-1),this._n(3,-1),this._n(7,-1)], t, bp*32, 0.06);
    }
    if (n % 16 === 0) this._pad([this._n(-7,-2),this._n(-2,-1),this._n(0,-1)], t+bp*0.6, bp*16, 0.03);
    // Cello-like strings — slow, mournful melody
    if (n % 8 === 0) {
      const celloMel = [-4,-2,0,3, 0,-2,-4,-7, -2,0,3,7, 3,0,-2,-4, -7,-4,-2,0, 3,7,10,7, 3,0,-2,-4, -7,-4,0,3];
      this._string(this._n(celloMel[(n/8)%32], -1), t, bp*7, 0.04);
    }
    // Bell — distant, resonant (keep the "hollow" feel)
    if (n % 12 === 0) this._bell(this._n([0,3,7,10,7,3][(n/12)%6], 0), t+bp*0.3, 3, 0.035);
    // Second string layer — higher, ethereal
    if (n % 24 === 12) {
      this._string(this._n([3,7,10,14][(n/24)%4], 0), t, bp*10, 0.025);
    }
    // Deep bass — felt, not heard
    if (n % 32 === 0) this._bass(this._n(-4, -2), t, bp*6, 0.05);
    if (n % 32 === 16) this._bass(this._n(0, -2), t, bp*5, 0.04);
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
  _menuPulse(n) {
    const t = this.ctx.currentTime, bp = 60 / this._bpm;
    const section = Math.floor(n / 64) % 2;
    const sn = n % 64;
    const theme = [0,3,5,7, 3,2,0,-2, 0,3,7,10, 7,5,3,2, 0,3,5,7, 10,7,5,3, 2,0,-1,-2, 0,2,3,5, 3,2,0,-2, -2,-4,-2,0, 3,5,7,10, 12,10,7,5, 3,2,0,-2, -4,-2,0,3, 5,7,10,12, 14,12,10,7];
    // Theme B — higher, more urgent variation
    const themeB = [7,10,12,14, 10,7,5,3, 7,10,14,17, 14,10,7,5, 7,10,12,14, 17,14,10,7, 5,3,0,5, 7,10,12,14, 10,7,5,3, 0,-2,3,5, 7,10,14,17, 14,10,7,5, 7,3,0,-2, -5,-2,3,7, 10,7,3,0, -2,-5,0,3];

    if (section === 0) {
      // A: Quiet opening — bell alone, then slowly builds
      if (sn === 0) {
        this._pad([this._n(0,-1),this._n(3,-1),this._n(7,-1)], t, bp*64, 0.04);
        this._string(this._n(0, -1), t, bp*24, 0.035);
      }
      if (sn % 4 === 0) this._bell(this._n(theme[(sn/4)%64], 0), t, 2.8, 0.04);
      if (sn === 24) this._string(this._n(3, -1), t, bp*20, 0.03);
      if (sn % 16 === 0) this._bass(this._n([0,-2,0,-4][(sn/16)%4], -2), t, bp*4, 0.06);
      if (sn % 32 === 0) this._kick(t, 0.06);
      if (sn % 20 === 10) this._vox(this._n(theme[(sn/4)%64], 0), t+bp*0.3, bp*6, 0.02);
      return;
    }

    // B: IMMEDIATE contrast — drums hit on beat 0, theme soars
    if (sn === 0) {
      this._kick(t, 0.14); this._snare(t, 0.05); // OPENING IMPACT
      this._pad([this._n(0,-1),this._n(3,-1),this._n(7,-1)], t, bp*64, 0.05);
      this._string(this._n(7, -1), t, bp*16, 0.045);
      this._string(this._n(0, -1), t+bp*1, bp*14, 0.035);
      this._chord([this._n(0,-1),this._n(3,-1),this._n(7,-1)], t, bp*8, 0.025);
    }
    // Higher variation of theme
    if (sn % 4 === 0) {
      this._bell(this._n(themeB[(sn/4)%64], 0), t, 2.2, 0.035);
      if (sn % 8 === 0) this._lead(this._n(themeB[(sn/4)%64], 0), t, 0.4, 0.03);
    }
    if (sn % 8 === 4) this._vox(this._n(themeB[((sn-4)/4)%64], 1), t+bp*0.2, bp*4, 0.03);
    if (sn % 12 === 0) this._kick(t, 0.12);
    if (sn % 12 === 6) this._kick(t, 0.08);
    if (sn % 24 === 12) this._snare(t, 0.035);
    const bB = [0,0,0,0, -2,-2,-2,-2, 3,3,3,3, -4,-4,-4,-4, 0,0,-2,-2, 3,3,-4,-4, -5,-5,0,0, -2,-2,3,3];
    if (sn % 4 === 0) this._bass(this._n(bB[(sn/2)%32], -2), t, bp*1.5, 0.1);
    if (sn === 32) this._chord([this._n(-2,-1),this._n(0,-1),this._n(5,-1)], t, bp*6, 0.022);
  }
  _menuChase(n) {
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

  _menuSiege(n) {
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
    // YMO-style dense but groovy — interlocking rhythm layers
    // Drum layer — urgent but with swing
    if (n % 8 === 0) this._kick(t, 0.16);
    if (n % 8 === 4) this._kick(t+bp*0.25, 0.12);
    if (n % 4 === 2) this._snare(t, 0.05);
    if (n % 16 === 12) this._snare(t, 0.06);
    if (n % 3 === 1) this._hat(t, 0.02);
    // Drum fill every 32
    if (n % 32 === 28) { this._snare(t,0.05); this._snare(t+bp*0.5,0.04); this._snare(t+bp,0.03); }

    // Bass — melodic + rhythmic (YMO style)
    const bl = [0,-5,-2,-3, 0,-5,-2,-3, 0,-5,3,0, -2,-5,-2,0, 0,-5,-2,-3, 3,-5,-2,0, 0,-5,3,0, -2,-5,0,-5];
    this._bass(this._n(bl[n%32], -2), t, bp*0.85, 0.16);

    // Lead theme — filter-swept for evolving timbre
    if (n % 4 === 0) {
      const mel = [0,5,3,7,0,10,7,11, 0,5,3,0,-2,3,0,-5, 0,5,3,7,10,12,7,8, 0,5,3,0,-2,-5,3,0, 7,10,12,14,10,7,5,3, 0,5,3,7,10,7,5,3, 5,7,10,12,14,12,10,7, 5,3,0,-2,3,5,7,10];
      this._lead(this._n(mel[n%64], 0), t, 0.4, 0.045);
    }
    // Second lead voice — call-response
    if (n % 8 === 4) {
      const mel2 = [7,10,14,10, 12,14,10,7, 5,7,10,12, 14,10,7,5, 10,7,5,3, 7,5,3,0, 3,5,7,10, 12,10,7,5];
      this._arp(this._n(mel2[(n/4)%32], 0), t+bp*0.15, 0.2, 0.022);
    }
    // Rhythmic chord stabs — punchy
    if (n % 4 === 0) this._chord([this._n(0,-1),this._n(3,-1),this._n(7,-1)], t, bp*0.5, 0.03);
    if (n % 8 === 4) this._chord([this._n(-5,-1),this._n(-2,-1),this._n(3,-1)], t, bp*0.4, 0.025);
    // Vox layer — haunting
    if (n % 12 === 0) this._vox(this._n([0,7,10,7][(n/12)%4], 0), t+bp*0.25, bp*6, 0.03);
    // Bell accents — sparkle
    if (n % 8 === 2) this._bell(this._n([14,10,7,3, 10,7,3,0][n%8], 0), t+bp*0.1, 0.3, 0.02);
    // Alarm stab
    if (n % 16 === 0) { this._osc('sawtooth',this._n(0,1),t,bp*0.8,0.04); this._osc('sawtooth',this._n(7,0),t+0.02,bp*0.6,0.03); }
    // Dark pad
    if (n % 32 === 0) this._pad([this._n(0,-1),this._n(3,-1),this._n(7,-1)], t, bp*32, 0.03);
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

  _bossOnslaught(n) {
    const t = this.ctx.currentTime, bp = 60 / this._bpm;
    // Maximum intensity — dense drums, double bass, alarm chords
    if (n % 2 === 0) this._kick(t, 0.18);
    if (n % 2 === 1) this._snare(t, 0.06);
    if (n % 2 === 0) this._hat(t, 0.028);
    if (n % 4 === 0) this._hat(t+bp*0.5, 0.02);
    // Drum roll every 16
    if (n % 16 === 14) for (let d=0;d<4;d++) this._snare(t+d*bp*0.25, 0.05);
    // Driving bass — every beat
    const bl = [0,-7,-5,-3, 0,-7,-5,0, 3,-5,0,-2, -5,-7,-2,3, 0,-7,-5,-3, 3,-5,0,-2, -5,-7,-2,0, 0,-7,-5,-3];
    this._bass(this._n(bl[n%32], -2), t, bp*0.7, 0.18);
    // Aggressive chord stabs — every 2 beats
    if (n % 4 === 0) this._chord([this._n(0,-1),this._n(3,-1),this._n(7,-1)], t, bp*0.5, 0.04);
    if (n % 4 === 2) this._chord([this._n(-5,-1),this._n(-2,-1),this._n(3,-1)], t, bp*0.4, 0.035);
    // Lead — urgent
    if (n % 2 === 0) {
      const mel = [0,7,5,10,7,12,10,14, 0,7,5,3,7,5,3,0, -2,5,3,7,5,10,7,12, 0,-2,-5,-2,0,3,5,7];
      this._lead(this._n(mel[n%32], 0), t, 0.38, 0.05);
    }
    // Arp — high speed counterpoint
    this._arp(this._n([17,14,10,7,3,7,10,14, 17,14,10,7,3,7,10,14][n%16], 0), t+bp*0.08, 0.15, 0.025);
    // Alarm every 8
    if (n % 8 === 0) { this._osc('sawtooth',this._n(0,1),t,bp*0.8,0.05); this._osc('sawtooth',this._n(7,0),t+0.015,bp*0.7,0.04); }
    if (n % 16 === 0) this._pad([this._n(0,-1),this._n(3,-1),this._n(7,-1)], t, bp*16, 0.035);
    if (n % 12 === 0) this._vox(this._n([0,7,14][(n/12)%3], 1), t+bp*0.2, bp*4, 0.035);
  }

  _bossCataclysm(n) {
    const t = this.ctx.currentTime, bp = 60 / (this._bpm + 6);
    // Ultimate chaos — fast drums, triple bass, everything at once
    if (n % 2 === 0) this._kick(t, 0.17);
    if (n % 2 === 1) this._snare(t, 0.06);
    this._hat(t, 0.028);
    if (n % 3 === 0) this._hat(t+bp*0.5, 0.02);
    if (n % 8 === 6) for (let d=0;d<6;d++) this._snare(t+d*bp*0.2, 0.04);
    // Bass — aggressive walking
    const bl = [0,-7,-5,-3, 3,-5,0,-2, -5,-7,-2,0, 0,-7,-5,3, 0,-7,-5,-3, 3,-5,0,-2, -5,3,0,-5, -7,-5,-2,0];
    this._bass(this._n(bl[n%32], -2), t, bp*0.7, 0.17);
    // Chords — every beat
    if (n % 2 === 0) this._chord([this._n(0,-1),this._n(4,-1),this._n(7,-1),this._n(11,-1)], t, bp*0.5, 0.04);
    if (n % 2 === 1) this._chord([this._n(-7,-1),this._n(-3,-1),this._n(0,-1)], t, bp*0.4, 0.035);
    // Lead + bell together
    if (n % 2 === 0) {
      const mel = [0,7,5,10,7,12,10,14, 0,7,5,3,7,5,3,0, -2,5,3,7,5,10,7,12, 0,-2,-5,3,0,3,5,7, 7,14,10,17,14,19,17,21, 7,14,10,7,14,12,10,7, 0,7,5,10,7,12,10,14, 0,7,5,3,0,-2,-5,-7];
      this._lead(this._n(mel[n%64], 0), t, 0.38, 0.05);
    }
    this._bell(this._n([14,21,17,14,10,7,3,0, 7,14,10,7,0,3,7,10][n%16], 0), t+bp*0.1, 0.25, 0.025);
    this._arp(this._n([21,17,14,10,7,3,0,3, 7,10,14,17,21,17,14,10][n%16], 0), t+bp*0.06, 0.16, 0.026);
    if (n % 8 === 0) { this._osc('sawtooth',this._n(0,1),t,bp*0.9,0.05); this._osc('triangle',this._n(4,1),t+0.02,bp*0.7,0.04); }
    if (n % 16 === 0) this._pad([this._n(0,-1),this._n(4,-1),this._n(7,-1),this._n(11,-1)], t, bp*16, 0.04);
    if (n % 8 === 0) this._vox(this._n([14,7,0][(n/8)%3], 1), t+bp*0.15, bp*5, 0.035);
  }  _playBeat(n) {
    switch (this._activeTrack) {
      case 'menu_crystal': this._menuCrystal(n); break;
      case 'menu_void': this._menuVoid(n); break;
      case 'menu_echo': this._menuEcho(n); break;
      case 'menu_pulse': this._menuPulse(n); break;
      case 'menu_chase': this._menuChase(n); break;
      case 'menu_siege': this._menuSiege(n); break;
      case 'boss_abyss': this._bossAbyss(n); break;
      case 'boss_judgment': this._bossJudgment(n); break; case 'boss_onslaught': this._bossOnslaught(n); break; case 'boss_cataclysm': this._bossCataclysm(n); break; case 'boss_onslaught': this._bossOnslaught(n); break; case 'boss_cataclysm': this._bossCataclysm(n); break;
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

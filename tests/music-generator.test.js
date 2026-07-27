#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const musicJs = fs.readFileSync(path.join(root, 'audio', 'music-generator.js'), 'utf8');

class FakeParam {
  constructor(value = 0) {
    this.value = value;
  }
  setValueAtTime(value) { this.value = value; }
  linearRampToValueAtTime(value) { this.value = value; }
  exponentialRampToValueAtTime(value) { this.value = value; }
}

class FakeNode {
  constructor(kind = 'node') {
    this.kind = kind;
    this.connected = [];
    this.gain = new FakeParam(1);
    this.frequency = new FakeParam(440);
    this.Q = new FakeParam(0);
  }
  connect(node) {
    this.connected.push(node);
    return node;
  }
  disconnect() {
    this.connected = [];
  }
  start() {}
  stop() {}
}

class FakeAudioContext {
  constructor() {
    this.currentTime = 0;
    this.sampleRate = 44100;
    this.destination = new FakeNode('destination');
  }
  createGain() { return new FakeNode('gain'); }
  createDelay() { return new FakeNode('delay'); }
  createOscillator() { return new FakeNode('oscillator'); }
  createBiquadFilter() { return new FakeNode('filter'); }
  createBuffer(_channels, length) {
    const data = new Float32Array(length);
    return { length, getChannelData: () => data };
  }
  createBufferSource() { return new FakeNode('bufferSource'); }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function step(name, fn) {
  try {
    fn();
    console.log('PASS ' + name);
  } catch (err) {
    console.error('FAIL ' + name);
    console.error(err && err.stack ? err.stack : err);
    process.exitCode = 1;
  }
}

const context = {
  console,
  Math,
  setTimeout,
  clearTimeout,
  Float32Array,
};
vm.createContext(context);
vm.runInContext(musicJs + '\nthis.CyberSynth = CyberSynth;', context, { filename: 'music-generator.js' });

step('CyberSynth routes through supplied music bus', () => {
  const ctx = new FakeAudioContext();
  const musicBus = new FakeNode('musicBus');
  const synth = new context.CyberSynth(ctx, musicBus);
  assert(synth.destination === musicBus, 'destination should use supplied music bus');
  assert(synth.masterGain.connected.includes(musicBus), 'master gain should connect to supplied music bus');
});

step('CyberSynth mode targets keep game mix headroom', () => {
  const ctx = new FakeAudioContext();
  const synth = new context.CyberSynth(ctx, new FakeNode('musicBus'));
  synth.switchMode('menu');
  assert(synth._fadeTarget === 0.45, 'menu music should use its default internal target gain');
  synth.switchMode('combat', 10);
  assert(synth._combatTracks.includes(synth._activeTrack), 'combat mode should select combat tracks');
  assert(synth._fadeTarget === 0.38, 'combat music should use a lower internal target than menu');
  synth.setIntensity(1);
  assert(Math.abs(synth._fadeTarget - 0.42) < 0.0001, 'combat intensity should raise target gain gently');
  assert(synth._bpm > 90, 'combat intensity should raise tempo');
  synth.switchMode('boss', 8);
  assert(synth._bossTracks.includes(synth._activeTrack), 'boss mode should select boss tracks');
  assert(synth._fadeTarget === 0.48, 'boss music should be louder than baseline combat');
});

step('every randomized menu track plays through a full arrangement cycle', () => {
  const ctx = new FakeAudioContext();
  ctx.sampleRate = 100;
  const synth = new context.CyberSynth(ctx, new FakeNode('musicBus'));
  for (const track of synth._menuTracks) {
    synth._activeTrack = track;
    for (let beat = 0; beat < 192; beat++) {
      synth._playBeat(beat);
      ctx.currentTime += 60 / synth._bpm;
    }
  }
});

step('combat arrangements add layers at high intensity', () => {
  const ctx = new FakeAudioContext();
  const synth = new context.CyberSynth(ctx, new FakeNode('musicBus'));
  const calls = { counter: 0, hat: 0 };
  synth._counterMotif = () => { calls.counter++; };
  synth._hat = () => { calls.hat++; };
  synth._kick = () => {};
  synth._snare = () => {};
  synth._bass = () => {};
  synth._lead = () => {};
  synth._vox = () => {};
  synth._chord = () => {};
  synth._pad = () => {};
  synth._cymbal = () => {};

  synth.intensity = 0.3;
  synth._combatAssault(6);
  assert(calls.counter === 0, 'low intensity assault should not add counter motif on beat 6');
  assert(calls.hat === 0, 'low intensity assault should not add extra hats');

  synth.intensity = 0.8;
  synth._combatAssault(6);
  assert(calls.counter === 1, 'high intensity assault should add counter motif');
  assert(calls.hat === 0, 'beat 6 should not add the offbeat hat layer');
  synth._combatAssault(7);
  assert(calls.hat === 1, 'high intensity assault should add offbeat hats');
});

if (process.exitCode) process.exit(process.exitCode);

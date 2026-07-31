#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const difficultyCode = fs.readFileSync(path.join(root, 'scripts', 'systems', 'difficulty-config.js'), 'utf8');
const pacingCode = fs.readFileSync(path.join(root, 'scripts', 'systems', 'wave-pacing.js'), 'utf8');
const context = { console };
vm.createContext(context);
new vm.Script(`${difficultyCode}\n${pacingCode}`, { filename: 'wave-pacing-runtime.js' }).runInContext(context);

const WavePacing = context.WavePacing;
const difficultySettings = context.DifficultyConfig.difficultySettings;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function step(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (err) {
    console.error(`FAIL ${name}`);
    console.error(`     ${err.stack || err.message || err}`);
    process.exitCode = 1;
  }
}

step('module exports wave pacing interface', () => {
  assert(WavePacing, 'WavePacing missing');
  assert(typeof WavePacing.getEnemyBudget === 'function', 'getEnemyBudget missing');
  assert(typeof WavePacing.getEliteRollBudget === 'function', 'getEliteRollBudget missing');
  assert(typeof WavePacing.getOpeningBurst === 'function', 'getOpeningBurst missing');
  assert(typeof WavePacing.getOpeningEliteRolls === 'function', 'getOpeningEliteRolls missing');
  assert(typeof WavePacing.getConcurrentEnemyCap === 'function', 'getConcurrentEnemyCap missing');
  assert(typeof WavePacing.getSpawnRate === 'function', 'getSpawnRate missing');
});

step('added density preserves the previous elite roll budget', () => {
  for (const [key, diff] of Object.entries(difficultySettings)) {
    for (const waveNo of [3, 5, 6, 7, 9, 13]) {
      const base = Math.min(9, 2 + Math.floor(waveNo * 0.34) + Math.floor(waveNo * waveNo / 150));
      const previousBudget = Math.max(2, Math.floor(base * (diff.waveBudgetMul || 1)));
      const eliteRollBudget = WavePacing.getEliteRollBudget(waveNo, diff);
      assert(eliteRollBudget === previousBudget, `${key} wave ${waveNo} elite roll budget changed`);
      assert(eliteRollBudget <= WavePacing.getEnemyBudget(waveNo, diff), `${key} wave ${waveNo} elite rolls exceed enemy budget`);
    }
  }
});

step('opening enemy budgets rise without dropping after the first boss', () => {
  for (const [key, diff] of Object.entries(difficultySettings)) {
    assert(WavePacing.getEnemyBudget(1, diff) >= 3, `${key} wave 1 should contain at least three enemies`);
    assert(WavePacing.getEnemyBudget(2, diff) >= 4, `${key} wave 2 should contain at least four enemies`);
    assert(WavePacing.getEnemyBudget(3, diff) >= 5, `${key} wave 3 should contain at least five enemies`);
    for (const waveNo of [5, 6, 7, 9, 12, 20, 40]) {
      assert(WavePacing.getEnemyBudget(waveNo, diff) >= 5, `${key} wave ${waveNo} should not regress below five enemies`);
    }
  }
});

step('regular waves open with two simultaneous enemies', () => {
  assert(WavePacing.getOpeningBurst(1) === 2, 'wave 1 opening burst should be two');
  assert(WavePacing.getOpeningBurst(20) === 2, 'later regular waves should retain a two-enemy opening');
});

step('opening density does not add simultaneous elite rolls', () => {
  assert(WavePacing.getOpeningEliteRolls(3) === 1, 'early waves should retain one opening elite roll');
  assert(WavePacing.getOpeningEliteRolls(11) === 1, 'wave 11 should retain one opening elite roll');
  assert(WavePacing.getOpeningEliteRolls(12) === 2, 'wave 12 should retain the previous two-roll opening');
  assert(WavePacing.getOpeningEliteRolls(20) === 2, 'late waves should cap opening elite rolls at two');
});

step('replenishment starts near five seconds on easy and accelerates by difficulty', () => {
  const rates = ['easy', 'normal', 'hard', 'extreme', 'nightmare']
    .map(key => WavePacing.getSpawnRate(1, 1, difficultySettings[key]));
  assert(rates.join(',') === '295,265,235,205,175', `unexpected opening spawn rates: ${rates.join(',')}`);
  assert(rates.every((rate, index) => index === 0 || rate < rates[index - 1]), 'spawn rates should accelerate by difficulty');
});

step('boss waves retain their previous replenishment cadence', () => {
  for (const [key, diff] of Object.entries(difficultySettings)) {
    const expected = Math.max(92, diff.spawnRate - 4 * 3 - 1 * 2);
    const bossRate = WavePacing.getSpawnRate(4, 1, diff, { bossWave: true });
    assert(bossRate === expected, `${key} boss replenishment changed: ${bossRate} !== ${expected}`);
    assert(bossRate > WavePacing.getSpawnRate(4, 1, diff), `${key} regular wave should replenish faster than boss wave`);
  }
});

step('concurrent enemy caps preserve difficulty and late-wave limits', () => {
  assert(WavePacing.getConcurrentEnemyCap(1, 1, difficultySettings.easy) === 3, 'easy opening cap should remain three');
  assert(WavePacing.getConcurrentEnemyCap(1, 1, difficultySettings.nightmare) === 4, 'nightmare opening cap should remain four');
  assert(WavePacing.getConcurrentEnemyCap(30, 20, difficultySettings.normal) === 5, 'normal late-wave cap should remain five');
  assert(WavePacing.getConcurrentEnemyCap(30, 20, difficultySettings.nightmare) === 6, 'nightmare late-wave cap should remain six');
});

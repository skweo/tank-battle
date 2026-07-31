#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const code = fs.readFileSync(path.join(root, 'scripts', 'systems', 'boss-selection.js'), 'utf8');
const context = { console, Set, Math };
vm.createContext(context);
new vm.Script(code, { filename: 'scripts/systems/boss-selection.js' }).runInContext(context);

const BossSelection = context.BossSelection;
const bosses = [
  { name: 'early-a', tier: 1, faction: 'red' },
  { name: 'early-b', tier: 1, faction: 'blue' },
  { name: 'early-c', tier: 1, faction: 'green' },
  { name: 'late-a', tier: 2, faction: 'red' },
  { name: 'late-b', tier: 3, faction: 'blue' },
];

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

step('module exports boss selection interface', () => {
  assert(BossSelection, 'BossSelection missing');
  assert(BossSelection.EARLY_BOSS_WAVE_COUNT === 3, 'early wave count should be three');
  assert(typeof BossSelection.selectBossForWave === 'function', 'selector missing');
});

step('first three boss waves stay in the early tier', () => {
  const pool = BossSelection.getBossSelectionPool(bosses, 0);
  assert(pool.length === 3, 'first boss wave should expose only early bosses');
  assert(pool.every(boss => boss.tier === 1), 'early pool should not include higher tiers');
  assert(BossSelection.getBossSelectionPool(bosses, 2).every(boss => boss.tier === 1), 'third boss wave should stay early');
});

step('fourth boss wave unlocks the strongest tier', () => {
  const pool = BossSelection.getBossSelectionPool(bosses, 3);
  assert(pool.some(boss => boss.tier === 3), 'tier 3 should be available from the fourth boss wave');

  const chosen = BossSelection.selectBossForWave(bosses, 3, { random: () => 0.999 });
  assert(chosen.tier === 3, 'fourth boss wave should be able to select tier 3');
});

step('early waves accept tier 1 only', () => {
  const malformed = bosses.concat([
    { name: 'tier-zero', tier: 0, faction: 'gray' },
    { name: 'missing-tier', faction: 'gray' },
  ]);
  const pool = BossSelection.getBossSelectionPool(malformed, 0);
  assert(pool.every(boss => boss.tier === 1), 'tier 0 and missing tiers should stay out of early waves');
});

step('clear mode prefers unseen bosses without mutating tracking state', () => {
  const seen = new Set(['early-a', 'early-b']);
  const pool = BossSelection.getBossSelectionPool(bosses, 3, {
    runMode: 'clear',
    seenBossNames: seen,
  });
  assert(pool.length === 3, 'clear mode should retain only unseen bosses when available');
  assert(pool.every(boss => !seen.has(boss.name)), 'clear mode pool should be unseen');
  assert(seen.size === 2, 'selector should not mutate seen boss state');
});

step('selection avoids consecutive bosses and prefers a faction shift', () => {
  const chosen = BossSelection.selectBossForWave(bosses, 3, {
    lastBossName: 'early-a',
    random: () => 0,
  });
  assert(chosen.name !== 'early-a', 'selector should avoid consecutive bosses');
  assert(chosen.faction !== 'red', 'selector should prefer a different faction');
});

step('invalid wave indexes return no selection', () => {
  assert(BossSelection.selectBossForWave(bosses, -1) === null, 'non-boss wave should not select a boss');
});

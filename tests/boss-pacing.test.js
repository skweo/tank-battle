#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const code = fs.readFileSync(path.join(root, 'scripts', 'systems', 'boss-pacing.js'), 'utf8');
const context = { console };
vm.createContext(context);
new vm.Script(code, { filename: 'scripts/systems/boss-pacing.js' }).runInContext(context);

const BossPacing = context.BossPacing;
const normal = { clearWave: 28, bossRequired: 7 };
const easy = { clearWave: 20, bossRequired: 5 };

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

step('module exports boss pacing interface', () => {
  assert(BossPacing, 'BossPacing missing');
  assert(BossPacing.BOSS_WAVE_INTERVAL === 4, 'Boss wave interval should be 4');
});
step('boss wave indexing is interval-based', () => {
  assert(BossPacing.getBossWaveIndex(3) === -1, 'wave 3 should not be a boss wave');
  assert(BossPacing.getBossWaveIndex(4) === 0, 'wave 4 should be first boss wave');
  assert(BossPacing.getBossWaveIndex(28) === 6, 'wave 28 should be seventh boss wave');
});

step('clear target respects difficulty and required bosses', () => {
  assert(BossPacing.getRequiredBossDefeats(normal) === 7, 'normal should require seven bosses');
  assert(BossPacing.getBossArchiveFinalWave(normal) === 28, 'normal archive should finish on wave 28');
  assert(BossPacing.getDifficultyClearWaveTarget(easy) === 20, 'easy should clear on wave 20');
  assert(BossPacing.getDifficultyClearWaveTarget({ clearWave: 12, bossRequired: 5 }) === 20, 'archive final wave should be a lower bound');
});

step('archive support mobs are suppressed until after the archive', () => {
  assert(BossPacing.isBossArchiveWave(28, normal) === true, 'wave 28 should be in normal archive');
  assert(BossPacing.isBossArchiveWave(32, normal) === false, 'wave 32 should be post-archive');
  assert(BossPacing.getBossSupportCount(28, { diff: normal, runMode: 'clear' }) === 0, 'archive boss should have no support mobs');
  assert(BossPacing.getBossSupportCount(32, { diff: normal, runMode: 'clear' }) === 1, 'post-archive clear boss should have one support mob');
  assert(BossPacing.getBossSupportCount(88, { diff: normal, runMode: 'endless' }) === 2, 'endless support mobs should cap at two');
});

step('clear eligibility requires clear mode, target wave, and enough bosses', () => {
  assert(BossPacing.shouldClearDifficulty({ runMode: 'clear', isDailyChallenge: false, wave: 28, diff: normal, seenBossCount: 7 }) === true, 'normal should clear at wave 28 after seven bosses');
  assert(BossPacing.shouldClearDifficulty({ runMode: 'clear', isDailyChallenge: false, wave: 24, diff: normal, seenBossCount: 7 }) === false, 'normal should not clear before target wave');
  assert(BossPacing.shouldClearDifficulty({ runMode: 'clear', isDailyChallenge: false, wave: 28, diff: normal, seenBossCount: 6 }) === false, 'normal should not clear before enough bosses');
  assert(BossPacing.shouldClearDifficulty({ runMode: 'endless', isDailyChallenge: false, wave: 28, diff: normal, seenBossCount: 7 }) === false, 'endless mode should not clear');
  assert(BossPacing.shouldClearDifficulty({ runMode: 'clear', isDailyChallenge: true, wave: 28, diff: normal, seenBossCount: 7 }) === false, 'daily challenge should not clear difficulty');
});

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const code = fs.readFileSync(path.join(root, 'scripts', 'systems', 'enemy-visual-profile.js'), 'utf8');
const context = { console };
vm.createContext(context);
new vm.Script(code, { filename: 'scripts/systems/enemy-visual-profile.js' }).runInContext(context);

const EnemyVisualProfile = context.EnemyVisualProfile;

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

step('module exports visual profiles and lookup helper', () => {
  assert(EnemyVisualProfile, 'EnemyVisualProfile missing');
  assert(EnemyVisualProfile.ENEMY_VISUAL_PROFILE && EnemyVisualProfile.ENEMY_VISUAL_PROFILE.normal, 'normal profile missing');
  assert(typeof EnemyVisualProfile.getEnemyVisualProfile === 'function', 'getEnemyVisualProfile missing');
});
step('core enemy visual profiles preserve labels and icons', () => {
  assert(EnemyVisualProfile.getEnemyVisualProfile('scout').iconType === 'radar', 'scout icon changed');
  assert(EnemyVisualProfile.getEnemyVisualProfile('brute').label === 'BULWARK', 'brute label changed');
  assert(EnemyVisualProfile.getEnemyVisualProfile('phase').threat === '裂隙', 'phase threat changed');
});

step('boss and item archive profiles are available', () => {
  assert(EnemyVisualProfile.getEnemyVisualProfile('boss').iconType === 'crown', 'boss icon changed');
  assert(EnemyVisualProfile.getEnemyVisualProfile('powerup').label === 'MODULE', 'powerup label changed');
  assert(EnemyVisualProfile.getEnemyVisualProfile('fusion').glyph === '⟡', 'fusion glyph changed');
});

step('unknown profile falls back to normal', () => {
  assert(EnemyVisualProfile.getEnemyVisualProfile('missing') === EnemyVisualProfile.ENEMY_VISUAL_PROFILE.normal, 'unknown profile should fall back to normal');
});

step('visual profile data is frozen for read-only use', () => {
  assert(Object.isFrozen(EnemyVisualProfile.ENEMY_VISUAL_PROFILE), 'profile map should be frozen');
  assert(Object.isFrozen(EnemyVisualProfile.ENEMY_VISUAL_PROFILE.boss), 'profile entries should be frozen');
});

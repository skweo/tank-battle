#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const code = fs.readFileSync(path.join(root, 'scripts', 'systems', 'tank-config.js'), 'utf8');
const context = { console };
vm.createContext(context);
new vm.Script(code, { filename: 'scripts/systems/tank-config.js' }).runInContext(context);

const TankConfig = context.TankConfig;

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

step('module exports turret speeds and tank form factors', () => {
  assert(TankConfig, 'TankConfig missing');
  assert(TankConfig.TURRET_SPEED_FACTION && TankConfig.TURRET_SPEED_FACTION.graveyard, 'faction turret speeds missing');
  assert(TankConfig.TURRET_SPEED_PLAYER && TankConfig.TURRET_SPEED_PLAYER.sniper, 'player turret speeds missing');
  assert(TankConfig.TANK_FORM_FACTORS && TankConfig.TANK_FORM_FACTORS.spread, 'tank form factors missing');
  assert(typeof TankConfig.getTankFormFactor === 'function', 'getTankFormFactor missing');
});

step('turret speed tuning values are preserved', () => {
  assert(TankConfig.TURRET_SPEED_FACTION.observatory === 0.16, 'observatory speed changed');
  assert(TankConfig.TURRET_SPEED_FACTION.graveyard === 0.015, 'graveyard speed changed');
  assert(TankConfig.TURRET_SPEED_PLAYER.sniper === 0.25, 'sniper speed changed');
  assert(TankConfig.TURRET_SPEED_PLAYER.wide === 0.03, 'wide speed changed');
});

step('tank form factors preserve evolution tuning', () => {
  assert(TankConfig.getTankFormFactor('spread', 2, 'visual') === 1.08, 'spread visual factor changed');
  assert(TankConfig.getTankFormFactor('focus', 1, 'hit') === 0.90, 'focus hit factor changed');
  assert(TankConfig.getTankFormFactor('scarlet', 2, 'hit') === 1.08, 'scarlet hit factor changed');
});

step('tank form factor lookup clamps and falls back safely', () => {
  assert(TankConfig.getTankFormFactor('missing', 2, 'visual') === 1.08, 'unknown tank should fall back to spread');
  assert(TankConfig.getTankFormFactor('spread', 99, 'hit') === 1.06, 'evolution level should clamp high');
  assert(TankConfig.getTankFormFactor('focus', -1, 'visual') === 0.96, 'evolution level should clamp low');
  assert(TankConfig.getTankFormFactor('wide', 1, 'missing') === 1.10, 'unknown factor kind should fall back to visual');
});

step('tank config data is frozen for read-only use', () => {
  assert(Object.isFrozen(TankConfig.TURRET_SPEED_FACTION), 'faction turret speed map should be frozen');
  assert(Object.isFrozen(TankConfig.TURRET_SPEED_PLAYER), 'player turret speed map should be frozen');
  assert(Object.isFrozen(TankConfig.TANK_FORM_FACTORS), 'tank form factor map should be frozen');
  assert(Object.isFrozen(TankConfig.TANK_FORM_FACTORS.spread), 'tank form factor entries should be frozen');
  assert(Object.isFrozen(TankConfig.TANK_FORM_FACTORS.spread.visual), 'tank form factor arrays should be frozen');
});

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const code = fs.readFileSync(path.join(root, 'scripts', 'systems', 'faction-config.js'), 'utf8');
const context = { console };
vm.createContext(context);
new vm.Script(code, { filename: 'scripts/systems/faction-config.js' }).runInContext(context);

const FactionConfig = context.FactionConfig;

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

step('module exports faction data and helpers', () => {
  assert(FactionConfig, 'FactionConfig missing');
  assert(FactionConfig.FACTIONS && FactionConfig.FACTIONS.moon_arsenal, 'FACTIONS.moon_arsenal missing');
  assert(typeof FactionConfig.getFactionInfo === 'function', 'getFactionInfo missing');
  assert(typeof FactionConfig.appendFactionLore === 'function', 'appendFactionLore missing');
});
step('faction roster keeps the six current factions', () => {
  const keys = Object.keys(FactionConfig.FACTIONS).sort();
  assert(keys.join(',') === 'ash_church,graveyard,moon_arsenal,observatory,storm_cloister,void_cult', 'faction keys changed');
});

step('known and unknown factions resolve predictably', () => {
  assert(FactionConfig.getFactionInfo('observatory').code === 'OBS-7', 'observatory code changed');
  assert(FactionConfig.getFactionInfo('storm_cloister').color === '#76fcff', 'storm color changed');
  assert(FactionConfig.getFactionInfo('missing').code === 'GRAVE-NET', 'unknown faction should fall back to graveyard');
});

step('appendFactionLore preserves base lore and adds faction record', () => {
  const lore = FactionConfig.appendFactionLore('原始记录', 'void_cult');
  assert(lore.startsWith('原始记录 / 阵营记录：'), 'base lore should be preserved');
  assert(lore.includes('月背的空洞'), 'faction lore should be appended');
});

step('faction data is frozen for read-only use', () => {
  assert(Object.isFrozen(FactionConfig.FACTIONS), 'FACTIONS map should be frozen');
  assert(Object.isFrozen(FactionConfig.FACTIONS.graveyard), 'faction entries should be frozen');
});

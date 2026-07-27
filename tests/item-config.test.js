#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const code = fs.readFileSync(path.join(root, 'scripts', 'systems', 'item-config.js'), 'utf8');
const context = { console };
vm.createContext(context);
new vm.Script(code, { filename: 'scripts/systems/item-config.js' }).runInContext(context);

const ItemConfig = context.ItemConfig;

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

step('module exports item tier config and helpers', () => {
  assert(ItemConfig, 'ItemConfig missing');
  assert(ItemConfig.ITEM_TIER_CONFIG && ItemConfig.ITEM_TIER_CONFIG.basic, 'ITEM_TIER_CONFIG.basic missing');
  assert(ItemConfig.RARITY_CONFIG === ItemConfig.ITEM_TIER_CONFIG, 'RARITY_CONFIG should alias ITEM_TIER_CONFIG');
  assert(typeof ItemConfig.normalizeItemTier === 'function', 'normalizeItemTier missing');
});
step('item tier tuning values are preserved', () => {
  const { basic, advanced, relic } = ItemConfig.ITEM_TIER_CONFIG;
  assert(basic.weight === 68 && basic.durationMul === 0.9 && basic.code === 'T1', 'basic tier changed');
  assert(advanced.weight === 25 && advanced.durationMul === 1.12 && advanced.glowColor === '#6af', 'advanced tier changed');
  assert(relic.weight === 7 && relic.durationMul === 1.35 && relic.size === 14, 'relic tier changed');
});

step('legacy item tier names normalize to current tiers', () => {
  assert(ItemConfig.normalizeItemTier('common') === 'basic', 'common should map to basic');
  assert(ItemConfig.normalizeItemTier('rare') === 'advanced', 'rare should map to advanced');
  assert(ItemConfig.normalizeItemTier('legendary') === 'relic', 'legendary should map to relic');
  assert(ItemConfig.normalizeItemTier('advanced') === 'advanced', 'advanced should stay advanced');
  assert(ItemConfig.normalizeItemTier('missing') === 'basic', 'unknown tiers should fall back to basic');
});

step('item tier data is frozen for read-only use', () => {
  assert(Object.isFrozen(ItemConfig.ITEM_TIER_CONFIG), 'item tier map should be frozen');
  assert(Object.isFrozen(ItemConfig.ITEM_TIER_CONFIG.relic), 'item tier entries should be frozen');
});

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const code = fs.readFileSync(path.join(root, 'scripts', 'systems', 'bestiary-config.js'), 'utf8');
const context = { console };
vm.createContext(context);
new vm.Script(code, { filename: 'scripts/systems/bestiary-config.js' }).runInContext(context);

const BestiaryConfig = context.BestiaryConfig;

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

step('module exports bestiary config and helpers', () => {
  assert(BestiaryConfig, 'BestiaryConfig missing');
  assert(BestiaryConfig.BESTIARY_DISCOVERY_KEY === 'tankbattle_bestiary_discovered', 'discovery key changed');
  assert(Array.isArray(BestiaryConfig.BESTIARY_TAB_IDS), 'tab ids should be an array');
  assert(BestiaryConfig.BESTIARY_SECTIONS && BestiaryConfig.BESTIARY_SECTIONS.items, 'sections missing');
  assert(BestiaryConfig.BESTIARY_TAB_META && BestiaryConfig.BESTIARY_TAB_META.enemies_boss, 'tab meta missing');
  assert(typeof BestiaryConfig.normalizeBestiaryTab === 'function', 'normalizeBestiaryTab missing');
  assert(typeof BestiaryConfig.normalizeBestiarySection === 'function', 'normalizeBestiarySection missing');
  assert(typeof BestiaryConfig.getBestiaryTabMeta === 'function', 'getBestiaryTabMeta missing');
});

step('bestiary tab order is preserved', () => {
  assert(
    BestiaryConfig.BESTIARY_TAB_IDS.join(',') === 'items_basic,items_fusion,enemies_normal,enemies_elite,enemies_boss',
    'bestiary tab order changed',
  );
});

step('section and tab metadata are preserved', () => {
  assert(BestiaryConfig.BESTIARY_SECTIONS.items.label === '道具档案', 'items section label changed');
  assert(BestiaryConfig.BESTIARY_SECTIONS.enemies.tabs.join(',') === 'enemies_normal,enemies_elite,enemies_boss', 'enemy section tabs changed');
  assert(BestiaryConfig.BESTIARY_TAB_META.items_basic.code === 'MODULE', 'items_basic code changed');
  assert(BestiaryConfig.BESTIARY_TAB_META.enemies_boss.label === '首领敌人', 'boss tab label changed');
});

step('normalizers preserve fallback behavior', () => {
  assert(BestiaryConfig.normalizeBestiaryTab('enemies_elite') === 'enemies_elite', 'known tab should pass through');
  assert(BestiaryConfig.normalizeBestiaryTab('missing') === 'items_basic', 'unknown tab should fall back');
  assert(BestiaryConfig.normalizeBestiarySection('enemies') === 'enemies', 'known section should pass through');
  assert(BestiaryConfig.normalizeBestiarySection('missing') === 'items', 'unknown section should fall back');
  const fallback = BestiaryConfig.getBestiaryTabMeta('unknown_tab');
  assert(fallback.label === 'unknown_tab' && fallback.code === 'ARC', 'unknown tab meta should fall back');
});

step('bestiary config data is frozen for read-only use', () => {
  assert(Object.isFrozen(BestiaryConfig.BESTIARY_TAB_IDS), 'tab ids should be frozen');
  assert(Object.isFrozen(BestiaryConfig.BESTIARY_SECTIONS), 'sections should be frozen');
  assert(Object.isFrozen(BestiaryConfig.BESTIARY_SECTIONS.items), 'section entries should be frozen');
  assert(Object.isFrozen(BestiaryConfig.BESTIARY_SECTIONS.items.tabs), 'section tab arrays should be frozen');
  assert(Object.isFrozen(BestiaryConfig.BESTIARY_TAB_META), 'tab meta should be frozen');
  assert(Object.isFrozen(BestiaryConfig.BESTIARY_TAB_META.items_basic), 'tab meta entries should be frozen');
});

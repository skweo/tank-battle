#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const code = fs.readFileSync(path.join(root, 'scripts', 'systems', 'difficulty-config.js'), 'utf8');
const context = { console };
vm.createContext(context);
new vm.Script(code, { filename: 'scripts/systems/difficulty-config.js' }).runInContext(context);

const DifficultyConfig = context.DifficultyConfig;

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

step('module exports difficulty order and settings', () => {
  assert(DifficultyConfig, 'DifficultyConfig missing');
  assert(Array.isArray(DifficultyConfig.DIFFICULTY_ORDER), 'DIFFICULTY_ORDER should be an array');
  assert(DifficultyConfig.difficultySettings && DifficultyConfig.difficultySettings.normal, 'difficultySettings.normal missing');
});
step('difficulty order is stable from easy to nightmare', () => {
  assert(DifficultyConfig.DIFFICULTY_ORDER.join(',') === 'easy,normal,hard,extreme,nightmare', 'difficulty order changed');
});

step('difficulty settings preserve gameplay tuning values', () => {
  const { easy, normal, hard, extreme, nightmare } = DifficultyConfig.difficultySettings;
  assert(easy.lives === 5 && easy.clearWave === 20 && easy.bossRequired === 5, 'easy tuning changed');
  assert(normal.lives === 3 && normal.clearWave === 28 && normal.bossRequired === 7, 'normal tuning changed');
  assert(hard.playerHp === 8 && hard.enemySpeedMul === 1.18 && hard.bossRequired === 9, 'hard tuning changed');
  assert(extreme.unlockScore === 12800 && extreme.bossRequired === 12, 'extreme tuning changed');
  assert(nightmare.lives === 1 && nightmare.playerHp === 6 && nightmare.bossRequired === 15, 'nightmare tuning changed');
});

step('difficulty data is frozen for read-only use', () => {
  assert(Object.isFrozen(DifficultyConfig.DIFFICULTY_ORDER), 'difficulty order should be frozen');
  assert(Object.isFrozen(DifficultyConfig.difficultySettings), 'difficulty settings map should be frozen');
  assert(Object.isFrozen(DifficultyConfig.difficultySettings.normal), 'difficulty setting entries should be frozen');
});

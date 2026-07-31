(function(root) {
  'use strict';

  function getEliteRollBudget(waveNo, diff, options = {}) {
    const currentWave = Math.max(1, Math.floor(Number(waveNo) || 1));
    const base = Math.min(9, 2 + Math.floor(currentWave * 0.34) + Math.floor(currentWave * currentWave / 150));
    const budgetMultiplier = diff?.waveBudgetMul || 1;
    const dualMultiplier = options.dualMode ? 1.3 : 1;
    return Math.max(2, Math.floor(base * budgetMultiplier * dualMultiplier));
  }
  function getEnemyBudget(waveNo, diff, options = {}) {
    const currentWave = Math.max(1, Math.floor(Number(waveNo) || 1));
    const openingDensityFloor = Math.min(5, currentWave + 2);
    return Math.max(openingDensityFloor, getEliteRollBudget(currentWave, diff, options));
  }
  function getOpeningBurst() {
    return 2;
  }
  function getOpeningEliteRolls(waveNo) {
    const currentWave = Math.max(1, Math.floor(Number(waveNo) || 1));
    return Math.min(2, 1 + Math.floor(currentWave / 12));
  }
  function getConcurrentEnemyCap(waveNo, level, diff) {
    const currentWave = Math.max(1, Math.floor(Number(waveNo) || 1));
    const currentLevel = Math.max(1, Math.floor(Number(level) || 1));
    const difficultyExtra = diff.waveBudgetMul > 0.95 ? 1 : 0;
    return Math.min(5 + difficultyExtra, 3 + Math.floor(currentWave / 9) + Math.floor(currentLevel / 11) + difficultyExtra);
  }
  function getSpawnRate(waveNo, level, diff, options = {}) {
    const currentWave = Math.max(1, Math.floor(Number(waveNo) || 1));
    const currentLevel = Math.max(1, Math.floor(Number(level) || 1));
    const baseSpawnRate = options.bossWave
      ? diff.spawnRate
      : (diff.regularWaveSpawnRate || diff.spawnRate);
    return Math.max(92, baseSpawnRate - currentWave * 3 - currentLevel * 2);
  }

  const api = Object.freeze({
    getEnemyBudget,
    getEliteRollBudget,
    getOpeningBurst,
    getOpeningEliteRolls,
    getConcurrentEnemyCap,
    getSpawnRate,
  });

  root.WavePacing = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);

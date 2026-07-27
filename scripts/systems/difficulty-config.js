(function(root) {
  'use strict';

  const difficultySettings = Object.freeze({
    easy: Object.freeze({
      lives: 5,
      spawnRate: 470,
      enemyHpBonus: 1,
      playerHp: 12,
      enemySpeedMul: 0.66,
      enemyBulletSpeedMul: 0.72,
      waveBudgetMul: 0.62,
      eliteChanceMul: 0.45,
      bossHpMul: 1.55,
      unlockScore: 0,
      clearWave: 20,
      bossRequired: 5,
      label: '简单',
    }),
    normal: Object.freeze({
      lives: 3,
      spawnRate: 410,
      enemyHpBonus: 2,
      playerHp: 10,
      enemySpeedMul: 0.94,
      enemyBulletSpeedMul: 0.96,
      waveBudgetMul: 0.76,
      eliteChanceMul: 0.82,
      bossHpMul: 2.05,
      unlockScore: 2800,
      clearWave: 28,
      bossRequired: 7,
      label: '普通',
    }),
    hard: Object.freeze({
      lives: 2,
      spawnRate: 335,
      enemyHpBonus: 4,
      playerHp: 8,
      enemySpeedMul: 1.18,
      enemyBulletSpeedMul: 1.12,
      waveBudgetMul: 0.86,
      eliteChanceMul: 1.10,
      bossHpMul: 2.55,
      unlockScore: 7200,
      clearWave: 36,
      bossRequired: 9,
      label: '困难',
    }),
    extreme: Object.freeze({
      lives: 2,
      spawnRate: 280,
      enemyHpBonus: 6,
      playerHp: 7,
      enemySpeedMul: 1.42,
      enemyBulletSpeedMul: 1.24,
      waveBudgetMul: 0.94,
      eliteChanceMul: 1.34,
      bossHpMul: 3.05,
      unlockScore: 12800,
      clearWave: 44,
      bossRequired: 12,
      label: '极限',
    }),
    nightmare: Object.freeze({
      lives: 1,
      spawnRate: 235,
      enemyHpBonus: 8,
      playerHp: 6,
      enemySpeedMul: 1.62,
      enemyBulletSpeedMul: 1.36,
      waveBudgetMul: 1.02,
      eliteChanceMul: 1.65,
      bossHpMul: 3.65,
      unlockScore: 20500,
      clearWave: 56,
      bossRequired: 15,
      label: '梦魇',
    }),
  });

  const DIFFICULTY_ORDER = Object.freeze(['easy', 'normal', 'hard', 'extreme', 'nightmare']);

  const api = Object.freeze({
    difficultySettings,
    DIFFICULTY_ORDER,
  });

  root.DifficultyConfig = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);

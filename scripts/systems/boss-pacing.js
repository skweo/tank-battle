(function(root) {
  'use strict';

  const BOSS_WAVE_INTERVAL = 4;
  const DEFAULT_REQUIRED_BOSS_DEFEATS = 5;

  function positiveInteger(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
  }

  function getRequiredBossDefeats(diff) {
    return positiveInteger(diff && diff.bossRequired, DEFAULT_REQUIRED_BOSS_DEFEATS);
  }

  function getBossArchiveFinalWave(diff) {
    return getRequiredBossDefeats(diff) * BOSS_WAVE_INTERVAL;
  }

  function getBossWaveIndex(waveNo) {
    const wave = Number(waveNo);
    return Number.isFinite(wave) && wave >= BOSS_WAVE_INTERVAL && wave % BOSS_WAVE_INTERVAL === 0
      ? Math.floor(wave / BOSS_WAVE_INTERVAL) - 1
      : -1;
  }

  function isBossWaveNumber(waveNo) {
    return getBossWaveIndex(waveNo) >= 0;
  }

  function isBossArchiveWave(waveNo, diff) {
    const index = getBossWaveIndex(waveNo);
    return index >= 0 && index < getRequiredBossDefeats(diff);
  }

  function getDifficultyClearWaveTarget(diff) {
    const archiveFinalWave = getBossArchiveFinalWave(diff);
    const configuredClearWave = positiveInteger(diff && diff.clearWave, archiveFinalWave);
    return Math.max(configuredClearWave, archiveFinalWave);
  }

  function getBossSupportCount(waveNo, options = {}) {
    const wave = Number(waveNo);
    if (!Number.isFinite(wave)) return 0;
    const archiveFinalWave = getBossArchiveFinalWave(options.diff);
    if (isBossArchiveWave(wave, options.diff)) return 0;
    if (wave <= archiveFinalWave) return 0;
    const cap = options.runMode === 'clear' ? 1 : 2;
    return Math.min(cap, 1 + Math.floor((wave - archiveFinalWave) / 20));
  }

  function hasRequiredBossDefeats(seenBossCount, diff) {
    return Number(seenBossCount) >= getRequiredBossDefeats(diff);
  }

  function shouldClearDifficulty(state = {}) {
    return state.runMode === 'clear'
      && !state.isDailyChallenge
      && Number(state.wave) >= getDifficultyClearWaveTarget(state.diff)
      && hasRequiredBossDefeats(state.seenBossCount, state.diff);
  }

  const api = Object.freeze({
    BOSS_WAVE_INTERVAL,
    getRequiredBossDefeats,
    getBossArchiveFinalWave,
    getBossWaveIndex,
    isBossWaveNumber,
    isBossArchiveWave,
    getDifficultyClearWaveTarget,
    getBossSupportCount,
    hasRequiredBossDefeats,
    shouldClearDifficulty,
  });

  root.BossPacing = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);

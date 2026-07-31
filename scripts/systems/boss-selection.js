(function(root) {
  'use strict';

  const EARLY_BOSS_WAVE_COUNT = 3;
  const EARLY_BOSS_MAX_TIER = 1;

  function asBossList(bosses) {
    return Array.isArray(bosses) ? bosses.filter(Boolean) : [];
  }

  function asSeenSet(value) {
    if (value instanceof Set) return value;
    if (Array.isArray(value)) return new Set(value);
    return new Set();
  }

  function getBossSelectionPool(bosses, bossWaveIndex, options = {}) {
    const source = asBossList(bosses);
    const index = Number(bossWaveIndex);
    if (!source.length || !Number.isFinite(index) || index < 0) return [];

    let pool = index < EARLY_BOSS_WAVE_COUNT
      ? source.filter(boss => Number(boss.tier) === EARLY_BOSS_MAX_TIER)
      : source.slice();

    const lastBossName = options.lastBossName || null;
    if (lastBossName && pool.length > 1) {
      const withoutRepeat = pool.filter(boss => boss.name !== lastBossName);
      if (withoutRepeat.length > 0) pool = withoutRepeat;
    }

    const seen = asSeenSet(options.seenBossNames);
    if (options.runMode === 'clear' && seen.size > 0 && pool.length > 1) {
      const unseen = pool.filter(boss => !seen.has(boss.name));
      if (unseen.length > 0) pool = unseen;
    }

    const lastBoss = source.find(boss => boss.name === lastBossName);
    if (lastBoss && pool.length > 1) {
      const factionShift = pool.filter(boss => boss.faction !== lastBoss.faction);
      if (factionShift.length > 0) pool = factionShift;
    }

    return pool;
  }

  function selectBossForWave(bosses, bossWaveIndex, options = {}) {
    const source = asBossList(bosses);
    const pool = getBossSelectionPool(source, bossWaveIndex, options);
    if (!pool.length) return null;

    const random = typeof options.random === 'function' ? options.random() : Math.random();
    const normalized = Number.isFinite(random) ? Math.max(0, Math.min(0.999999999, random)) : 0;
    return pool[Math.floor(normalized * pool.length)] || pool[0];
  }

  const api = Object.freeze({
    EARLY_BOSS_WAVE_COUNT,
    EARLY_BOSS_MAX_TIER,
    getBossSelectionPool,
    selectBossForWave,
  });

  root.BossSelection = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);

(function(root) {
  'use strict';

  const ITEM_TIER_CONFIG = Object.freeze({
    basic: Object.freeze({
      weight: 68,
      durationMul: 0.9,
      descSuffix: ' [I]',
      glowColor: null,
      size: 10,
      label: 'T1 基础模块',
      code: 'T1',
    }),
    advanced: Object.freeze({
      weight: 25,
      durationMul: 1.12,
      descSuffix: ' [II]',
      glowColor: '#6af',
      size: 12,
      label: 'T2 强化模块',
      code: 'T2',
    }),
    relic: Object.freeze({
      weight: 7,
      durationMul: 1.35,
      descSuffix: ' [III]',
      glowColor: '#fd0',
      size: 14,
      label: 'T3 圣遗物协议',
      code: 'T3',
    }),
  });

  const RARITY_CONFIG = ITEM_TIER_CONFIG;

  function normalizeItemTier(tier) {
    if (tier === 'common') return 'basic';
    if (tier === 'rare') return 'advanced';
    if (tier === 'legendary') return 'relic';
    return ITEM_TIER_CONFIG[tier] ? tier : 'basic';
  }

  const api = Object.freeze({
    ITEM_TIER_CONFIG,
    RARITY_CONFIG,
    normalizeItemTier,
  });

  root.ItemConfig = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);

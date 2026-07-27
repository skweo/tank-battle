(function(root) {
  'use strict';

  const BESTIARY_DISCOVERY_KEY = 'tankbattle_bestiary_discovered';

  const BESTIARY_TAB_IDS = Object.freeze([
    'items_basic',
    'items_fusion',
    'enemies_normal',
    'enemies_elite',
    'enemies_boss',
  ]);

  const BESTIARY_SECTIONS = Object.freeze({
    items: Object.freeze({
      label: '道具档案',
      tabs: Object.freeze(['items_basic', 'items_fusion']),
      summary: '道具档案记录月光石补给、战术模块与禁忌融合协议。拾取或触发后，档案会逐步解密。',
    }),
    enemies: Object.freeze({
      label: '敌人档案',
      tabs: Object.freeze(['enemies_normal', 'enemies_elite', 'enemies_boss']),
      summary: '敌人档案按威胁阶级封存普通单位、精英单位与首领敌人。遭遇后才会公开真实记录。',
    }),
  });

  const BESTIARY_TAB_META = Object.freeze({
    items_basic: Object.freeze({ label: '基础模块', code: 'MODULE' }),
    items_fusion: Object.freeze({ label: '融合协议', code: 'FUSION' }),
    enemies_normal: Object.freeze({ label: '普通单位', code: 'COMMON' }),
    enemies_elite: Object.freeze({ label: '精英单位', code: 'ELITE' }),
    enemies_boss: Object.freeze({ label: '首领敌人', code: 'BOSS' }),
  });

  function normalizeBestiaryTab(tab) {
    return BESTIARY_TAB_IDS.includes(tab) ? tab : 'items_basic';
  }

  function normalizeBestiarySection(sectionId) {
    return BESTIARY_SECTIONS[sectionId] ? sectionId : 'items';
  }

  function getBestiaryTabMeta(tab) {
    return BESTIARY_TAB_META[tab] || { label: tab, code: 'ARC' };
  }

  const api = Object.freeze({
    BESTIARY_DISCOVERY_KEY,
    BESTIARY_TAB_IDS,
    BESTIARY_SECTIONS,
    BESTIARY_TAB_META,
    normalizeBestiaryTab,
    normalizeBestiarySection,
    getBestiaryTabMeta,
  });

  root.BestiaryConfig = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);

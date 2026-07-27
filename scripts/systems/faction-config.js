(function(root) {
  'use strict';

  const FACTIONS = Object.freeze({
    moon_arsenal: Object.freeze({
      name: '月核军械库',
      code: 'MOON-ARS',
      color: '#ff9b4a',
      lore: '最早把月光石铸成武器的技术官僚。它们相信一切灾厄都能被归档、编号，然后装进炮膛。',
    }),
    ash_church: Object.freeze({
      name: '灰烬圣城',
      code: 'ASH-CHURCH',
      color: '#f6e5aa',
      lore: '圣城在末日后仍维持钟声与审判。护教军不宣称胜利，只宣称“秩序仍在”。',
    }),
    observatory: Object.freeze({
      name: '第七观测站',
      code: 'OBS-7',
      color: '#8ce8ff',
      lore: '观测站曾监测碎月潮汐，后来开始监测人心。它们的兵器总像在记录某种证词。',
    }),
    graveyard: Object.freeze({
      name: '灰域残骸群',
      code: 'GRAVE-NET',
      color: '#9ca8ff',
      lore: '无人认领的战车、矿机与城防炮在废土中彼此接驳，形成没有司令部的军队。',
    }),
    void_cult: Object.freeze({
      name: '虚月教团',
      code: 'VOID-RITE',
      color: '#d9b6ff',
      lore: '他们崇拜月背的空洞，认为边界不是墙，而是可以被献祭、折叠与重新命名的门。',
    }),
    storm_cloister: Object.freeze({
      name: '雷霆修会',
      code: 'STORM-CLO',
      color: '#76fcff',
      lore: '气象塔倒塌后，修会接管了天候算法。雷声成为它们的祷词，闪电成为它们的签名。',
    }),
  });

  function getFactionInfo(id) {
    return FACTIONS[id] || FACTIONS.graveyard;
  }

  function appendFactionLore(baseLore, factionId) {
    const faction = getFactionInfo(factionId);
    if (!faction) return baseLore || '';
    return (baseLore || '') + ' / 阵营记录：' + faction.lore;
  }

  const api = Object.freeze({
    FACTIONS,
    getFactionInfo,
    appendFactionLore,
  });

  root.FactionConfig = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);

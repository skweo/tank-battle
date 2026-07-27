(function(root) {
  'use strict';

  const ENEMY_VISUAL_PROFILE = Object.freeze({
    normal: Object.freeze({ glyph: '◇', iconType: 'diamond', color: '#7f8ea3', label: 'STANDARD', threat: '一般' }),
    scout: Object.freeze({ glyph: '◇', iconType: 'radar', color: '#ff7272', label: 'SCOUT', threat: '巡哨' }),
    runner: Object.freeze({ glyph: '⟫', iconType: 'chevron', color: '#ffbf72', label: 'RUSH', threat: '疾袭' }),
    brute: Object.freeze({ glyph: '⬒', iconType: 'shield', color: '#ca8cff', label: 'BULWARK', threat: '重铠' }),
    artillery: Object.freeze({ glyph: '⌁', iconType: 'crosshair', color: '#ff8bd4', label: 'ARTILLERY', threat: '弧炮' }),
    heavy: Object.freeze({ glyph: '⬒', iconType: 'plate', color: '#ff6767', label: 'ASSAULT', threat: '重装' }),
    sniper: Object.freeze({ glyph: '⟐', iconType: 'scope', color: '#8dff8d', label: 'PRECISION', threat: '狙击' }),
    fast: Object.freeze({ glyph: '⟫', iconType: 'streak', color: '#6bbcff', label: 'RAPID', threat: '高速' }),
    flame: Object.freeze({ glyph: '✦', iconType: 'flame', color: '#ff9a48', label: 'INCENDIARY', threat: '火焰' }),
    summoner: Object.freeze({ glyph: '◌', iconType: 'network', color: '#78e7ff', label: 'COMMAND', threat: '召唤' }),
    stealth: Object.freeze({ glyph: '⋄', iconType: 'ghost', color: '#b0b6c3', label: 'PHASE', threat: '隐匿' }),
    splitter: Object.freeze({ glyph: '⫶', iconType: 'segments', color: '#efb36a', label: 'SWARM', threat: '分裂' }),
    regen: Object.freeze({ glyph: '✚', iconType: 'cross', color: '#79f48d', label: 'REGEN', threat: '再生' }),
    laser: Object.freeze({ glyph: '⌁', iconType: 'beam', color: '#9ca8ff', label: 'BEAM', threat: '激光' }),
    miner: Object.freeze({ glyph: '▣', iconType: 'mine', color: '#f0c562', label: 'SAPPER', threat: '布雷' }),
    barrier: Object.freeze({ glyph: '⬡', iconType: 'dome', color: '#76fcff', label: 'BARRIER', threat: '护盾' }),
    missile: Object.freeze({ glyph: '➤', iconType: 'missile', color: '#ff9b7b', label: 'MISSILE', threat: '导弹' }),
    warden: Object.freeze({ glyph: '⌬', iconType: 'scales', color: '#f6e5aa', label: 'JUDICATOR', threat: '裁断' }),
    phase: Object.freeze({ glyph: '◇', iconType: 'rift', color: '#d9b6ff', label: 'RIFT', threat: '裂隙' }),
    boss: Object.freeze({ glyph: '◈', iconType: 'crown', color: '#ffd36f', label: 'BOSS', threat: '首领' }),
    powerup: Object.freeze({ glyph: '⬢', iconType: 'hexgear', color: '#f49800', label: 'MODULE', threat: '模组' }),
    fusion: Object.freeze({ glyph: '⟡', iconType: 'merged', color: '#f3a8ff', label: 'FUSION', threat: '融合' }),
  });

  function getEnemyVisualProfile(type) {
    return ENEMY_VISUAL_PROFILE[type] || ENEMY_VISUAL_PROFILE.normal;
  }

  const api = Object.freeze({
    ENEMY_VISUAL_PROFILE,
    getEnemyVisualProfile,
  });

  root.EnemyVisualProfile = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);

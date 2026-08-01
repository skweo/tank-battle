(function(root) {
  'use strict';

  const DEFINITIONS = Object.freeze([
    Object.freeze({
      id: 'ricochet_starter',
      source: 'level',
      minLevel: 2,
      requires: Object.freeze([]),
      name: '电弧导体',
      desc: '命中后向附近敌人弹射 1 次',
      tradeoff: '启动代价：直击伤害 -22%',
      icon: 'ARC', rarity: 'standard', weight: 1600,
      color: '#72f1ff', rgb: '114,241,255', kind: 'starter',
    }),
    Object.freeze({
      id: 'ricochet_amplifier',
      source: 'level',
      minLevel: 3,
      requires: Object.freeze(['ricochet_starter']),
      name: '低温增幅环',
      desc: '弹射范围扩大至 310，并施加 1.5 秒减速',
      tradeoff: '前置：电弧导体；用敌群间距换取控场',
      icon: 'AMP', rarity: 'rare', weight: 850,
      color: '#8ce8ff', rgb: '140,232,255', kind: 'amplifier',
    }),
    Object.freeze({
      id: 'ricochet_loop',
      source: 'level',
      minLevel: 4,
      requires: Object.freeze(['ricochet_amplifier']),
      name: '回授弹仓',
      desc: '弹射击杀返还 1 弹药、10 帧射击冷却或 18 帧装填',
      tradeoff: '每条弹射链最多触发 1 次回授',
      icon: 'LOOP', rarity: 'rare', weight: 850,
      color: '#8ff7c8', rgb: '143,247,200', kind: 'loop',
    }),
    Object.freeze({
      id: 'ricochet_survival',
      source: 'level',
      minLevel: 5,
      requires: Object.freeze(['ricochet_loop']),
      name: '相位护幕',
      desc: '累计 5 次弹射命中，获得 2.5 秒护盾',
      tradeoff: '护盾计数只接受弹射命中',
      icon: 'AEG', rarity: 'elite', weight: 600,
      color: '#8fffe8', rgb: '143,255,232', kind: 'survival',
    }),
    Object.freeze({
      id: 'ricochet_core',
      source: 'level',
      minLevel: 5,
      requires: Object.freeze(['ricochet_amplifier']),
      name: '零损耗线圈',
      desc: '弹射伤害不再衰减',
      tradeoff: '核心代价：直击伤害 -42%',
      icon: 'CORE', rarity: 'elite', weight: 520,
      color: '#f6e5aa', rgb: '246,229,170', kind: 'core',
    }),
    Object.freeze({
      id: 'ricochet_capstone',
      source: 'level',
      minLevel: 7,
      requires: Object.freeze(['ricochet_survival']),
      name: '三相裂光',
      desc: '弹射上限提升至 3 次，第三跳分裂',
      tradeoff: '终局代价：射击冷却 +30%',
      icon: 'TRI', rarity: 'mythic', weight: 400,
      color: '#f6e5aa', rgb: '246,229,170', kind: 'capstone',
    }),
    Object.freeze({
      id: 'ricochet_relic',
      source: 'boss',
      minLevel: 1,
      requires: Object.freeze(['ricochet_starter']),
      name: '首领遗物·折月棱镜',
      desc: '首跳优先射程边缘并双路分叉',
      tradeoff: '遗物改写：弹射范围 -20%',
      icon: 'RLC', rarity: 'mythic', weight: 1,
      color: '#ffd47a', rgb: '255,212,122', kind: 'relic',
    }),
  ]);

  function getDefinitions() {
    return DEFINITIONS.slice();
  }

  function getEligibleDefinitions(ownedIds = [], options = {}) {
    const owned = new Set(ownedIds);
    const source = options.source || 'level';
    const level = Number.isFinite(options.level) ? options.level : 1;
    return DEFINITIONS.filter(def =>
      def.source === source
      && !owned.has(def.id)
      && level >= def.minLevel
      && def.requires.every(id => owned.has(id))
    );
  }

  function getState(ownedIds = []) {
    const owned = new Set(ownedIds);
    const enabled = owned.has('ricochet_starter');
    const amplified = owned.has('ricochet_amplifier');
    const loop = owned.has('ricochet_loop');
    const survival = owned.has('ricochet_survival');
    const core = owned.has('ricochet_core');
    const capstone = owned.has('ricochet_capstone');
    const relic = owned.has('ricochet_relic');
    const baseRange = amplified ? 310 : 230;
    return Object.freeze({
      enabled,
      range: enabled ? Math.round(baseRange * (relic ? 0.8 : 1)) : 0,
      maxDepth: capstone ? 3 : (enabled ? 1 : 0),
      directDamageMultiplier: core ? 0.58 : (enabled ? 0.78 : 1),
      chainDamageDecay: core ? 1 : 0.72,
      slowFrames: amplified ? 90 : 0,
      cooldownRefund: loop ? 10 : 0,
      ammoRefund: loop ? 1 : 0,
      reloadRefund: loop ? 18 : 0,
      shieldEveryHits: survival ? 5 : 0,
      shieldFrames: survival ? 150 : 0,
      fireDelayMultiplier: capstone ? 1.3 : 1,
      firstBounceTargets: relic ? 2 : 1,
      capstoneTargets: capstone ? 2 : 1,
      preferRangeEdge: relic,
    });
  }

  function selectTargets(options = {}) {
    const state = options.state || getState([]);
    const origin = options.origin || { x: 0, y: 0 };
    const nextDepth = Math.max(1, Number(options.nextDepth) || 1);
    if (!state.enabled || nextDepth > state.maxDepth) return [];
    const visited = new Set(options.visited || []);
    const candidates = (options.candidates || [])
      .filter(target => target && target.alive !== false && !visited.has(target))
      .map(target => ({
        target,
        distance: Math.hypot((target.x || 0) - (origin.x || 0), (target.y || 0) - (origin.y || 0)),
      }))
      .filter(entry => entry.distance <= state.range);
    candidates.sort((a, b) => state.preferRangeEdge ? b.distance - a.distance : a.distance - b.distance);
    const targetCount = nextDepth === 1
      ? state.firstBounceTargets
      : (nextDepth === state.maxDepth ? state.capstoneTargets : 1);
    return candidates.slice(0, targetCount).map(entry => entry.target);
  }

  function getBounceDamage(state, baseDamage, depth) {
    const safeBase = Math.max(0, Number(baseDamage) || 0);
    const safeDepth = Math.max(1, Math.floor(Number(depth) || 1));
    const decay = state && Number.isFinite(state.chainDamageDecay) ? state.chainDamageDecay : 0.72;
    return Math.round(safeBase * Math.pow(decay, safeDepth) * 100) / 100;
  }

  function resolveBounceHit(options = {}) {
    const state = options.state || getState([]);
    const threshold = state.shieldEveryHits || 0;
    const nextMeter = threshold > 0 ? (Math.max(0, options.meter || 0) + 1) % threshold : 0;
    const shieldFrames = threshold > 0 && nextMeter === 0 ? state.shieldFrames : 0;
    const grantsRefund = !!options.killed && !options.refundClaimed && state.cooldownRefund > 0;
    return {
      meter: nextMeter,
      shieldFrames,
      cooldownRefund: grantsRefund ? state.cooldownRefund : 0,
      ammoRefund: grantsRefund ? state.ammoRefund : 0,
      reloadRefund: grantsRefund ? state.reloadRefund : 0,
      refundClaimed: !!options.refundClaimed || grantsRefund,
    };
  }

  const api = Object.freeze({
    getDefinitions,
    getEligibleDefinitions,
    getState,
    selectTargets,
    getBounceDamage,
    resolveBounceHit,
  });

  root.RicochetBuild = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);

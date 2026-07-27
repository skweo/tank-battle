(function(root) {
  'use strict';

  const TURRET_SPEED_FACTION = Object.freeze({
    observatory: 0.16,
    storm_cloister: 0.10,
    void_cult: 0.07,
    moon_arsenal: 0.05,
    ash_church: 0.03,
    graveyard: 0.015,
  });

  const TURRET_SPEED_PLAYER = Object.freeze({
    sniper: 0.25,
    scarlet: 0.25,
    homing: 0.17,
    astral: 0.17,
    focus: 0.12,
    blade: 0.12,
    spread: 0.07,
    burst: 0.07,
    wide: 0.03,
    border: 0.03,
  });

  const TANK_FORM_FACTORS = Object.freeze({
    spread: Object.freeze({ visual: Object.freeze([1.00, 1.04, 1.08]), hit: Object.freeze([1.00, 1.03, 1.06]) }),
    focus: Object.freeze({ visual: Object.freeze([0.96, 0.92, 0.90]), hit: Object.freeze([0.94, 0.90, 0.88]) }),
    wide: Object.freeze({ visual: Object.freeze([1.05, 1.10, 1.15]), hit: Object.freeze([1.05, 1.08, 1.12]) }),
    burst: Object.freeze({ visual: Object.freeze([1.06, 1.12, 1.16]), hit: Object.freeze([1.06, 1.10, 1.14]) }),
    sniper: Object.freeze({ visual: Object.freeze([0.92, 0.90, 0.88]), hit: Object.freeze([0.90, 0.88, 0.86]) }),
    homing: Object.freeze({ visual: Object.freeze([0.98, 1.00, 0.96]), hit: Object.freeze([0.96, 0.96, 0.94]) }),
    border: Object.freeze({ visual: Object.freeze([1.00, 0.96, 0.92]), hit: Object.freeze([0.98, 0.94, 0.90]) }),
    blade: Object.freeze({ visual: Object.freeze([0.94, 0.90, 0.88]), hit: Object.freeze([0.92, 0.89, 0.86]) }),
    scarlet: Object.freeze({ visual: Object.freeze([1.03, 1.08, 1.10]), hit: Object.freeze([1.02, 1.06, 1.08]) }),
    astral: Object.freeze({ visual: Object.freeze([1.02, 1.05, 1.04]), hit: Object.freeze([1.00, 1.02, 1.00]) }),
  });

  function getTankFormFactor(tankType, evoLevel, kind) {
    const factors = TANK_FORM_FACTORS[tankType] || TANK_FORM_FACTORS.spread;
    const arr = factors[kind] || factors.visual || [1, 1, 1];
    const idx = Math.max(0, Math.min(arr.length - 1, evoLevel || 0));
    return arr[idx] || 1;
  }

  const api = Object.freeze({
    TURRET_SPEED_FACTION,
    TURRET_SPEED_PLAYER,
    TANK_FORM_FACTORS,
    getTankFormFactor,
  });

  root.TankConfig = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);

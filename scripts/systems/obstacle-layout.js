(function(root) {
  'use strict';

  const DEFAULTS = Object.freeze({
    edgeMargin: 48,
    routeGap: 140,
    routeLaneWidth: 96,
    obstacleGap: 12,
    navigationGridSize: 24,
    tankClearance: 20,
    placementAttempts: 90,
    maxObstacleCount: 30,
    maxLargeBarriers: 2,
    maxBlockedAreaRatio: 0.09,
  });

  const ARCHETYPES = Object.freeze({
    small_cover: Object.freeze({
      minW: 34, maxW: 78, minH: 24, maxH: 54, passable: false, slow: 0,
      skins: Object.freeze(['wall', 'rubble', 'crystal', 'metal', 'bunker', 'bounce', 'iron', 'wreck', 'stone_lg', 'ruins', 'reactor', 'spires', 'pipes']),
    }),
    slow_field: Object.freeze({
      minW: 78, maxW: 156, minH: 52, maxH: 116, passable: true, slow: 0.4,
      skins: Object.freeze(['bush', 'water', 'brush', 'crater', 'energy', 'trench', 'scorched', 'stone_sm', 'gravel']),
    }),
    destructible_cover: Object.freeze({
      minW: 26, maxW: 58, minH: 20, maxH: 46, passable: false, slow: 0,
      skins: Object.freeze(['crate', 'barrel', 'plank']),
    }),
  });

  const SKIN_BEHAVIOR = Object.freeze({
    bush: { slow: 0.5 },
    water: { slow: 0.3 },
    brush: { slow: 0.2, conceal: true },
    crater: { slow: 0.35 },
    energy: { slow: 0.25 },
    trench: { slow: 0.45 },
    scorched: { slow: 0.2 },
    stone_sm: { slow: 0.15 },
    gravel: { slow: 0.4 },
    crate: { hp: 1, destructible: true },
    barrel: { hp: 2, explosive: true },
    plank: { hp: 1, destructible: true },
    bounce: { ricochet: true },
    iron: { spark: true },
  });

  const SKIN_WEIGHTS = Object.freeze({
    wall: 25, bush: 15, water: 12, rubble: 15, crate: 12, crystal: 8,
    metal: 8, bunker: 5, barrel: 8, bounce: 6, brush: 7, crater: 10,
    energy: 8, wreck: 10, trench: 6, scorched: 7, ruins: 7, reactor: 5,
    spires: 6, stone_sm: 15, stone_lg: 12, plank: 9, iron: 8, gravel: 11,
    pipes: 7,
  });

  const ARCHETYPE_WEIGHTS = Object.freeze({
    small_cover: 122,
    slow_field: 91,
    destructible_cover: 29,
  });

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function overlaps(a, b, gap = 0) {
    return a.x < b.x + b.w + gap && a.x + a.w + gap > b.x
      && a.y < b.y + b.h + gap && a.y + a.h + gap > b.y;
  }

  function pickWeighted(random, entries, getWeight) {
    const totalWeight = entries.reduce((total, entry) => total + getWeight(entry), 0);
    let roll = random() * totalWeight;
    for (const entry of entries) {
      roll -= getWeight(entry);
      if (roll < 0) return entry;
    }
    return entries[entries.length - 1];
  }

  function getDefaultKeepOutZones(width, height) {
    return [
      { id: 'player_spawn', x: width / 2 - 170, y: height - 220, w: 340, h: 190 },
      { id: 'player_exit', x: width / 2 - 64, y: height - 350, w: 128, h: 130 },
      { id: 'boss_center', x: width / 2 - 110, y: height * 0.2, w: 220, h: height * 0.2 },
      { id: 'boss_left', x: width * 0.33 - 90, y: height * 0.2, w: 180, h: height * 0.17 },
      { id: 'boss_right', x: width * 0.67 - 90, y: height * 0.2, w: 180, h: height * 0.17 },
    ];
  }

  function createRouteLanes(barrier, width, height, config) {
    const edge = config.edgeMargin;
    const laneWidth = config.routeLaneWidth;
    if (barrier.orientation === 'horizontal') {
      const leftCenter = edge + (barrier.x - edge) / 2;
      const rightStart = barrier.x + barrier.w;
      const rightCenter = rightStart + (width - edge - rightStart) / 2;
      return [leftCenter, rightCenter].map(center => ({
        x: center - laneWidth / 2,
        y: edge,
        w: laneWidth,
        h: height - edge * 2,
      }));
    }
    const topCenter = edge + (barrier.y - edge) / 2;
    const bottomStart = barrier.y + barrier.h;
    const bottomCenter = bottomStart + (height - edge - bottomStart) / 2;
    return [topCenter, bottomCenter].map(center => ({
      x: edge,
      y: center - laneWidth / 2,
      w: width - edge * 2,
      h: laneWidth,
    }));
  }

  function createLongBarrier(width, height, random, config) {
    const horizontal = random() < 0.5;
    const majorSize = horizontal ? width : height;
    const minorSize = horizontal ? height : width;
    const maxLength = Math.min(420, majorSize - (config.edgeMargin + config.routeGap) * 2);
    const minLength = Math.min(260, maxLength);
    const length = clamp(minLength + random() * Math.max(0, maxLength - minLength), minLength, maxLength);
    const thickness = 30 + random() * 12;
    const majorStart = config.edgeMargin + config.routeGap
      + random() * Math.max(0, majorSize - (config.edgeMargin + config.routeGap) * 2 - length);
    const minorStart = config.edgeMargin
      + random() * Math.max(0, minorSize - config.edgeMargin * 2 - thickness);
    const barrier = horizontal
      ? { x: majorStart, y: minorStart, w: length, h: thickness }
      : { x: minorStart, y: majorStart, w: thickness, h: length };
    barrier.type = 'long_barrier';
    barrier.archetype = 'long_barrier';
    barrier.orientation = horizontal ? 'horizontal' : 'vertical';
    barrier.passable = false;
    barrier.slow = 0;
    barrier.routeLanes = createRouteLanes(barrier, width, height, config);
    return barrier;
  }

  function createObstacle(archetype, width, height, random, config) {
    const definition = ARCHETYPES[archetype];
    const type = pickWeighted(random, definition.skins, skin => SKIN_WEIGHTS[skin] || 1);
    const behavior = SKIN_BEHAVIOR[type] || {};
    const w = definition.minW + random() * (definition.maxW - definition.minW);
    const h = definition.minH + random() * (definition.maxH - definition.minH);
    return {
      x: config.edgeMargin + random() * Math.max(0, width - config.edgeMargin * 2 - w),
      y: config.edgeMargin + random() * Math.max(0, height - config.edgeMargin * 2 - h),
      w,
      h,
      type,
      archetype,
      passable: definition.passable,
      slow: behavior.slow ?? definition.slow,
      ...behavior,
    };
  }

  function blocksBarrierRoute(candidate, obstacles) {
    if (candidate.passable) return false;
    return obstacles.some(obstacle => obstacle.archetype === 'long_barrier'
      && obstacle.routeLanes.some(lane => overlaps(candidate, lane)));
  }

  function getBlockedArea(obstacles) {
    return obstacles.reduce((total, obstacle) => (
      obstacle.passable ? total : total + obstacle.w * obstacle.h
    ), 0);
  }

  function getNavigationAnchors(obstacles, width, height) {
    const anchors = [
      { x: width / 2, y: height - 100 },
      { x: width / 2 - 80, y: height - 100 },
      { x: width / 2 + 80, y: height - 100 },
      { x: width / 2, y: height * 0.28 },
      { x: width * 0.33, y: height * 0.28 },
      { x: width * 0.67, y: height * 0.28 },
    ];
    for (const barrier of obstacles) {
      if (barrier.archetype !== 'long_barrier' || !Array.isArray(barrier.routeLanes)) continue;
      for (const lane of barrier.routeLanes) {
        anchors.push(barrier.orientation === 'vertical'
          ? { x: barrier.x + barrier.w / 2, y: lane.y + lane.h / 2 }
          : { x: lane.x + lane.w / 2, y: barrier.y + barrier.h / 2 });
      }
    }
    return anchors;
  }

  function hasRequiredRoutes(obstacles, width, height, config = DEFAULTS) {
    config = { ...DEFAULTS, ...config };
    const blocking = obstacles.filter(obstacle => obstacle && !obstacle.passable);
    const clearance = config.tankClearance;
    const step = config.navigationGridSize;
    const columns = Math.floor((width - clearance * 2) / step) + 1;
    const rows = Math.floor((height - clearance * 2) / step) + 1;
    if (columns < 1 || rows < 1) return false;

    const toCell = point => ({
      column: clamp(Math.round((point.x - clearance) / step), 0, columns - 1),
      row: clamp(Math.round((point.y - clearance) / step), 0, rows - 1),
    });
    const isBlocked = (column, row) => {
      const x = clearance + column * step;
      const y = clearance + row * step;
      return blocking.some(obstacle => (
        x > obstacle.x - clearance && x < obstacle.x + obstacle.w + clearance
        && y > obstacle.y - clearance && y < obstacle.y + obstacle.h + clearance
      ));
    };
    const anchors = getNavigationAnchors(obstacles, width, height).map(toCell);
    if (anchors.some(anchor => isBlocked(anchor.column, anchor.row))) return false;

    const start = anchors[0];
    const visited = new Uint8Array(columns * rows);
    const queue = [start];
    visited[start.row * columns + start.column] = 1;
    for (let cursor = 0; cursor < queue.length; cursor++) {
      const cell = queue[cursor];
      const neighbors = [
        [cell.column - 1, cell.row], [cell.column + 1, cell.row],
        [cell.column, cell.row - 1], [cell.column, cell.row + 1],
      ];
      for (const [column, row] of neighbors) {
        if (column < 0 || column >= columns || row < 0 || row >= rows) continue;
        const index = row * columns + column;
        if (visited[index] || isBlocked(column, row)) continue;
        visited[index] = 1;
        queue.push({ column, row });
      }
    }
    return anchors.every(anchor => visited[anchor.row * columns + anchor.column] === 1);
  }

  function canPlace(candidate, obstacles, keepOutZones, config, width, height) {
    if (![candidate.x, candidate.y, candidate.w, candidate.h].every(Number.isFinite)) return false;
    if (candidate.w <= 0 || candidate.h <= 0
      || candidate.x < 0 || candidate.y < 0
      || candidate.x + candidate.w > width || candidate.y + candidate.h > height) return false;
    if (keepOutZones.some(zone => overlaps(candidate, zone))) return false;
    if (obstacles.some(obstacle => overlaps(candidate, obstacle, config.obstacleGap))) return false;
    if (blocksBarrierRoute(candidate, obstacles)) return false;
    if (!candidate.passable
      && getBlockedArea(obstacles) + candidate.w * candidate.h
        > width * height * config.maxBlockedAreaRatio) return false;
    if (candidate.archetype === 'long_barrier') {
      const blockingObstacles = obstacles.filter(obstacle => !obstacle.passable);
      if (candidate.routeLanes.some(lane => blockingObstacles.some(obstacle => overlaps(lane, obstacle)))) return false;
    }
    if (!candidate.passable && !hasRequiredRoutes([...obstacles, candidate], width, height, config)) return false;
    return true;
  }

  function placeObstacle(archetype, width, height, random, config, obstacles, keepOutZones) {
    for (let attempt = 0; attempt < config.placementAttempts; attempt++) {
      const candidate = createObstacle(archetype, width, height, random, config);
      if (!canPlace(candidate, obstacles, keepOutZones, config, width, height)) continue;
      return candidate;
    }
    return null;
  }

  function placeLongBarrier(width, height, random, config, obstacles, keepOutZones) {
    for (let attempt = 0; attempt < config.placementAttempts; attempt++) {
      const candidate = createLongBarrier(width, height, random, config);
      if (canPlace(candidate, obstacles, keepOutZones, config, width, height)) return candidate;
    }
    return null;
  }

  function pickArchetype(random) {
    return pickWeighted(random, Object.keys(ARCHETYPE_WEIGHTS), role => ARCHETYPE_WEIGHTS[role]);
  }

  function generate(options = {}) {
    const width = Math.max(480, Number(options.width) || 1680);
    const height = Math.max(360, Number(options.height) || 1080);
    const count = Math.max(0, Math.floor(Number(options.count) || 0));
    const random = typeof options.random === 'function' ? options.random : Math.random;
    const config = { ...DEFAULTS, ...(options.config || {}) };
    const keepOutZones = Array.isArray(options.keepOutZones)
      ? options.keepOutZones
      : getDefaultKeepOutZones(width, height);
    const targetCount = Math.min(Math.max(0, count), config.maxObstacleCount);
    const existing = Array.isArray(options.existing) ? options.existing.filter(Boolean) : [];
    const obstacles = [];
    for (const obstacle of existing) {
      if (obstacles.length >= targetCount) break;
      if (obstacle.archetype === 'long_barrier'
        && obstacles.filter(entry => entry.archetype === 'long_barrier').length >= config.maxLargeBarriers) continue;
      if (canPlace(obstacle, obstacles, keepOutZones, config, width, height)) obstacles.push(obstacle);
    }
    const barrierCount = obstacles.filter(obstacle => obstacle.archetype === 'long_barrier').length;
    if (targetCount >= 12 && config.maxLargeBarriers >= 1 && barrierCount < 1) {
      const barrier = placeLongBarrier(width, height, random, config, obstacles, keepOutZones);
      if (barrier) obstacles.push(barrier);
    }
    if (targetCount >= 24 && config.maxLargeBarriers >= 2
      && obstacles.filter(obstacle => obstacle.archetype === 'long_barrier').length < 2
      && random() < 0.55) {
      const barrier = placeLongBarrier(width, height, random, config, obstacles, keepOutZones);
      if (barrier) obstacles.push(barrier);
    }

    const presentRoles = new Set(obstacles.map(obstacle => obstacle.archetype));
    const requiredRoles = targetCount >= 4
      ? ['small_cover', 'slow_field', 'destructible_cover'].filter(role => !presentRoles.has(role))
      : [];
    let failedPlacements = 0;
    while (obstacles.length < targetCount && failedPlacements < config.placementAttempts) {
      const archetype = requiredRoles.shift() || pickArchetype(random);
      const obstacle = placeObstacle(archetype, width, height, random, config, obstacles, keepOutZones);
      if (obstacle) {
        obstacles.push(obstacle);
        failedPlacements = 0;
      } else {
        failedPlacements++;
      }
    }
    return obstacles;
  }

  const api = Object.freeze({ generate, getDefaultKeepOutZones, hasRequiredRoutes, DEFAULTS });
  root.ObstacleLayout = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);

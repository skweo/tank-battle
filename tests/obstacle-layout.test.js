#!/usr/bin/env node
const test = require('node:test');
const assert = require('node:assert/strict');

const ObstacleLayout = require('../scripts/systems/obstacle-layout.js');

function mulberry32(seed) {
  return function random() {
    let value = seed += 0x6D2B79F5;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x
    && a.y < b.y + b.h && a.y + a.h > b.y;
}

test('standard maps contain a bounded long barrier with two open route lanes', () => {
  const obstacles = ObstacleLayout.generate({
    width: 1680,
    height: 1080,
    count: 20,
    random: mulberry32(1),
  });

  const barriers = obstacles.filter(obstacle => obstacle.archetype === 'long_barrier');
  assert.ok(barriers.length >= 1 && barriers.length <= 2);

  for (const barrier of barriers) {
    assert.ok(barrier.x >= 0 && barrier.y >= 0);
    assert.ok(barrier.x + barrier.w <= 1680 && barrier.y + barrier.h <= 1080);
    assert.ok(Math.max(barrier.w, barrier.h) / Math.min(barrier.w, barrier.h) >= 6);
    assert.equal(barrier.routeLanes.length, 2);
    for (const lane of barrier.routeLanes) {
      assert.ok(obstacles.every(obstacle => obstacle === barrier || obstacle.passable || !overlaps(lane, obstacle)));
    }
  }
});

test('standard maps expose all four obstacle spatial roles', () => {
  for (let seed = 1; seed <= 32; seed++) {
    const obstacles = ObstacleLayout.generate({
      width: 1680,
      height: 1080,
      count: 24,
      random: mulberry32(seed),
    });
    const roles = new Set(obstacles.map(obstacle => obstacle.archetype));

    assert.deepEqual(
      [...roles].sort(),
      ['destructible_cover', 'long_barrier', 'slow_field', 'small_cover'],
    );
  }
});

test('generated layouts stay in bounds, avoid spawn zones, and never overlap', () => {
  const width = 1680;
  const height = 1080;
  const keepOutZones = ObstacleLayout.getDefaultKeepOutZones(width, height);

  for (let seed = 1; seed <= 32; seed++) {
    const obstacles = ObstacleLayout.generate({
      width,
      height,
      count: 28,
      random: mulberry32(seed),
    });
    for (const obstacle of obstacles) {
      assert.ok(obstacle.x >= 0 && obstacle.y >= 0);
      assert.ok(obstacle.x + obstacle.w <= width && obstacle.y + obstacle.h <= height);
      assert.ok(keepOutZones.every(zone => !overlaps(obstacle, zone)));
    }
    assert.equal(ObstacleLayout.hasRequiredRoutes(obstacles, width, height), true);
    for (let first = 0; first < obstacles.length; first++) {
      for (let second = first + 1; second < obstacles.length; second++) {
        assert.ok(!overlaps(obstacles[first], obstacles[second]));
      }
    }
  }
});

test('late maps respect count and blocked-area budgets while varying barrier direction', () => {
  const width = 1680;
  const height = 1080;
  const orientations = new Set();
  let largestBarrierCount = 0;

  for (let seed = 1; seed <= 64; seed++) {
    const obstacles = ObstacleLayout.generate({
      width,
      height,
      count: 100,
      random: mulberry32(seed),
    });
    const barriers = obstacles.filter(obstacle => obstacle.archetype === 'long_barrier');
    const blockedArea = obstacles
      .filter(obstacle => !obstacle.passable)
      .reduce((total, obstacle) => total + obstacle.w * obstacle.h, 0);

    barriers.forEach(barrier => orientations.add(barrier.orientation));
    largestBarrierCount = Math.max(largestBarrierCount, barriers.length);
    assert.ok(obstacles.length <= ObstacleLayout.DEFAULTS.maxObstacleCount);
    assert.ok(barriers.length <= ObstacleLayout.DEFAULTS.maxLargeBarriers);
    assert.ok(blockedArea <= width * height * ObstacleLayout.DEFAULTS.maxBlockedAreaRatio);
  }

  assert.deepEqual([...orientations].sort(), ['horizontal', 'vertical']);
  assert.equal(largestBarrierCount, 2);
});

test('refresh layouts preserve existing obstacles without mutating the source array', () => {
  const existing = [
    {
      x: 620, y: 470, w: 300, h: 36,
      type: 'long_barrier', archetype: 'long_barrier', orientation: 'horizontal',
      passable: false, slow: 0,
      routeLanes: [
        { x: 48, y: 48, w: 96, h: 864 },
        { x: 936, y: 48, w: 96, h: 864 },
      ],
    },
    { x: 300, y: 300, w: 50, h: 40, type: 'wall', archetype: 'small_cover', passable: false, slow: 0 },
  ];
  const before = JSON.stringify(existing);
  const refreshed = ObstacleLayout.generate({
    width: 1080,
    height: 960,
    count: 12,
    existing,
    keepOutZones: [{ x: 520, y: 760, w: 120, h: 120 }],
    random: mulberry32(42),
  });

  assert.equal(JSON.stringify(existing), before);
  assert.ok(refreshed.some(obstacle => obstacle === existing[0]));
  assert.ok(refreshed.length <= ObstacleLayout.DEFAULTS.maxObstacleCount);
  for (const obstacle of refreshed) {
    assert.ok(!overlaps(obstacle, { x: 520, y: 760, w: 120, h: 120 }));
    if (!obstacle.passable && obstacle !== existing[0]) {
      assert.ok(existing[0].routeLanes.every(lane => !overlaps(obstacle, lane)));
    }
  }
  for (let first = 0; first < refreshed.length; first++) {
    for (let second = first + 1; second < refreshed.length; second++) {
      assert.ok(!overlaps(refreshed[first], refreshed[second]));
    }
  }
});

test('refresh drops existing obstacles that enter a new keep-out zone', () => {
  const keepOutZone = { x: 520, y: 760, w: 120, h: 120 };
  const staleObstacle = {
    x: 540, y: 780, w: 80, h: 60,
    type: 'water', archetype: 'slow_field', passable: true, slow: 0.3,
  };
  const existing = [staleObstacle];
  const refreshed = ObstacleLayout.generate({
    width: 1080,
    height: 960,
    count: 8,
    existing,
    keepOutZones: [keepOutZone],
    random: mulberry32(7),
  });

  assert.equal(existing[0], staleObstacle);
  assert.ok(!refreshed.includes(staleObstacle));
  assert.ok(refreshed.every(obstacle => !overlaps(obstacle, keepOutZone)));
});

test('refresh rejects stale existing obstacles outside the battlefield', () => {
  const outside = {
    x: 1060, y: 400, w: 60, h: 40,
    type: 'wall', archetype: 'small_cover', passable: false, slow: 0,
  };
  const refreshed = ObstacleLayout.generate({
    width: 1080,
    height: 960,
    count: 6,
    existing: [outside],
    keepOutZones: [],
    random: mulberry32(17),
  });

  assert.ok(!refreshed.includes(outside));
  assert.ok(refreshed.every(obstacle => obstacle.x + obstacle.w <= 1080));
});

test('route validation rejects a battlefield cut off between player and Boss zones', () => {
  const sealedLayout = [{
    x: 0, y: 620, w: 1680, h: 50,
    type: 'wall', archetype: 'small_cover', passable: false, slow: 0,
  }];

  assert.equal(ObstacleLayout.hasRequiredRoutes(sealedLayout, 1680, 1080), false);
});

test('legacy crystal cover remains in the weighted small-cover pool', () => {
  const values = [0.1, 0.35, 0.5, 0.5, 0.1, 0.1];
  let index = 0;
  const obstacles = ObstacleLayout.generate({
    width: 1680,
    height: 1080,
    count: 1,
    keepOutZones: [],
    random: () => values[index++] ?? 0.1,
  });

  assert.equal(obstacles.length, 1);
  assert.equal(obstacles[0].type, 'crystal');
  assert.equal(obstacles[0].archetype, 'small_cover');
});

#!/usr/bin/env node
const test = require('node:test');
const assert = require('node:assert/strict');

const RicochetBuild = require('../scripts/systems/ricochet-build.js');

test('definitions are exposed for game integration without mutating the source list', () => {
  const definitions = RicochetBuild.getDefinitions();
  assert.deepEqual(definitions.map(def => def.id), [
    'ricochet_starter',
    'ricochet_amplifier',
    'ricochet_loop',
    'ricochet_survival',
    'ricochet_core',
    'ricochet_capstone',
    'ricochet_relic',
  ]);
  assert.notEqual(definitions, RicochetBuild.getDefinitions());
});

test('ricochet build unlocks one component at a time in dependency order', () => {
  const initial = RicochetBuild.getEligibleDefinitions([], { source: 'level', level: 2 });
  assert.deepEqual(initial.map(def => def.id), ['ricochet_starter']);

  const afterStarter = RicochetBuild.getEligibleDefinitions(['ricochet_starter'], { source: 'level', level: 3 });
  assert.deepEqual(afterStarter.map(def => def.id), ['ricochet_amplifier']);

  const afterAmplifier = RicochetBuild.getEligibleDefinitions(
    ['ricochet_starter', 'ricochet_amplifier'],
    { source: 'level', level: 4 },
  );
  assert.deepEqual(afterAmplifier.map(def => def.id), ['ricochet_loop']);
});

test('survival, core, capstone, and boss relic cannot skip their prerequisites', () => {
  const throughLoop = ['ricochet_starter', 'ricochet_amplifier', 'ricochet_loop'];
  assert.deepEqual(
    RicochetBuild.getEligibleDefinitions(throughLoop, { source: 'level', level: 5 }).map(def => def.id),
    ['ricochet_survival', 'ricochet_core'],
  );
  assert.deepEqual(
    RicochetBuild.getEligibleDefinitions([...throughLoop, 'ricochet_survival'], { source: 'level', level: 7 }).map(def => def.id),
    ['ricochet_core', 'ricochet_capstone'],
  );
  assert.deepEqual(RicochetBuild.getEligibleDefinitions([], { source: 'boss', level: 4 }), []);
  assert.deepEqual(
    RicochetBuild.getEligibleDefinitions(['ricochet_starter'], { source: 'boss', level: 4 }).map(def => def.id),
    ['ricochet_relic'],
  );
});

test('build state exposes the starter drawback and later rule changes', () => {
  const starter = RicochetBuild.getState(['ricochet_starter']);
  assert.equal(starter.enabled, true);
  assert.equal(starter.maxDepth, 1);
  assert.equal(starter.range, 230);
  assert.equal(starter.directDamageMultiplier, 0.78);
  assert.equal(starter.chainDamageDecay, 0.72);

  const complete = RicochetBuild.getState([
    'ricochet_starter',
    'ricochet_amplifier',
    'ricochet_loop',
    'ricochet_survival',
    'ricochet_core',
    'ricochet_capstone',
    'ricochet_relic',
  ]);
  assert.equal(complete.range, 248);
  assert.equal(complete.slowFrames, 90);
  assert.equal(complete.chainDamageDecay, 1);
  assert.equal(complete.directDamageMultiplier, 0.58);
  assert.equal(complete.maxDepth, 3);
  assert.equal(complete.fireDelayMultiplier, 1.3);
  assert.equal(complete.firstBounceTargets, 2);
  assert.equal(complete.capstoneTargets, 2);
});

test('target selection excludes visited enemies and applies relic and capstone forks', () => {
  const origin = { x: 0, y: 0 };
  const near = { x: 40, y: 0, alive: true };
  const middle = { x: 100, y: 0, alive: true };
  const edge = { x: 180, y: 0, alive: true };
  const outside = { x: 260, y: 0, alive: true };
  const candidates = [outside, edge, near, middle];

  const starter = RicochetBuild.getState(['ricochet_starter']);
  assert.deepEqual(
    RicochetBuild.selectTargets({ state: starter, origin, candidates, visited: [], nextDepth: 1 }),
    [near],
  );
  assert.deepEqual(
    RicochetBuild.selectTargets({ state: starter, origin, candidates, visited: [near], nextDepth: 1 }),
    [middle],
  );

  const relic = RicochetBuild.getState(['ricochet_starter', 'ricochet_relic']);
  assert.deepEqual(
    RicochetBuild.selectTargets({ state: relic, origin, candidates, visited: [], nextDepth: 1 }),
    [edge, middle],
  );

  const capstone = RicochetBuild.getState(['ricochet_starter', 'ricochet_capstone']);
  assert.deepEqual(
    RicochetBuild.selectTargets({ state: capstone, origin, candidates, visited: [], nextDepth: 3 }),
    [near, middle],
  );
  assert.deepEqual(
    RicochetBuild.selectTargets({ state: starter, origin, candidates, visited: [], nextDepth: 2 }),
    [],
  );
});

test('bounce outcomes apply decay, one resource refund per chain, and shield thresholds', () => {
  const starter = RicochetBuild.getState(['ricochet_starter']);
  assert.equal(RicochetBuild.getBounceDamage(starter, 10, 1), 7.2);

  const coreLoop = RicochetBuild.getState([
    'ricochet_starter',
    'ricochet_amplifier',
    'ricochet_loop',
    'ricochet_survival',
    'ricochet_core',
  ]);
  assert.equal(RicochetBuild.getBounceDamage(coreLoop, 10, 3), 10);

  const triggered = RicochetBuild.resolveBounceHit({
    state: coreLoop,
    meter: 4,
    killed: true,
    refundClaimed: false,
  });
  assert.deepEqual(triggered, {
    meter: 0,
    shieldFrames: 150,
    cooldownRefund: 10,
    ammoRefund: 1,
    reloadRefund: 18,
    refundClaimed: true,
  });

  const alreadyRefunded = RicochetBuild.resolveBounceHit({
    state: coreLoop,
    meter: 0,
    killed: true,
    refundClaimed: true,
  });
  assert.equal(alreadyRefunded.cooldownRefund, 0);
  assert.equal(alreadyRefunded.ammoRefund, 0);
  assert.equal(alreadyRefunded.refundClaimed, true);
});

test('upgrade definitions communicate benefits, prerequisites, and visible drawbacks', () => {
  const starter = RicochetBuild.getEligibleDefinitions([], { source: 'level', level: 2 })[0];
  assert.match(starter.name, /电弧/);
  assert.match(starter.desc, /弹射/);
  assert.match(starter.tradeoff, /直击伤害 -22%/);

  const core = RicochetBuild.getEligibleDefinitions(
    ['ricochet_starter', 'ricochet_amplifier'],
    { source: 'level', level: 5 },
  ).find(def => def.id === 'ricochet_core');
  assert.equal(core.kind, 'core');
  assert.match(core.desc, /不再衰减/);
  assert.match(core.tradeoff, /直击伤害 -42%/);

  const relic = RicochetBuild.getEligibleDefinitions(
    ['ricochet_starter'],
    { source: 'boss', level: 4 },
  )[0];
  assert.equal(relic.kind, 'relic');
  assert.match(relic.desc, /双路分叉/);
  assert.match(relic.tradeoff, /范围 -20%/);
});

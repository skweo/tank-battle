# 0020 Boss random order and progression

Status: completed

Labels: boss, gameplay, P2

## Goal

Make Boss order feel roguelike while keeping early runs readable and preserving clear-mode archive tracking.

## CCGS Perspective

- `game-designer`: protect the early difficulty curve while increasing run variety.
- `gameplay-programmer`: keep selection policy deterministic under an injected random source and separate from spawn state.
- `qa-lead`: verify tier gates, repeat protection, clear-mode archive behavior, and browser integration.

## Design Decision

The old roadmap described "six weaker Bosses" and "two strongest Bosses", but the current runtime roster has 21 Bosses across three tiers. Tier metadata is the maintained source of truth: the first three Boss waves use tier 1, and the fourth Boss wave opens all tiers.

## Scope

- Keep the first three Boss waves restricted to tier 1.
- Allow tier 3 Bosses from the fourth Boss wave onward.
- Avoid consecutive Boss repeats and prefer a faction change when alternatives exist.
- Prefer unseen Bosses in clear mode without mutating the selector's input state.
- Extract the selection policy into a focused, testable module.

## Out Of Scope

- Do not change Boss HP, bullet patterns, or wave pacing.
- Do not change the Boss roster or archive completion counts.

## Files

- `scripts/systems/boss-selection.js`
- `scripts/game.js`
- `index.html`
- `tests/boss-selection.test.js`
- `tests/smoke.js`
- `docs/OPTIMIZATION_ROADMAP.md`
- `docs/PROJECT_CONTEXT.md`

## Acceptance Criteria

- Boss waves 1-3 only select tier 1 entries.
- Boss wave 4 can select a tier 3 entry.
- Clear mode still prefers unseen Bosses.
- Existing smoke and all focused tests pass.

## Manual Play Acceptance

- Across two fresh runs, the first three Boss waves never show a tier 2 or tier 3 Boss.
- From the fourth Boss wave onward, higher-tier Bosses can appear without changing the four-wave pacing.
- Consecutive Boss waves do not repeat the same Boss when another eligible Boss exists.
- Boss warning, spawn, archive tracking, and clear settlement still behave normally.

## Test Commands

```powershell
node tests/boss-selection.test.js
node tests/smoke.js
npm run test:all
```

## Verification

- `node tests/boss-selection.test.js`: 7/7 passing.
- `node --check scripts/systems/boss-selection.js`: passing.
- `node --check scripts/game.js`: passing.
- `node tests/smoke.js`: 37/37 passing.
- `npm.cmd run test:all`: 12/12 test files passing.

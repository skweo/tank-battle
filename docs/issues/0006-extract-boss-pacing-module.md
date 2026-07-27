# 0006 Extract Boss Pacing Module

Status: done
Labels: architecture, test, P1

## Background

Clear-mode Boss pacing is a small, deterministic seam. It was the first recommended extraction after the decomposition ADR because it does not depend on Canvas, audio, DOM rendering, or combat entities.

## Goal

Move Boss pacing calculations out of `scripts/game.js` into a focused module while preserving browser behavior and smoke coverage.

## Scope

- Create `scripts/systems/boss-pacing.js`.
- Expose a `BossPacing` interface for pure calculations.
- Keep thin `game.js` adapter functions for game-global state.
- Load the new script before `scripts/game.js` in `index.html`.
- Update `tests/smoke.js` to mirror browser script order.
- Add a focused Node test for Boss pacing behavior.

## Result

- Added `scripts/systems/boss-pacing.js`.
- Added `tests/boss-pacing.test.js`.
- Updated `index.html` script order.
- Updated `tests/smoke.js` runtime loading.
- Added a smoke host check that verifies `scripts/systems/boss-pacing.js` loads before `scripts/game.js`.
- Verified focused and smoke tests.

## Test Commands

```powershell
node tests/boss-pacing.test.js
node --check scripts/systems/boss-pacing.js
node --check scripts/game.js
node tests/smoke.js
```

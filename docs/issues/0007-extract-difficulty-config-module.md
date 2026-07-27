# 0007 Extract Difficulty Config Module

Status: done
Labels: architecture, test, P1

## Background

Difficulty settings are static tuning data used by menus, spawning, Boss pacing, player HP, progression unlocks, leaderboard buckets, and run initialization. Keeping them in `game.js` makes balance changes harder to review.

## Goal

Move `difficultySettings` and `DIFFICULTY_ORDER` out of `scripts/game.js` into a focused static configuration module.

## Scope

- Create `scripts/systems/difficulty-config.js`.
- Expose a `DifficultyConfig` interface with frozen difficulty data.
- Keep `game.js` constants as aliases for existing call sites.
- Load difficulty config before Boss pacing and `game.js`.
- Update smoke script-order checks.
- Add a focused Node test for difficulty order and tuning values.

## Result

- Added `scripts/systems/difficulty-config.js`.
- Added `tests/difficulty-config.test.js`.
- Updated `index.html` script order.
- Updated `tests/smoke.js` runtime loading and script-order checks.
- Verified focused and smoke tests.

## Test Commands

```powershell
node tests/difficulty-config.test.js
node tests/boss-pacing.test.js
node --check scripts/systems/difficulty-config.js
node --check scripts/game.js
node tests/smoke.js
```

# 0008 Extract Faction Config Module

Status: done
Labels: architecture, test, P1

## Background

Faction metadata is static world and UI data used by bestiary rows, enemy markers, lore text, and visual faction coloring. It is a low-risk static seam because callers only read the data.

## Goal

Move `FACTIONS`, `getFactionInfo`, and `appendFactionLore` out of `scripts/game.js` into a focused static configuration module.

## Scope

- Create `scripts/systems/faction-config.js`.
- Expose a `FactionConfig` interface with frozen faction data and helper functions.
- Keep `game.js` constants/functions as aliases for existing call sites.
- Load faction config before `scripts/game.js`.
- Update smoke script-order checks.
- Add a focused Node test for faction roster, fallback behavior, lore composition, and read-only data.

## Result

- Added `scripts/systems/faction-config.js`.
- Added `tests/faction-config.test.js`.
- Updated `index.html` script order.
- Updated `tests/smoke.js` runtime loading and script-order checks.
- Verified focused and smoke tests.

## Test Commands

```powershell
node tests/faction-config.test.js
node tests/difficulty-config.test.js
node tests/boss-pacing.test.js
node --check scripts/systems/faction-config.js
node --check scripts/game.js
node tests/smoke.js
```

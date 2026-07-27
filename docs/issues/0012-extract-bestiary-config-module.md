# 0012 Extract Bestiary Config Module

Status: done
Labels: architecture, test, P1

## Background

Bestiary tab order, section metadata, and the discovery storage key are static UI/archive configuration. The discovery and rendering behavior still belongs in `game.js`, but the static table is a safe seam.

## Goal

Move `BESTIARY_DISCOVERY_KEY`, `BESTIARY_TAB_IDS`, `BESTIARY_SECTIONS`, `BESTIARY_TAB_META`, and small normalization helpers out of `scripts/game.js` into a focused static configuration module.

## Scope

- Create `scripts/systems/bestiary-config.js`.
- Expose a `BestiaryConfig` interface with frozen tab/section data and fallback helpers.
- Keep `game.js` constants as aliases for existing call sites.
- Replace inline tab/section fallback checks with `BestiaryConfig` helpers.
- Load bestiary config before `scripts/game.js`.
- Update smoke script-order checks.
- Add a focused Node test for tab order, section metadata, fallback behavior, and read-only data.

## Result

- Added `scripts/systems/bestiary-config.js`.
- Added `tests/bestiary-config.test.js`.
- Updated `index.html` script order.
- Updated `tests/smoke.js` runtime loading and script-order checks.
- Verified focused and smoke tests.

## Test Commands

```powershell
node tests/bestiary-config.test.js
node --check scripts/systems/bestiary-config.js
node --check scripts/game.js
node tests/smoke.js
```

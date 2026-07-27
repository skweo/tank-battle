# 0009 Extract Item Config Module

Status: done
Labels: architecture, test, P1

## Background

Item tier tuning is static loot data used by item pickup selection, rendering, archive rows, and legacy tier normalization. It is a low-risk static seam because callers only read the data or ask for a tier fallback.

## Goal

Move `ITEM_TIER_CONFIG`, `RARITY_CONFIG`, and `normalizeItemTier` out of `scripts/game.js` into a focused static configuration module.

## Scope

- Create `scripts/systems/item-config.js`.
- Expose an `ItemConfig` interface with frozen item tier data and the tier normalization helper.
- Keep `game.js` constants/functions as aliases for existing call sites.
- Load item config before `scripts/game.js`.
- Update smoke script-order checks.
- Add a focused Node test for tier tuning, legacy tier names, fallback behavior, and read-only data.

## Result

- Added `scripts/systems/item-config.js`.
- Added `tests/item-config.test.js`.
- Updated `index.html` script order.
- Updated `tests/smoke.js` runtime loading and script-order checks.
- Verified focused and smoke tests.

## Test Commands

```powershell
node tests/item-config.test.js
node --check scripts/systems/item-config.js
node --check scripts/game.js
node tests/smoke.js
```

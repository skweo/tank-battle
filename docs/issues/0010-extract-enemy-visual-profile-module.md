# 0010 Extract Enemy Visual Profile Module

Status: done
Labels: architecture, test, P1

## Background

Enemy visual profiles are static archive and marker metadata. They are a good extraction target because gameplay logic only needs a read-only lookup by type.

## Goal

Move `ENEMY_VISUAL_PROFILE` and `getEnemyVisualProfile` out of `scripts/game.js` into a focused static configuration module.

## Scope

- Create `scripts/systems/enemy-visual-profile.js`.
- Expose an `EnemyVisualProfile` interface with frozen profile data and a fallback lookup helper.
- Keep `game.js` constants/functions as aliases for existing call sites.
- Load enemy visual profiles before `scripts/game.js`.
- Update smoke script-order checks.
- Add a focused Node test for important labels/icons, fallback behavior, and read-only data.

## Result

- Added `scripts/systems/enemy-visual-profile.js`.
- Added `tests/enemy-visual-profile.test.js`.
- Updated `index.html` script order.
- Updated `tests/smoke.js` runtime loading and script-order checks.
- Verified focused and smoke tests.

## Test Commands

```powershell
node tests/enemy-visual-profile.test.js
node --check scripts/systems/enemy-visual-profile.js
node --check scripts/game.js
node tests/smoke.js
```

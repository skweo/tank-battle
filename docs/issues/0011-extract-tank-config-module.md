# 0011 Extract Tank Config Module

Status: done
Labels: architecture, test, P1

## Background

Tank turret speed and form factor tuning are static balance data used by player aiming, enemy aiming, Boss support aiming, and tank evolution visuals/hitboxes. Keeping the data in `game.js` makes later tank balance work harder to review.

## Goal

Move turret speed maps, `TANK_FORM_FACTORS`, and `getTankFormFactor` out of `scripts/game.js` into a focused static configuration module.

## Scope

- Create `scripts/systems/tank-config.js`.
- Expose a `TankConfig` interface with frozen turret speed maps, frozen tank form factors, and the form-factor lookup helper.
- Keep `game.js` constants/functions as aliases for existing call sites.
- Load tank config before `scripts/game.js`.
- Update smoke script-order checks.
- Add a focused Node test for speed tuning, evolution factor lookup, fallback behavior, clamping, and read-only data.

## Result

- Added `scripts/systems/tank-config.js`.
- Added `tests/tank-config.test.js`.
- Updated `index.html` script order.
- Updated `tests/smoke.js` runtime loading and script-order checks.
- Verified focused and smoke tests.

## Test Commands

```powershell
node tests/tank-config.test.js
node --check scripts/systems/tank-config.js
node --check scripts/game.js
node tests/smoke.js
```

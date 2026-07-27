# 0017 Boss AI balance and logic fixes

## Goal

Improve enemy and Boss AI pressure while preserving fair counterplay.

## Findings

- Some enemy/Boss bullets were incorrectly marked as player bullets.
- Gravity Anchor homing projectiles had `homingStrength` but did not enable homing.
- Normal enemies recalculated random preferred range every frame, causing noisy movement decisions.
- `圣龛守卫` phase 2 lacked a clear shield-counter identity.
- `陷阱师` placed too many random mines around itself, which was noisy but not strategically threatening.
- Some long-range/support Bosses were too easy to pin down at close range.

## Fixes

- Orbital Cannon rail shot is now an enemy projectile.
- Gravity Anchor anchor shots are enemy homing projectiles.
- Elite laser shots are enemy projectiles.
- Normal enemy range jitter is refreshed on AI retarget ticks, not every frame.
- Sanctum Guard gains visible bounded shield charges during shield counter.
- Trapper can place bounded mines near the player's route.
- Orbital Cannon and Sanctum Weaver keep distance more deliberately.

## Balance Rules

- No hidden hitboxes.
- New defensive mechanics must be visible and charge-limited.
- Mine placement should pressure routes, not cover the entire map.
- Projectile ownership must match collision intent.
- AI improvements should improve positioning and readability before raw damage.

## Acceptance

- Smoke tests cover projectile ownership, homing anchors, stable enemy range decisions, Sanctum Guard shield charges, and bounded Trapper lane mines.
- Existing Boss roster and phase names remain intact.
- Existing smoke and config tests pass.

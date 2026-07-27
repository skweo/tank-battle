# 0015 Behemoth breach opening slice

## Goal

Make `巨兽坦克` read more clearly as a heavy siege Boss without changing its original two-phase structure.

## Design

`巨兽坦克` gains a data-driven `entryAttack`:

- Type: `breach_shockwave`
- Windup: short opening charge after the existing Boss warning
- Output: slow heavy radial shockwave with side safety gaps plus forward breaker shells
- Recovery: returns to the existing Boss attack cycle after the opening impact

## Balance Rules

- No instant damage during windup.
- The shockwave has readable side gaps.
- Close players are pushed outward, not directly killed by a hidden hit.
- Existing `spiral` and `enrage` phases remain intact.

## Acceptance

- Only Bosses with `entryAttack` opt into the opening attack.
- `巨兽坦克` shows a visible breach telegraph before firing.
- The attack produces red siege bullets and at least one heavier center shell.
- Smoke tests cover the entry attack and still pass.

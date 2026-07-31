# 0022 Orbital Cannon phase-one laser

Status: done

Labels: boss, gameplay, bug, P1

## Background

`轨道炮台` advertises a phase-one laser lock, but `laser_snipe` currently creates one fast orange `Bullet`. The warning reads as a laser while the fired attack looks and behaves like an ordinary projectile, leaving the opening phase weak and misleading.

## Goal

Make phase one complete its long targeting lock with a brief, arena-spanning laser beam that matches the Boss identity and rewards leaving the warned lane.

## CCGS Perspective

- `ai-programmer`: preserve the locked firing angle and give the beam explicit line-hit behavior.
- `game-designer`: turn the 90-frame warning into meaningful lane denial without adding unavoidable tracking.
- `qa-lead`: verify the emitted entity, hit geometry, lifetime, and phase-two regression boundary.

## Scope

- Replace the phase-one `laser_snipe` projectile with a dedicated enemy laser-beam entity.
- Keep the angle fixed to the completed telegraph.
- Render a bright beam for a short firing window instead of a moving bullet.
- Damage an aligned player at most once per beam and miss players outside the warned lane.
- Preserve the current orange rail-weapon palette and obstacle-piercing identity.

## Out Of Scope

- Do not rebalance phase two or change its three-lane sweep.
- Do not change other Bosses, player weapons, normal enemies, obstacles, or progression.
- Do not add new audio assets.

## Files

- `scripts/game.js`
- `tests/smoke.js`

## Implementation Steps

1. Add a fixed-duration enemy beam entity with line-hit geometry.
2. Replace the phase-one projectile in `laser_snipe` while preserving the locked angle.
3. Integrate beam collision, obstacle piercing, rendering, and projectile-clash behavior.
4. Run automated and browser acceptance checks.

## Acceptance Criteria

- Phase one emits one `laser_beam` entity and no ordinary moving projectile.
- The beam remains visible for at least 12 frames and stays on its telegraphed angle.
- The beam spans the arena, has explicit width, and can hit a tank intersecting its ray.
- A tank outside the beam lane is not hit.
- A single beam cannot repeatedly damage the same tank.
- Phase two continues to emit three readable orange rail lanes plus its gate chips.

## Manual Play Acceptance

- The phase-one warning line clearly predicts the final beam lane.
- On firing, the laser reads as a large, brief energy beam rather than a glowing bullet.
- Leaving the warning lane before firing avoids damage; staying in it is visibly dangerous.
- The Boss still exposes a punish window after firing.

## Test Commands

```powershell
node --check scripts/game.js
node tests/smoke.js
npm.cmd run test:all
```

## Verification

- `node --check scripts/game.js`: passed.
- `node tests/smoke.js`: 38/38 passed.
- `npm.cmd run test:all`: 13/13 test files passed.
- Browser check: the warning and fired beam share the locked angle; the beam spans the arena, hits its lane, misses outside it, and produces no console errors.

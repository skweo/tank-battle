# 0023 Ricochet-chain build loop

Status: done

Labels: roguelike, build, gameplay, P0

## Background

The run upgrade pool has many numerical bonuses but too few components that establish, amplify, sustain, and transform a coherent build. The accepted first archetype is a ricochet chain with meaningful tradeoffs.

## Goal

Create one complete ricochet build loop whose later choices change targeting, resource flow, survival, and firing rhythm instead of only increasing damage.

## CCGS Perspective

- `game-designer`: make every component change decisions, positioning, or firing rhythm instead of only raising damage.
- `gameplay-programmer`: connect eligibility, ricochet hits, kills, resources, and drawbacks through testable state transitions.
- `qa-lead`: verify the full dependency chain, incomplete builds, and non-ricochet alternatives.

## Scope

- Starter: one bounce with reduced direct-hit damage.
- Amplifier: improve bounce range or attach a status effect.
- Loop: bounce kills refund cooldown, energy, or ammunition.
- Survival: repeated bounces create a short shield or slowing zone.
- Capstone: a third bounce splits, with reduced fire rate.
- Boss relic: replace a ricochet rule instead of granting a flat damage multiplier.
- Add at least one core modification that grants power with a visible drawback.

## Out Of Scope

- Do not build the pierce, heat, or summon archetypes in the same slice.
- Do not redesign every existing upgrade or the protocol tree.
- Do not combine this work with Boss AI or obstacle generation changes.

## Likely Files

- `scripts/game.js`
- `tests/smoke.js`
- A focused pure module under `scripts/systems/` if build-state rules can be isolated cleanly.

## Implementation Steps

1. Map current upgrade eligibility, projectile hit, kill, resource, and shield hooks.
2. Define the starter-to-capstone dependency chain and one benefit/drawback core modification.
3. Implement each component as a separate testable gameplay effect.
4. Add upgrade-card feedback for prerequisites, benefits, and drawbacks.
5. Verify the complete chain and non-ricochet fallback builds in tests and manual play.

## Acceptance Criteria

- A run can obtain starter, amplifier, loop, survival, and capstone components in a valid order.
- Each component has a gameplay effect observable without reading raw stat values.
- At least one core modification presents both a benefit and a drawback in UI and runtime behavior.
- The complete chain remains optional and does not invalidate non-ricochet upgrades.
- Automated tests cover eligibility, effects, and drawback enforcement.

## Manual Play Acceptance

- After the starter appears, subsequent choices provide a clear ricochet direction.
- The completed build plays differently from wave 1 and requires different positioning.
- The capstone is powerful but its lower fire rate remains noticeable.

## Test Commands

```powershell
node tests/smoke.js
npm.cmd run test:all
```

## Verification

- `node --check scripts/game.js`: passed.
- `node --test tests/ricochet-build.test.js`: 7/7 passed.
- `node tests/smoke.js`: 43/43 passed.
- `npm.cmd run test:all`: 20/20 test files passed.
- Browser play check: the directed draft, complete build, and one-time Boss relic reward all rendered without console errors.
- Browser runtime check: the complete build changed the base firing interval from 28 to 36 frames, split the third bounce into two targets, granted a 150-frame shield, and applied a 90-frame slow.

# 0024 Obstacle archetypes and large barriers

Status: todo

Labels: battlefield, obstacles, gameplay, P1

## Background

The battlefield has many obstacle skins, but most generated shapes occupy similar small rectangular footprints. This limits route planning and makes maps feel spatially uniform.

## Goal

Add obstacle archetypes with distinct spatial roles, including occasional long barriers that reshape routes without blocking spawns or trapping the player.

## CCGS Perspective

- `game-designer`: use obstacle scale to create flanking and line-of-sight decisions while preserving readable routes.
- `gameplay-programmer`: enforce placement budgets, keep-out zones, collision bounds, and route gaps deterministically.
- `qa-lead`: validate generated layouts across seeds and check movement, projectile, and spawn safety regressions.

## Scope

- Define small cover, field/slow zone, destructible cover, and long-barrier archetypes.
- Generate horizontal and vertical long barriers with stable size constraints.
- Validate player spawn zones, Boss spawn zones, navigation gaps, overlap, and projectile collision.
- Give large barriers a readable visual treatment matching their footprint.
- Keep obstacle counts and total blocked area within explicit budgets.

## Out Of Scope

- Do not add pathfinding or destructible terrain simulation in this slice.
- Do not redesign Boss attacks, run upgrades, weather, or biome progression.
- Do not allow a barrier to span the complete arena width or height.

## Likely Files

- `scripts/game.js`
- `tests/smoke.js`
- A focused obstacle-generation module if placement rules can be extracted as pure logic.

## Implementation Steps

1. Map current obstacle generation, drawing, movement collision, and projectile collision rules.
2. Define archetype dimensions, blocked-area budgets, and spawn keep-out zones.
3. Add bounded horizontal and vertical long-barrier placement with route-gap validation.
4. Give each archetype a footprint-matched visual treatment.
5. Run deterministic layout tests and browser play checks across several generated maps.

## Acceptance Criteria

- Generated maps can contain clearly long horizontal or vertical barriers.
- Every map preserves spawn keep-out zones and at least two viable routes around large barriers.
- Large barriers do not overlap tanks at spawn or extend outside arena bounds.
- Blocked-area and large-barrier count caps prevent maze saturation.
- Existing bullets, ricochets, movement collision, and refresh behavior remain valid.

## Manual Play Acceptance

- Long barriers produce meaningful flanking and line-of-sight decisions.
- A player can identify barrier scale and passability immediately.
- No generated layout leaves the player boxed in or the Boss unreachable.

## Test Commands

```powershell
node tests/smoke.js
npm.cmd run test:all
```

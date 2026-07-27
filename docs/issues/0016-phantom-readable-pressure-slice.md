# 0016 Phantom readable pressure slice

## Goal

Make `幻影坦克` feel more like a phase hunter while keeping its pressure readable and fair.

## Design

Changes:

- Teleport points keep a minimum readable distance from the player.
- Teleport leaves short-lived origin and arrival echoes.
- Phase-2 mirror barrage can use recent echoes as sources.
- Telegraph rendering shows recent echo sources before mirror pressure resolves.

## Balance Rules

- No direct point-blank teleport burst.
- Echo count is capped at four.
- Mirror barrage uses small clusters and restrained bullet speed.
- New visuals are informational only; they do not add hidden hitboxes.

## Acceptance

- `幻影坦克` keeps its original `teleport` and `clone_barrage` phases.
- Teleport creates readable echoes and preserves player reaction distance.
- Mirror barrage remains within a small bullet budget.
- Smoke tests cover teleport distance, echo creation, and mirror pressure.

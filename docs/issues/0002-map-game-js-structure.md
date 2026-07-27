# 0002 Map Game.js Structure

Status: done

Labels: architecture, docs, P1, ready-for-agent

## Background

`scripts/game.js` contains most game logic in a large single file. Before splitting or adding large features, Codex needs a structure map.

## Goal

Create a readable map of the major regions, classes, data tables, rendering functions, update loops, UI functions, persistence functions, and candidate seams in `scripts/game.js`.

## Scope

- Identify top-level constants and data tables.
- Identify core classes and their responsibilities.
- Identify functions related to game loop, UI, Boss, enemies, player, bullets, items, weather, storage, and rendering.
- Write the map to `docs/architecture/game-js-structure-map.md`.

## Out Of Scope

- Do not move code.
- Do not rename functions.
- Do not change runtime behavior.

## Files

- `scripts/game.js`
- `docs/architecture/game-js-structure-map.md`

## Acceptance Criteria

- The map is useful enough to locate where to implement Boss, enemy AI, UI, audio, and test changes.
- The map identifies candidate seams for later extraction.

## Result

- Created `docs/architecture/game-js-structure-map.md`.
- Identified major regions, current useful interfaces, candidate seams, and risks.
- Recommended next issue: `0003 Create Game.js Decomposition ADR`.

## Test Command

```powershell
node tests/smoke.js
```

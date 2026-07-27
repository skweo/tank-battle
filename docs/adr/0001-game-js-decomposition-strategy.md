# ADR 0001: `game.js` Decomposition Strategy

Date: 2026-06-20

## Status

Accepted

## Context

`scripts/game.js` is a 13,808-line classic browser script containing weather, audio, UI screens, progression, combat entities, Boss behavior, collision, and the main loop. The game is runnable and the current smoke baseline is 16/16 passing, so the main risk is not missing functionality. The risk is making future changes harder because unrelated systems share one file and many globals.

The project does not currently use a bundler or ES modules. `index.html` loads classic scripts directly, and `tests/smoke.js` evaluates those scripts in a VM-backed fake browser.

## Decision

Decompose `game.js` incrementally by extracting deep modules behind small interfaces. Start with pure calculation seams, then static data, then UI screens, and leave combat classes and the main loop until later.

The first extraction is Boss clear-mode pacing:

- New file: `scripts/systems/boss-pacing.js`
- Interface: `BossPacing`
- Responsibilities: Boss wave interval, archive wave detection, required Boss defeats, clear-wave target, support count, and clear eligibility calculation.
- `game.js` keeps thin adapter functions where game-global state is needed.

## Extraction Order

1. Pure calculation modules:
   Boss pacing, difficulty target calculations, deterministic wave budget helpers.
2. Static data tables:
   Difficulty settings, faction metadata, item tier config, visual profiles, Boss roster data.
3. Screen renderers:
   Achievements, bestiary, lab/protocol, leaderboard, tank select.
4. Persistence adapters:
   Progression, achievements, bestiary discovery, leaderboard, save diagnostics.
5. Combat entities:
   `Bullet`, `Tank`, `PlayerTank`, `EnemyTank`, `EliteEnemy`, `BossEnemy`.
6. Main loop and lifecycle:
   `update`, `draw`, `startGame`, `resetRunState`, `gameLoop`.

## Temporary Rules

- Classic scripts are acceptable until a bundler or ES module migration is explicitly chosen.
- Newly extracted files may attach one namespaced object to `globalThis`.
- `game.js` may keep thin adapters that pass global state into pure modules.
- Do not move a behavior cluster unless there is a fast test or smoke coverage for the path.
- Do not introduce a framework or build tool as part of these extractions.

## Testing Strategy

- Every extraction must pass `node tests/smoke.js`.
- Pure modules should get focused Node tests under `tests/`.
- Browser-loaded script order must be mirrored in smoke tests.
- If a test seam is missing, add the smallest seam that verifies user-visible behavior or stable domain behavior.

## Rollback Strategy

Each extraction should be revertible by restoring the old functions in `game.js`, removing the new script tag, and removing the focused test. Avoid combining unrelated gameplay changes with file movement.

## Consequences

This approach will not immediately shrink `game.js` dramatically. It prioritizes correctness and momentum: each extraction creates a reliable module seam without forcing the whole game into a new architecture at once.

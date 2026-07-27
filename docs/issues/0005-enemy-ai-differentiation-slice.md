# 0005 Enemy AI Differentiation Slice

Status: todo

Labels: enemy-ai, gameplay, P2, ready-for-human

## Background

The roadmap says enemy behavior is still too similar, especially newer enemies such as sniper, sapper, buffer, and fissure.

## Goal

Implement one enemy behavior difference as a small vertical slice.

## Scope

- Pick one enemy type.
- Define its intended behavior in one paragraph.
- Implement the behavior.
- Add a lightweight validation check if feasible.

## Out Of Scope

- Do not implement all enemy behaviors at once.
- Do not rebalance the whole enemy roster.
- Do not rewrite pathfinding.

## Files

- `scripts/game.js`
- `docs/OPTIMIZATION_ROADMAP.md`
- `memory/faction-color-guide.md`

## Acceptance Criteria

- The chosen enemy behaves differently enough for a player to notice.
- Behavior does not create unavoidable damage.
- Smoke test still reaches the previous baseline.

## Test Command

```powershell
node tests/smoke.js
```

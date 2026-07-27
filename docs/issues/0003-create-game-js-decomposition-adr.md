# 0003 Create Game.js Decomposition ADR

Status: done

Labels: architecture, P1, ready-for-agent

## Background

The biggest engineering risk is `scripts/game.js` becoming harder to maintain. A decomposition strategy should be recorded before code movement begins.

## Goal

Create an ADR that defines how `scripts/game.js` should eventually be split.

## Scope

- Define extraction order.
- Define what should remain global temporarily.
- Define test requirements for each extraction.
- Define forbidden refactors.
- Write to `docs/adr/0001-game-js-decomposition-strategy.md`.

## Out Of Scope

- Do not split files yet.
- Do not introduce a build tool yet.
- Do not convert to a framework.

## Files

- `docs/adr/0001-game-js-decomposition-strategy.md`
- `docs/architecture/game-js-structure-map.md`

## Acceptance Criteria

- ADR explains why extraction should be incremental.
- ADR includes a concrete extraction order.
- ADR includes rollback and testing strategy.

## Result

- Created `docs/adr/0001-game-js-decomposition-strategy.md`.
- Defined extraction order, temporary globals policy, test requirements, rollback strategy, and forbidden refactors.
- Next issue: `0006 Extract Boss Pacing Module`.

## Test Command

```powershell
node tests/smoke.js
```

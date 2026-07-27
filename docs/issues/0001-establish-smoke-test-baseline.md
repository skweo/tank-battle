# 0001 Establish Smoke Test Baseline

Status: done

Labels: test, P1, ready-for-agent

## Background

The project already has `tests/smoke.js`, but the old context says one smoke check may fail because the expected Boss archive pacing is outdated.

## Goal

Run the current smoke test, record which checks pass/fail, and decide whether the failure represents a real bug or stale test expectation.

## Scope

- Run `node tests/smoke.js`.
- Inspect the failing assertion if any.
- Compare the assertion with current game design docs.
- Update `docs/restart/CODEX_RESTART_PLAN.md` with the baseline result.

## Out Of Scope

- Do not change gameplay.
- Do not refactor `scripts/game.js`.
- Do not rewrite the smoke harness unless the baseline proves the expectation is stale.

## Files

- `tests/smoke.js`
- `docs/PROJECT_CONTEXT.md`
- `docs/OPTIMIZATION_ROADMAP.md`
- `docs/restart/CODEX_RESTART_PLAN.md`

## Acceptance Criteria

- Current pass/fail count is recorded.
- Any failure is classified as `real bug`, `stale expectation`, or `unknown`.
- Next issue is recommended.

## Result

- Initial baseline: `node tests/smoke.js` => 14/16 passing.
- `achievements screen renders rows`: real test harness gap. The fake DOM lacked `document.head`, while `renderAchievements()` injects a style element into `document.head`.
- `clear-mode boss archive pacing is compact`: real gameplay/config drift, not only a stale expectation. `getBossArchiveFinalWave()` used total `BOSS_TYPES.length`, while clear mode is configured through per-difficulty `bossRequired`.
- Current baseline: `node tests/smoke.js` => 16/16 passing.
- Next issue: `0002 Map Game.js Structure`.

## Test Command

```powershell
node tests/smoke.js
```

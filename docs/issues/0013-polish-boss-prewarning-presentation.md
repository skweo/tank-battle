# 0013 Polish Boss Prewarning Presentation

Status: done
Labels: boss, gameplay, polish, test, P1

## Background

Boss waves already had a short warning delay through `bossWarningTimer`, `bossWarningDef`, and `bossWarningSpawn`. The old presentation communicated "WARNING" and the Boss name, but did not clearly show the Boss identity, faction, stage of the countdown, support status, or where the Boss would appear.

## CCGS Perspective

- Game design: preserve the existing Boss pacing while extending the deployment delay to 3 seconds so the threat reads as a real encounter entrance.
- UX: do not rely on color alone; show text labels, countdown state, deployment progress, and a drop-zone marker.
- Polish: improve tension with cinematic black bars, hazard bands, a large entrance title, countdown number, scan lines, spawn marker, Boss identity panel, and staged screen shake without adding strong flashing.
- QA: cover the full `startNextWave -> warning -> countdown -> Boss spawn` path in smoke.

## Goal

Optimize the existing Boss prewarning instead of creating a second warning system.

## Scope

- Keep Boss wave selection, support count, and Boss spawning rules unchanged.
- Add a presentation helper for Boss name, icon, tier, faction, first-phase cue, hint, support status, spawn position, and countdown stage.
- Replace the old warning overlay with a layered Boss warning panel and drop-zone marker.
- Clear warning state in `resetRunState`.
- Extend smoke coverage for the Boss warning lifecycle.

## Result

- Added `BOSS_WARNING_DURATION`, staged warning metadata, presentation helpers, and `drawBossWarningOverlay`.
- Strengthened the warning from a HUD-style panel into a full-screen entrance event with black bars, hazard stripes, large `首领降临` text, countdown, and impact-zone column.
- Boss wave notification now says `BOSS SIGNAL` and includes the Boss faction.
- Warning overlay now shows Boss identity, faction, support status, first phase cue/hint, deployment progress, ETA, and spawn marker.
- `resetRunState` clears `bossWarningTimer`, `bossWarningDef`, and `bossWarningSpawn`.
- `tests/smoke.js` now includes `boss wave uses warning presentation before spawn`.

## Test Commands

```powershell
node --check scripts/game.js
node --check tests/smoke.js
node tests/boss-pacing.test.js
node tests/smoke.js
```

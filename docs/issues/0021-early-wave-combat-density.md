# 0021 Early-wave combat density

Status: done

Labels: enemy, gameplay, balance, P1

## Background

The opening waves contain too few enemies and replenish them too slowly. Easy mode can leave nearly eight seconds between targets, while waves 1-2 contain only two enemies on every difficulty.

## Goal

Make the opening immediately active without increasing enemy damage, durability, elite pressure, or player punishment.

## CCGS Perspective

- `game-designer`: increase low-threat combat density while preserving difficulty readability.
- `gameplay-programmer`: isolate wave pacing calculations behind a small testable interface.
- `qa-lead`: verify enemy budgets, opening bursts, spawn cadence, and browser integration.

## Scope

- Raise the minimum enemy budgets for waves 1-3 to 3, 4, and 5.
- Keep later regular waves from dropping below five enemies after the opening chapter.
- Start regular waves with two enemies instead of one.
- Shorten replenishment intervals across all difficulties while keeping easy the slowest.
- Preserve the existing difficulty multipliers, concurrent caps, and late-wave minimum interval.
- Keep elite-roll count and opening concurrency on the previous wave curve so the added density comes from normal enemies.

## Out Of Scope

- Do not change enemy HP, damage, movement speed, bullet speed, AI, or elite chance.
- Do not change Boss waves, Boss support counts, or Boss pacing.
- Do not change player tanks, modifiers, items, UI, or audio.

## Files

- `scripts/systems/wave-pacing.js`
- `scripts/systems/difficulty-config.js`
- `scripts/game.js`
- `index.html`
- `tests/wave-pacing.test.js`
- `tests/smoke.js`

## Acceptance Criteria

- Waves 1-3 contain at least 3, 4, and 5 enemies respectively on every difficulty.
- Wave 5 and later regular waves never regress below five enemies.
- Every regular wave opens with two enemies when budget and concurrent cap allow it.
- Added density does not create extra elite-roll opportunities or simultaneous opening elite rolls.
- At wave 1 and level 1, easy replenishes in about five seconds and harder modes are progressively faster.
- Boss wave behavior and all existing automated tests remain unchanged.

## Manual Play Acceptance

- Easy wave 1 begins with two simultaneous low-threat targets and does not contain a long empty wait.
- Waves 2-3 feel progressively busier without a sudden elite or damage spike.
- Wave 5 does not feel emptier than wave 3 after the first Boss.
- Easy remains visibly more forgiving than normal through slower enemies, bullets, and replenishment.

## Test Commands

```powershell
node tests/wave-pacing.test.js
node --check scripts/systems/wave-pacing.js
node --check scripts/game.js
node tests/smoke.js
npm.cmd run test:all
```

## Verification

- `node tests/wave-pacing.test.js`: 8/8 passing.
- `node --check scripts/systems/wave-pacing.js`: passing.
- `node --check scripts/game.js`: passing.
- `node tests/smoke.js`: 37/37 passing.
- `npm.cmd run test:all`: 13/13 test files passing.
- Headless Chromium: easy wave 1 opened with 2 active enemies, held 1 queued enemy before the 295-frame threshold, then replenished to 3 with no console errors.
- Post-review regression coverage keeps Boss-wave replenishment on the original per-difficulty cadence and checks opening budgets across all five difficulties.
- Elite-roll regression coverage preserves the previous total roll budget and opening concurrency while allowing extra normal enemies.

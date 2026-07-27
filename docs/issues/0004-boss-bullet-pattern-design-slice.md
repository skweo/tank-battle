# 0004 Boss Bullet Pattern Design Slice

Status: todo

Labels: boss, gameplay, P1, ready-for-human

## Background

The roadmap says Boss bullet patterns need more variety. Some Bosses already have strong identity, while others remain too simple.

## Goal

Choose one Boss and implement one distinctive bullet pattern as a small vertical slice.

## Scope

- Pick one Boss from the weaker set: Behemoth, Fortress, Void, Observer, Scrap Colossus.
- Write a short design note before implementation.
- Implement one pattern.
- Add or update a lightweight validation check if feasible.

## Out Of Scope

- Do not redesign all Bosses at once.
- Do not rebalance every difficulty.
- Do not rewrite the Boss class.

## Files

- `docs/BOSS_DESIGN.md`
- `memory/boss-redesign-specs.md`
- `scripts/game.js`
- `tests/smoke.js`

## Acceptance Criteria

- The chosen Boss has one clearly recognizable new attack pattern.
- The pattern matches its visual identity and faction.
- Smoke test still reaches the previous baseline.
- User can playtest the pattern.

## Test Command

```powershell
node tests/smoke.js
```

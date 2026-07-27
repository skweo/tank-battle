# 0014 Boss combat identity and balance slice

## Goal

Preserve the existing Boss roster, factions, lore, and phase names while improving combat identity in small testable slices.

## Current Boss Matrix

| Boss | Faction | Tier | Combat identity |
| --- | --- | --- | --- |
| 巨兽坦克 | moon_arsenal | 1 | Heavy siege pressure, armor windows, breach volleys |
| 幻影坦克 | void_cult | 1 | Teleport hunter, mirror-zone pressure |
| 要塞坦克 | ash_church | 2 | Stationary fortress, cannon wall, mine control |
| 虚空坦克 | void_cult | 2 | Gravity pull, black-hole center burst |
| 风暴坦克 | storm_cloister | 2 | Lightning lanes, storm strike zones |
| 观星者坦克 | observatory | 2 | Scan lock, orbital geometry strikes |
| 废铁巨像 | graveyard | 1 | Slow scrap advance, irregular debris |
| 雷霆执政官 | storm_cloister | 3 | Fast lightning judgment, storm domain |
| 轨道炮台 | moon_arsenal | 1 | Long-range rail lock, beam sweep |
| 圣龛守卫 | ash_church | 1 | Holy barrage, shield counter and sustain |
| 星象仪 | observatory | 1 | Rotating geometry rings, constellation patterns |
| 缝合巨兽 | graveyard | 3 | Patchwork debris, corpse devour, shockwave burst |
| 双子坦克 | void_cult | 1 | Paired crossfire, survivor rage |
| 迅影 | storm_cloister | 3 | Fast assassin, shuriken and teleport flurry |
| 圣龛织者 | ash_church | 3 | Summoner boss, escort pressure |
| 灰域剑圣 | moon_arsenal | 3 | Melee chase, blade sweep, dash windows |
| 陷阱师 | graveyard | 2 | Minefield control, movement denial |
| 镜像体 | void_cult | 2 | Player-pattern copy and enhancement |
| 沙暴 | graveyard | 2 | Weather pressure, sand veil and worm bursts |
| 重力锚 | moon_arsenal | 3 | Heavy pull, anchor judgment |
| 多头蛇 | void_cult | 2 | Multi-head spread, regeneration pressure |

## First Slice

Target: `缝合巨兽` phase 2, `devour_burst`.

Problem found: the phase-2 branch was using Gemini-style void crossfire, so the boss lost its graveyard/patchwork identity.

Changes:

- Add one-time wreck absorption with capped healing.
- Replace the copied Gemini crossfire with a radial scrap shockwave that keeps intentional gaps.
- Add forward fast shards so the boss still pressures the player after the shockwave.
- Push close players away from the core instead of using unavoidable instant damage.
- Extend telegraph rendering for `devour_burst`.
- Remove duplicated `gemini_rage` and duplicated `emitPhaseBurst` branches.

## Acceptance

- Existing Boss roster remains intact.
- `缝合巨兽` phase 2 looks and plays like a corpse-devouring graveyard boss.
- The attack has a visible telegraph before damage pressure.
- The pattern has avoidance gaps and a recovery window.
- Smoke tests cover the behavior and continue to pass.

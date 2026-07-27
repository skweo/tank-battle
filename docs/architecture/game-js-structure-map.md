# `scripts/game.js` Structure Map

Snapshot: `scripts/game.js` has 13,949 lines after the first seven extractions and the stronger Boss prewarning polish slice. `scripts/systems/` contains pure Boss pacing plus frozen static config for difficulty, factions, item tiers, enemy visual profiles, tank tuning, and bestiary tabs/sections. The smoke baseline is `node tests/smoke.js` => 18/18 passing.

## Major Regions

| Lines | Region | Responsibility |
|---:|---|---|
| 1-139 | Weather | Dynamic weather particles, weather overlays, biome-linked atmosphere. |
| 145-180 | Core run state | Global score/lives/wave/run-mode state and screen shake. |
| 181-878 | Audio | Web Audio initialization, SFX helpers, BGM switching, global UI click sounds. |
| 879-997 | Daily challenge | Seed selection, daily target state, daily completion persistence. |
| 998-1473 | Run modifiers | Modifier definitions, rarity scaling, draft/reroll UI, modifier application. |
| 1474-1509 | Config adapters, tanks | Seeded RNG, config aliases, tank type definitions. |
| 1510-2073 | Menu and tank select | Difficulty buttons, run mode switch, tank cards, dual-mode selection. |
| 2074-2876 | Achievements and run tracking | Achievement definitions, rewards, unlock persistence, run reports, boss balance history. |
| 2877-3130 | Wave and clear-mode adapters | Wave notifications, enemy budget, thin Boss pacing adapters, difficulty clearing. |
| 3131-3519 | Items and combat formulas | Power-ups, fusion, chests, effective player/enemy speed/fire formulas. |
| 3520-3756 | Achievements and bestiary UI | Achievement tabs, bestiary discovery, archive rendering. |
| 3757-3900 | Input and pause | Mouse/keyboard/gamepad state and pause/home transitions. |
| 3901-5045 | Visual helpers | Damage numbers, particles, tank/glyph/chest/enemy info drawing helpers. |
| 5046-6477 | Bullet, tank, normal enemy | `Bullet`, `Tank`, `PlayerTank`, `EnemyTank`. |
| 6478-7337 | Elite enemies | Elite enemy definitions and behavior. |
| 7338-9846 | Boss system | Boss warning presentation, `BOSS_TYPES`, bestiary lore, `BossEnemy` behavior and drawing. |
| 9684-11684 | Meta progression | Moonstone, tank unlocks/upgrades/evolution, protocol tree, lab, save diagnostics, leaderboard. |
| 11685-12611 | Runtime objects and collision | Active arrays, obstacles, spawning, collision, terrain drawing. |
| 12612-13696 | Main loop and lifecycle | Gamepad update, `update`, `draw`, end/restart/reset/init/start, performance overlay, `gameLoop`. |

## Current Useful Interfaces

- Smoke harness: `tests/smoke.js` loads `index.html`, system modules, and `scripts/game.js` into a fake browser context. It is the main fast regression loop.
- Difficulty config module: `DifficultyConfig` in `scripts/systems/difficulty-config.js`.
- Faction config module: `FactionConfig` in `scripts/systems/faction-config.js`.
- Item tier config module: `ItemConfig` in `scripts/systems/item-config.js`.
- Enemy visual profile module: `EnemyVisualProfile` in `scripts/systems/enemy-visual-profile.js`.
- Tank config module: `TankConfig` in `scripts/systems/tank-config.js`.
- Bestiary config module: `BestiaryConfig` in `scripts/systems/bestiary-config.js`.
- Clear-mode pacing module: `BossPacing` in `scripts/systems/boss-pacing.js`.
- Clear-mode pacing adapters: `BOSS_WAVE_INTERVAL`, `getRequiredBossDefeats`, `getBossArchiveFinalWave`, `getDifficultyClearWaveTarget`, `isBossArchiveWave`, `getBossSupportCount`, `shouldClearDifficulty`.
- UI entry points: `renderDifficultyButtons`, `showTankSelect`, `showAchievements`, `showBestiary`, `showLabScreen`, `showLeaderboard`, `showProtocolScreen`.
- Persistence entry points: `loadProgression`, `saveProgression`, `loadAchievements`, `saveAchievements`, `loadLeaderboard`, `saveLeaderboard`, `loadBestiaryDiscovery`, `saveBestiaryDiscovery`.
- Combat object entry points: `PlayerTank`, `EnemyTank`, `EliteEnemy`, `BossEnemy`, `Bullet`, `checkBulletTankCollisions`, `spawnEnemy`, `startNextWave`.
- Boss warning entry points: `getBossWarningPresentation`, `drawBossWarningOverlay`, `BOSS_WARNING_DURATION`.
- Rendering helpers: `drawArmorPanel`, `drawTechCore`, `drawTankTracks`, `drawWeaponBarrel`, `drawEnemyMarker`, `drawEnemyInfoPlate`, `renderCodeIcon`.

## Candidate Seams

1. Clear-mode pacing has been extracted.
   It now lives in `scripts/systems/boss-pacing.js`, with `game.js` keeping thin adapters for current run state.

2. Difficulty config has been extracted.
   `difficultySettings` and `DIFFICULTY_ORDER` are now aliases for `DifficultyConfig` data.

3. Faction config has been extracted.
   `FACTIONS`, `getFactionInfo`, and `appendFactionLore` are now aliases for `FactionConfig`.

4. Item tier config has been extracted.
   `ITEM_TIER_CONFIG`, `RARITY_CONFIG`, and `normalizeItemTier` are now aliases/adapters for `ItemConfig`.

5. Enemy visual profiles have been extracted.
   `ENEMY_VISUAL_PROFILE` and `getEnemyVisualProfile` are now aliases/adapters for `EnemyVisualProfile`.

6. Tank tuning config has been extracted.
   Turret rotation speed maps, `TANK_FORM_FACTORS`, and `getTankFormFactor` now live in `TankConfig`.

7. Bestiary config has been extracted.
   `BESTIARY_DISCOVERY_KEY`, `BESTIARY_TAB_IDS`, `BESTIARY_SECTIONS`, `BESTIARY_TAB_META`, and normalizers now live in `BestiaryConfig`.

8. Persistence should become adapters around `localStorage`.
   Do not rewrite save logic yet. First group each storage key with its load/save/normalize functions.

9. UI renderers can be split by screen.
   Candidate files later: achievements, bestiary, lab/protocol, leaderboard, tank select. Each screen already has `show/hide/render` entry points.

10. Combat entities should move after pure data and UI are stable.
   `PlayerTank`, `EnemyTank`, `EliteEnemy`, and `BossEnemy` are deep behavior clusters but depend heavily on globals. Moving them too early would create wide interfaces.

11. The main loop should move last.
   `update`, `draw`, `startGame`, `resetRunState`, and `gameLoop` coordinate nearly everything. They are orchestration code, not the first extraction target.

## Known Risks Found During Mapping

- Boss documentation is stale: docs still describe 8 Bosses, while current `BOSS_TYPES` contains 21 top-level Boss definitions.
- UI text can drift from gameplay rules if it reads raw config instead of computed target functions. Current difficulty clear wave display was corrected to call `getDifficultyClearWaveTarget`.
- Fake DOM tests need to track browser APIs used by UI renderers. `document.head` and `insertBefore` are now covered in `tests/smoke.js`.
- Many systems mutate shared globals. Extraction should prefer pure calculation seams first, not class movement.

## Recommended Next Issues

1. Update Boss docs to reflect 21 Boss definitions or split the docs into "core 8" and "expanded roster".
2. Pick the next visible gameplay slice: Boss bullet richness or enemy AI differentiation.
3. Only extract more static data if the next gameplay slice needs it; avoid moving `BOSS_TYPES` until Boss behavior tests are stronger.

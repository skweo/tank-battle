# Codex 重启计划

目标：在不依赖 Claude Code 的前提下，用 Codex + CCGS 方法论 + mattpocock skills 重启 `幻月战记` 开发。

## 原则

- 先理解旧项目，再继续加功能。
- 先建立文档和测试保护，再重构。
- 单次任务只做一个可验证切片。
- CCGS 提供游戏制作视角，mattpocock skills 提供工程执行流程。

## 第 0 阶段：建立 Codex 工作区

- [x] 新增 `AGENTS.md`
- [x] 新增 `CONTEXT.md`
- [x] 新增 `docs/agents/` 配置
- [x] 建立 `docs/issues/` 初始任务池
- [x] 跑一次 `node tests/smoke.js`，记录当前基线

## 第 1 阶段：反向文档化

- [x] 为 `scripts/game.js` 建结构地图
- [ ] 反向整理核心系统列表
- [ ] 反向整理 Boss 系统实现现状
- [ ] 反向整理敌人 AI 行为现状
- [ ] 反向整理 UI/HUD 与菜单流

## 第 2 阶段：测试基线

- [x] 判断当前 smoke test 失败是否是旧预期
- [x] 更新或拆分 smoke test，让失败能准确代表问题
- [x] 增加 Boss/敌人行为的轻量验证点

## 第 3 阶段：架构减压

- [x] 先写 `docs/adr/0001-game-js-decomposition-strategy.md`
- [x] 不直接大拆文件，先划分模块边界
- [x] 优先抽离纯数据和纯函数
- [x] 每次抽离后跑 smoke test

## 第 4 阶段：玩法推进

优先从 `docs/OPTIMIZATION_ROADMAP.md` 中选择：

1. Boss 弹幕丰富度
2. Boss 随机出场顺序
3. 敌人 AI 行为差异化
4. Boss 战前预警演出
5. 伤害数字与击中反馈优化

## 每个功能的固定流程

1. 用 CCGS 视角写玩法目标和验收标准。
2. 用 mattpocock 风格拆成单个 issue。
3. Codex 实现最小可玩切片。
4. 跑 `node tests/smoke.js`。
5. 做 review：规格是否满足、代码是否引入风险、是否需要试玩。

## 不做清单

- 不在没有测试基线时大拆 `game.js`。
- 不一次性重写 UI。
- 不把 CCGS 的 `.claude/` 复制进项目。
- 不为了流程而补全所有模板文档。
- 不把全部开发迁移到 GitHub Issues，先用本地 Markdown。

## 2026-06-20 Codex Baseline Update

- `node tests/smoke.js`: 16/16 passing.
- Fixed smoke fake DOM support for `document.head`.
- Fixed clear-mode Boss archive pacing to use per-difficulty `bossRequired` instead of total Boss roster size.
- Updated difficulty menu clear-wave display to use `getDifficultyClearWaveTarget`.
- Created `docs/architecture/game-js-structure-map.md`.
- Completed local issues `0001` and `0002`; next recommended issue is `0003`.

## 2026-06-20 First Extraction Update

- Created `docs/adr/0001-game-js-decomposition-strategy.md`.
- Extracted Boss pacing into `scripts/systems/boss-pacing.js`.
- Added focused test `tests/boss-pacing.test.js`.
- Updated `index.html` and `tests/smoke.js` to load scripts in the same order.
- `node tests/boss-pacing.test.js`: passing.
- `node tests/smoke.js`: 17/17 passing.

## 2026-06-20 Difficulty Config Extraction Update

- Extracted difficulty tuning into `scripts/systems/difficulty-config.js`.
- Added focused test `tests/difficulty-config.test.js`.
- Updated `index.html` and `tests/smoke.js` script order.
- `node tests/difficulty-config.test.js`: passing.
- `node tests/smoke.js`: 17/17 passing.

## 2026-06-20 Faction Config Extraction Update

- Extracted faction metadata into `scripts/systems/faction-config.js`.
- Added focused test `tests/faction-config.test.js`.
- Updated `index.html` and `tests/smoke.js` script order.
- `node tests/faction-config.test.js`: passing.
- `node tests/smoke.js`: 17/17 passing.

## 2026-06-20 Static Config Extraction Update

- Extracted item tier config into `scripts/systems/item-config.js`.
- Extracted enemy visual profiles into `scripts/systems/enemy-visual-profile.js`.
- Extracted tank tuning into `scripts/systems/tank-config.js`.
- Extracted bestiary tab/section config into `scripts/systems/bestiary-config.js`.
- Added focused tests for all four config modules.
- `scripts/game.js` is now 13,696 lines.
- `node tests/smoke.js`: 17/17 passing.

## 2026-06-20 Boss Prewarning Polish Update

- Used the CCGS combat/polish perspective to optimize the existing Boss prewarning instead of adding a second warning system.
- Added a 3-second full-screen Boss entrance event: cinematic black bars, hazard stripes, large `首领降临` text, countdown, impact-zone column, Boss identity panel, faction/support text, first phase cue/hint, deployment progress, ETA, and drop-zone marker.
- Kept Boss selection, pacing, support count, and spawn rules unchanged.
- Added smoke coverage for `startNextWave -> warning -> countdown -> Boss spawn`.
- `node tests/smoke.js`: 18/18 passing.

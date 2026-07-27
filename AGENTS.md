# Codex 项目指南：幻月战记

本项目现在以 Codex 为主要开发入口。CCGS 作为游戏开发方法论和模板库使用，mattpocock skills 作为工程拆解、实现、测试和审查流程使用。

## 启动时先读

每次开始较大任务前，先读这些文件：

- `CONTEXT.md`：项目领域上下文和当前风险
- `docs/restart/CODEX_RESTART_PLAN.md`：重启计划
- `docs/restart/CCGS_TO_CODEX_WORKFLOW.md`：CCGS 到 Codex 的工作流映射
- `docs/PROJECT_CONTEXT.md`：旧项目上下文
- `docs/OPTIMIZATION_ROADMAP.md`：当前优化路线

## 技术栈

- 原生 HTML/CSS/JavaScript
- Canvas 2D
- Web Audio API
- localStorage
- Node.js 冒烟测试

## 常用命令

```powershell
node tests/smoke.js
```

也可以直接浏览器打开 `index.html` 进行手动试玩。

## 开发原则

- `scripts/game.js` 是巨型单文件，改动前先定位函数和行为入口。
- 不要在同一次任务中同时大改视觉、数值、AI 和架构。
- 每次只做一个可验证的垂直切片。
- 改完必须跑 `node tests/smoke.js`，如果测试失败要说明是新失败还是已知失败。
- 视觉/玩法改动优先参考 `memory/faction-color-guide.md` 和 `docs/BOSS_DESIGN.md`。
- 新功能先写到本地 issue 或重启计划，再实现。

## CCGS 如何在 Codex 中使用

不要依赖 Claude slash command。把 CCGS 当成一套游戏制作角色和流程：

- `game-designer` 思维：玩法目标、玩家体验、数值边界
- `gameplay-programmer` 思维：实现路径、状态机、碰撞、技能逻辑
- `ai-programmer` 思维：敌人行为、Boss 行为、难度曲线
- `ui-programmer` / `ux-designer` 思维：HUD、菜单、反馈、可读性
- `audio-director` 思维：BGM 分层、音效反馈
- `qa-lead` 思维：验收标准、冒烟测试、试玩报告

Codex 需要在一次任务中明确当前采用哪个视角。

## mattpocock skills 如何在本项目中使用

- `domain-modeling`：整理游戏概念、实体、状态和规则语言。
- `grilling`：在做大功能前追问需求和边界。
- `to-prd`：把设计讨论变成可执行规格。
- `to-issues`：拆成本地 Markdown issue。
- `tdd`：对可测试逻辑先建立验证点。
- `implement`：按单个 issue 实现。
- `review`：实现后做代码审查和规格审查。
- `handoff`：任务较长时生成交接文档。

## 本地任务管理

任务文件放在：

```text
docs/issues/
```

每个任务应该包含：目标、范围、不做什么、涉及文件、验收标准、测试命令。

## 当前重启重点

1. 反向整理现有设计和架构文档。
2. 给 `scripts/game.js` 建立结构地图，不急着拆文件。
3. 修正或更新已知 smoke test 预期。
4. 优先推进 Boss 弹幕丰富度、Boss 随机顺序、敌人 AI 差异化。
5. 每个玩法改动都要有试玩验收标准。

# 幻月战记（Gengetsu Senki）

> 科幻机甲与东方弹幕风格结合的 HTML5 Canvas 坦克对战游戏。

《幻月战记》使用原生 HTML、CSS 和 JavaScript 开发，包含弹幕战斗、Roguelike 局内改造、机体解锁与进化、程序化 BGM，以及单人和本地双人玩法。

## 当前状态

项目处于持续开发阶段，主循环和主要系统已经可以游玩。目前的开发重点是 Boss 弹幕、敌人 AI 差异化、协议树、机体平衡和高难度节奏。

当前平衡数值仍在调整，不代表最终体验。具体计划见 [优化路线](docs/OPTIMIZATION_ROADMAP.md)。

## 快速开始

游戏不需要安装依赖，可以直接用浏览器打开 `index.html`。

也可以在项目目录启动本地服务器：

```powershell
python -m http.server 8080
```

然后访问 `http://localhost:8080`。

## 操作方式

| 操作 | 键盘与鼠标 | 手柄 |
| --- | --- | --- |
| 移动 | `WASD` / 方向键 | 左摇杆 |
| 瞄准 | 鼠标 | 右摇杆 |
| 射击 | 鼠标左键 / `Space` / `J` | `RT` / `A` |
| 暂停或继续 | `P` / `Esc` | - |
| 关闭功能页面 | `Esc` | - |
| 结算后重开 | `R` | - |
| 选机体 | 方向键 + `Enter` / `Space` | 双人选机体界面支持手柄 |

自动索敌是可切换的瞄准设置，不是独立游戏模式。启用后玩家只需控制移动，机体会自动选择目标并开火。双人模式中 P1 使用键盘和鼠标，P2 使用手柄；进入双人模式前必须检测到手柄，双方不能选择相同机体。

## 游戏内容

以下数量直接按当前运行时代码统计，不沿用旧版设计文档中的数量：

| 内容 | 当前数量 |
| --- | ---: |
| 玩家机体 | 10 |
| 难度 | 5 |
| 世界阵营 | 6 |
| 普通敌人 | 8 |
| 精英敌人 | 14 |
| Boss | 21 |
| 基础道具 | 19 |
| 道具协同 | 8 |
| 融合协议 | 5 |
| 成就 | 125 |

- 简单、普通、困难、极限、梦魇五档难度
- 通关战线、无尽战线和每日挑战三种流程
- 单人、本地双人，以及可独立开关的自动索敌
- 每 4 波一次 Boss 战，包含阶段变化、特色攻击和出场预警
- 四选一局内改造，支持稀有度、单卡刷新和同调奖励
- 机装研究室、全域协议树、图鉴、成就、排行榜和战局报告
- Web Audio API 程序化 BGM 与战斗音效
- `localStorage` 本地存档与存档诊断

当前 21 个 Boss：巨兽坦克、幻影坦克、要塞坦克、虚空坦克、风暴坦克、观星者坦克、废铁巨像、雷霆执政官、轨道炮台、圣龛守卫、星象仪、缝合巨兽、双子坦克、迅影、圣龛织者、灰域剑圣、陷阱师、镜像体、沙暴、重力锚、多头蛇。

## 项目结构

```text
tank-battle/
|-- index.html                    # 游戏入口和界面结构
|-- scripts/
|   |-- game.js                   # 游戏主循环和主要玩法逻辑
|   `-- systems/                  # 难度、Boss节奏、阵营等配置模块
|-- styles/game.css               # 游戏界面和视觉样式
|-- audio/music-generator.js      # 程序化BGM
|-- tests/smoke.js                # Node.js冒烟测试
|-- docs/                         # 设计、架构、任务和重启文档
`-- memory/                       # 阵营配色与Boss设计参考
```

## 开发与测试

主要技术：Canvas 2D、Web Audio API、`localStorage` 和原生 JavaScript。

修改代码后运行：

```powershell
node --check scripts/game.js
node tests/smoke.js
```

玩法和视觉改动仍需要在浏览器中手动试玩验证。

## 文档入口

- [项目上下文](CONTEXT.md)
- [重启计划](docs/restart/CODEX_RESTART_PLAN.md)
- [代码结构地图](docs/architecture/game-js-structure-map.md)
- [Boss 设计](docs/BOSS_DESIGN.md)
- [世界系统](docs/WORLD_SYSTEMS.md)

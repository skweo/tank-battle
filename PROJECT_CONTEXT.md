# 幻月战记 (Gengetsu Senki) — 项目上下文

## 概览

坦克大战 HTML5 Canvas 游戏，科幻机甲+东方弹幕风格。单人开发，持续迭代中。

**当前版本：v3.8.47**  
**入口文件：** `index.html`  
**主代码：** `scripts/game.js`（约 12000 行单文件）  
**样式：** `styles/game.css`  
**BGM：** `audio/music-generator.js`（Web Audio API 程序化合成器）  
**测试：** `tests/smoke.js`（15/16 通过，1 个已知失败不影响功能）

## 技术栈

- 纯 HTML5 Canvas + JavaScript（无框架）
- Web Audio API（音效 + 程序化 BGM）
- localStorage（存档）
- Git + GitHub（`skweo/tank-battle`）

## 游戏系统

### 玩法模式
- **通关战线 (Clear)**：打完固定波次 Boss 后通关，解锁下一难度
- **无尽战线 (Endless)**：无限波次，冲排行榜
- **每日挑战 (Daily)**：固定种子 + 特殊目标

### 玩家坦克（10 种，可解锁/升级/进化）
spread（扩散）、focus（集中）、wide（广域）、burst（爆裂）、sniper（狙击）、homing（追踪）、border（境界）、blade（斩魂）、scarlet（红枪）、astral（星仪）

### 敌人体系
- **普通敌人 8 种**：scout, runner, brute, artillery, sniper, sapper, buffer, fissure
- **精英敌人 14 种**：heavy, sniper, fast, flame, summoner, stealth, splitter, regen, laser, miner, barrier, missile, warden, phase
- **Boss 8 种**：巨兽、幻影、要塞、虚空、风暴、观星者、废铁巨像、雷霆执政官

### 局内系统
- 四选一升级改造器（标准/稀有/精英/神话 4 级稀有度）
- 道具拾取（19 种，含融合协议）
- 动态天气（8 种 biome 对应雨/雾/沙尘/火花/雪/灰烬/离子/晴）
- 动态难度缩放
- 连击系统 + 跑分报告
- Boss 多阶段战斗 + telegraph 预警系统

### 局外系统
- 机装研究室（坦克解锁/升级/进化）
- 全域协议树（天赋树）
- 成就系统 + 图鉴（道具/敌人档案）
- 排行榜（通关/无尽）
- 存档诊断面板
- 首局引导提示

### 阵营体系（6 个）
moon_arsenal（月面兵工厂）、void_cult（虚空教派）、ash_church（灰域教会）、storm_cloister（风暴修会）、observatory（观星台）、graveyard（灰域残骸群）

### BGM 系统
- `audio/music-generator.js`：Web Audio API 程序化合成器
- 菜单 3 首 / 战斗 3 首 / Boss 2 首，每次随机切换
- C Phrygian 音阶，延迟混响，钟声乐器
- 音量 0.18，浏览器音频策略已处理

## 最近改动（v3.8.28 → v3.8.47）

1. **画布扩展** 1480×960 → 1680×1080
2. **动态天气系统**：8 种 biome 对应天气，随波次切换
3. **8 种新战场障碍**：弹坑、能量场、残骸、战壕、焦土、废墟、反应堆、晶塔
4. **敌人机甲视觉重制**：4 种普通敌人 + 4 种精英敌人外观升级
5. **Boss 差异化设计**：8 个 Boss 各有独特视觉主题和弹幕逻辑
6. **程序化 BGM 系统**：8 首曲目 + 混响
7. **图鉴分组整理**：道具按功能/敌人按阵营
8. **新增 4 种普通敌人**：sniper, sapper, buffer, fissure
9. **Canvas 状态安全重置**：每帧 clean textAlign/textBaseline
10. **UI 状态栏透明化**：减少遮挡地图
11. **BOSS_TYPES 空条目修复**：通关结算 bug
12. **EnemyTank.draw() 缺失 `t` 变量**：导致玩家坦克不可见

## 待实现（见 OPTIMIZATION_ROADMAP.md）

| 优先级 | 内容 |
|--------|------|
| P1 | Boss 弹幕逻辑与炮口一致性（设计规范已记录在 memory/boss-redesign-specs.md） |
| P2 | 全体坦克炮台转速差异化（敌人按阵营/玩家按机型） |
| P2 | Boss 战前预警演出 |
| P2 | 敌人 AI 行为差异化 |
| P2 | 伤害数字与击中反馈优化 |
| P2 | Boss 与精英敌人阵容扩充 |
| P3 | 战场粒子效果增强 |
| P3 | 动态音乐分层 |
| P5 | 游戏 BGM 系统（可替换为自定义曲目） |

## Boss 设计规范（详细记录在 memory/boss-redesign-specs.md）

- **巨兽坦克**：中央主炮+左右副炮，正面 120° 扇面
- **幻影坦克**：多方向小型发射口，折跃/分身提前地面提示
- **要塞坦克**：固定堡垒+多炮塔+浮游护盾卫星
- **虚空坦克**：定向炮管 P1 + 中心引力核心 360° P2
- **风暴坦克**：无炮管，双特斯拉线圈电弧
- **观星者坦克**：移动雷达平台，碟盘扫描+轨道轰炸
- **废铁巨像**：不对称拼装机甲，链球+废铁碎片
- **雷霆执政官**：浮空型，雷电羽翼+光环，速度最快

## 工作流

1. 改动后运行 `node tests/smoke.js` 确保 15/16 通过
2. git commit + push 到 GitHub
3. 用户直接双击 `index.html` 测试（或 `http://localhost:8080`）

## 已知问题

- smoke test "clear-mode boss archive pacing is compact" 始终失败（Boss 数量从 5 增至 8，波次预期未更新，不影响实际游戏）
- Boss 外观设计规范已记录但尚未全部实现到代码中
- 新增的 4 种普通敌人（sniper/sapper/buffer/fissure）AI 行为与现有敌人相同，特殊行为（布雷/加buff/分裂）待实现

## 关键文件

| 文件 | 用途 |
|------|------|
| `index.html` | 入口 + DOM 结构 |
| `scripts/game.js` | 全部游戏逻辑（约 12000 行） |
| `styles/game.css` | 全部样式 |
| `audio/music-generator.js` | 程序化 BGM |
| `tests/smoke.js` | 冒烟测试 |
| `OPTIMIZATION_ROADMAP.md` | 优化路线表 |
| `WORLD_SYSTEMS.md` | 世界观设定 |
| `world_lore.md` | 世界观文案 |
| `memory/boss-redesign-specs.md` | Boss 设计规范 |

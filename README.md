# 幻月战记 (Gengetsu Senki)

> 科幻机甲 × 东方弹幕 · HTML5 Canvas 坦克大战

[![Release](https://img.shields.io/badge/release-v3.8.52-gold)](https://github.com/skweo/tank-battle/releases)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**幻月战记**是一款基于 HTML5 Canvas 的坦克大战游戏，融合弹幕射击、Roguelike改造器、坦克养成进化和程序化BGM。灰域科幻世界观 × 东方弹幕美学。

---

## 快速开始

浏览器直接打开 `index.html` 即可游玩，无需安装。

或使用本地服务器：
```bash
npx serve
# 访问 http://localhost:8080
```

---

## 操作指南

| 操作 | 按键 |
|------|------|
| 移动 | WASD / 方向键 |
| 瞄准 | 鼠标 |
| 射击 | 鼠标左键 / 空格 |
| 升级选择 | 鼠标点击卡片 |
| 暂停 | Esc |
| 快捷重开 | R |

---

## 游戏特色

### 10 种可选机体（可解锁/升级/进化）
扩散型 · 集中型 · 广域型 · 爆裂型 · 狙击型 · 追踪型 · 境界型 · 斩魂型 · 红枪型 · 星仪型

### 8 种普通敌人（6 阵营）
侦察 · 突袭 · 重装 · 炮台 · 狙击者 · 布雷者 · 支援者 · 分裂者

### 14 种精英敌人
重装 · 狙击 · 疾风 · 火焰 · 召唤 · 隐身 · 分裂 · 再生 · 激光 · 地雷 · 护盾 · 导弹 · 裁断 · 相位

### 8 种 Boss（每4波随机出场）
| Boss | 阵营 | 特色 |
|------|------|------|
| 巨兽坦克 | 月面兵工厂 | 三炮管正面压制+攻城冲角 |
| 幻影坦克 | 虚空教派 | 折跃+分身+多方向发射口 |
| 要塞坦克 | 灰域教会 | 5炮塔固定堡垒+浮游护盾卫星 |
| 虚空坦克 | 虚空教派 | 引力奇点+黑洞撕裂 |
| 风暴坦克 | 风暴修会 | 特斯拉线圈电弧+落雷 |
| 观星者坦克 | 观星台 | 雷达扫描+轨道光束轰炸 |
| 废铁巨像 | 灰域残骸群 | 不对称拼装机甲+链球AOE |
| 雷霆执政官 | 风暴修会 | 浮空型+雷电羽翼+光环 |

- Boss 随机出场顺序（要塞和雷霆执政官前3轮不出现）
- 每个 Boss 有 2 阶段变换 + telegraph 预警

### 动态天气系统
8 种 biome → 晴 / 雨 / 雾 / 沙尘 / 火花 / 雪 / 灰烬 / 离子风暴，随波次自动切换

### 程序化 BGM 系统
- Web Audio API 合成器，8 首独立曲目，每次随机切换
- 菜单 3 首（水晶钟声/虚空氛围/温柔琶音）
- 战斗 3 首（合成波动/紧迫追逐/重型围城）
- Boss 2 首（深渊/审判）
- 延迟混响 + 钟声乐器，C Phrygian 音阶

### 更多系统
- 四选一升级改造器（标准/稀有/精英/神话 4 级稀有度）
- 19 种道具 + 5 种融合协议
- 图鉴档案（道具/敌人分组 + 阵营 + 稀有度排序）
- 机装研究室（坦克解锁/升级/进化）
- 全域协议树（天赋树）
- 25 项成就 + 排行榜
- 每日挑战（种子随机）
- 屏幕震动 + 浮动伤害数字
- 存档诊断面板

---

## 阵营体系（6 个）
| 阵营 | 配色 | 风格 |
|------|------|------|
| moon_arsenal（月面兵工厂）| 暗红 | 重甲军事 |
| void_cult（虚空教派）| 深紫 | 异形引力 |
| ash_church（灰域教会）| 棕金 | 信仰堡垒 |
| storm_cloister（风暴修会）| 电蓝 | 雷电高速 |
| observatory（观星台）| 钢蓝 | 精准扫描 |
| graveyard（灰域残骸群）| 锈棕 | 废铁拼装 |

---

## 开发

纯 HTML5 Canvas + JavaScript，无框架。

### 项目结构
```
├── index.html              # 入口 + DOM
├── scripts/game.js         # 全部游戏逻辑 (~12000行)
├── styles/game.css         # 全部样式
├── audio/music-generator.js # 程序化BGM合成器
├── tests/smoke.js          # 冒烟测试 (15/16 pass)
├── OPTIMIZATION_ROADMAP.md # 优化路线表
├── BOSS_DESIGN.md          # Boss设计规范
├── PROJECT_CONTEXT.md      # 项目上下文(agent交接用)
├── memory/                 # 设计规范文档
│   ├── boss-redesign-specs.md
│   └── faction-color-guide.md
└── WORLD_SYSTEMS.md        # 世界观设定
```

### 本地开发
```bash
git clone https://github.com/skweo/tank-battle.git
node --check scripts/game.js   # 语法检查
node tests/smoke.js             # 冒烟测试
```

# 幻月战记 (Gengetsu Senki)

> 东方Project风格 · HTML5 Canvas 弹幕坦克大战

[![Release](https://img.shields.io/badge/release-v3.4.0-gold)](https://github.com/skweo/tank-battle/releases)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**幻月战记**是一款基于 HTML5 Canvas 的单文件坦克大战游戏，以东方Project的月面战争为灵感，融合了弹幕射击、Roguelike改造器、坦克养成进化等玩法。

---

## 快速开始

浏览器直接打开 [GitHub Pages](https://skweo.github.io/tank-battle/) 即可游玩，无需安装。

或者下载 `index.html` 用任意浏览器打开。

---

## 操作指南

| 操作 | 按键 |
|------|------|
| 移动 | WASD / 方向键 |
| 瞄准 | 鼠标 |
| 射击 | 鼠标左键 / 空格 / J |
| 快捷重开 | R（死亡界面） |
| 退出菜单 | Esc |

---

## 游戏特色

### 6 种可选机体
| 机体 | 特色 | 特殊弹 |
|------|------|--------|
| ☆ 扩散型 | 3方向扩散弹幕 | 每5发穿透弹 |
| ★ 集中型 | 高速集中火力 | 每4发电磁炮 |
| ❋ 广域型 | 5方向广域压制 | 每6发冰冻弹 |
| ✦ 爆裂型 | 7方向爆裂弹幕 | 每5发爆炸弹 |
| ◈ 狙击型 | 超远程高伤 | 每3发超穿透 |
| ◎ 追踪型 | 追踪弹幕 | 每4发强化追踪 |

### 进化系统
满级后可进化为更强形态：夢想散華 / 極限火花 / 永恆凍土 / 終焉爆碎 / 神域狙擊 / 命運導引

### 12 种精英敌人
重装 · 狙击 · 疾风 · 火焰 · 召唤 · 隐身 · 分裂 · 再生 · 激光 · 地雷 · 护盾 · 导弹

### 5 种 Boss（每4波）
巨兽坦克 · 幻影坦克 · 要塞坦克 · 虚空坦克（黑洞引力）· 风暴坦克（穿透闪电）

### 道具融合系统
参考吸血鬼幸存者，5种融合配方：黄金磁铁 / 超电磁炮 / 冰火爆裂 / 不死荆棘 / 弹幕风暴

### 更多系统
- 波次系统 + 波间改造器选择
- 宝箱（分数里程碑 + Boss击杀）
- 每日挑战（种子随机 + 目标奖励）
- 难度排行榜（5难度独立 Top 5）
- 25 项成就
- 击杀掉落月光石货币
- 道具稀有度（普通/稀有/传说）
- Web Audio 合成音效 + 动态BGM
- 屏幕震动 + 浮动伤害数字

---

## 开发

纯单文件 HTML（~4000 行），无外部依赖。技术栈：

- HTML5 Canvas 2D 渲染
- Web Audio API 合成音效
- localStorage 数据持久化
- CSS 自定义界面（东方Project风格）

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/skweo/tank-battle.git

# 用任意浏览器打开 index.html
# 或使用 Live Server
npx live-server
```

### 本地质量检查

```bash
node --check scripts/game.js
node tests/smoke.js
```

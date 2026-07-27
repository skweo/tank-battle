# Domain Docs

本项目使用单一上下文。

## 入口

- `CONTEXT.md`：项目领域上下文
- `docs/PROJECT_CONTEXT.md`：旧项目上下文
- `docs/OPTIMIZATION_ROADMAP.md`：优化路线
- `docs/BOSS_DESIGN.md`：Boss 设计规范
- `memory/faction-color-guide.md`：阵营视觉规范
- `memory/boss-redesign-specs.md`：Boss 重设计细节

## ADR

架构决策记录放在：

```text
docs/adr/
```

当发生这些情况时，需要新增 ADR：

- 拆分 `scripts/game.js`
- 引入新库或构建工具
- 改变存档格式
- 改变测试框架
- 改变渲染架构
- 改变主要数据结构

## 设计文档

CCGS 风格的设计文档可放在：

```text
design/gdd/
```

但当前阶段不强制补全全部 GDD，优先补和当前任务直接相关的系统。

# CCGS 到 Codex 的工作流映射

本项目不在 Claude Code 中运行 CCGS slash command。Codex 读取 CCGS 思路后，用本地文档和 issue 执行同等流程。

## 项目接管

CCGS 原流程：

```text
/project-stage-detect
/adopt
```

Codex 中对应：

```text
读取项目结构 → 生成阶段判断 → 写入 docs/restart 或 docs/issues
```

输出：

- 项目阶段判断
- 缺失文档清单
- 高风险系统清单
- 下一步 issue

## 设计系统

CCGS 原流程：

```text
/map-systems
/design-system
/review-all-gdds
```

Codex 中对应：

```text
domain-modeling → 反向系统地图 → 针对单系统写 GDD 摘要 → review
```

适用对象：

- Boss 系统
- 敌人 AI
- 玩家坦克
- 局内升级
- 道具和融合协议
- 协议树
- UI/HUD
- BGM 和音效

## 功能开发

CCGS 原流程：

```text
/create-epics
/create-stories
/dev-story
/story-done
```

Codex 中对应：

```text
to-prd → to-issues → implement → review
```

输出：

- `docs/issues/*.md`
- 代码改动
- 测试结果
- review 结论

## 团队技能映射

| CCGS 团队技能 | Codex 使用方式 |
|---|---|
| `/team-combat` | 用于 Boss、敌人、弹幕、战斗反馈改动前的设计审查 |
| `/team-ui` | 用于菜单、HUD、实验室、图鉴、排行榜 |
| `/team-audio` | 用于 BGM 分层、命中音效、Boss 音效 |
| `/team-qa` | 用于测试计划、验收标准、试玩报告 |
| `/team-polish` | 用于性能、视觉反馈、手感打磨 |

## Codex 单任务模板

```text
任务：

目标：

采用的 CCGS 视角：

涉及文件：

不做什么：

实现步骤：

验收标准：

测试命令：
```

## 推荐首个任务

不要先做大功能。首个任务建议是：

```text
建立当前测试基线，并判断 smoke test 失败是否需要更新预期。
```

这是后续重构和玩法迭代的安全网。

---
name: apifox-update
description: 更新已有的 API 客户端代码
usage: /apifox-update <API名称>
examples:
  - /apifox-update game-api
  - /apifox-update user-service
---

# 更新 API 客户端代码

更新已配置的 API 客户端代码（从 Apifox 获取最新规范并重新生成）。

## 参数

- `<API名称>` - 必需，已配置的 API 名称（在 apifox.config.json 中）

## 工作流程

### 1. 检查 API 是否已配置

读取项目根目录的 `apifox.config.json`，查找对应的 API 配置。

```
config = Read("./apifox.config.json")
```

如果文件不存在或未找到对应的 API，提示用户：

**配置文件不存在：**
```
❌ 项目还未初始化 Apifox 配置。

请先运行初始化命令：
/apifox-init
```

**API 未配置：**
```
❌ 未找到 API "{API名称}" 的配置。

已配置的 API：
- game-api
- user-service

💡 提示：
- 查看所有 API：/apifox-list
- 生成新 API：/apifox-generate <项目名>
```

### 2. 启动 Agent

使用 Task 工具启动 `apifox-generator` agent：

```
Task(
  subagent_type: "apifox-generator",
  description: "更新 {API名} 的客户端代码",
  prompt: "更新已配置的 API '{API名}' 的客户端代码。这是一个更新任务，配置已存在于 apifox.config.json 中。请读取现有配置，获取最新的 OpenAPI 规范，然后重新生成代码。"
)
```

### 3. 展示结果

Agent 完成后，向用户展示更新结果。

示例：
```
✅ game-api 已更新！

📁 输出路径：src/api/game
📄 更新了 15 个文件
⏱️ 上次生成：2025-01-15 10:30
⏱️ 本次生成：2025-11-26 14:20

💡 提示：
- 查看变更：git diff src/api/game
- 运行测试：pnpm test
- 提交代码：git add . && git commit -m "chore: update game-api client"
```

## 注意事项

- 更新前可以询问用户是否需要备份
- 如果检测到文件有未提交的修改，提醒用户先提交
- 更新是覆盖操作，确保用户了解这一点

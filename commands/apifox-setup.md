---
name: apifox-setup
description: Apifox 配置向导（全局和项目级）
---

# Apifox 配置向导

引导用户配置 Apifox，包括全局配置（Access Token）和项目级配置（Project ID）。

## 工作流程

### 1. 检查当前状态

**检查项目级配置文件：**
```bash
ls -la .env .env.example .mcp.json apifox.config.json
```

**检查 MCP 连接：**
尝试调用 MCP 工具：
```
mcp__apifox__list_projects
```

根据检查结果展示状态。

### 2. 场景处理

#### 场景 A：全部正常

```
✅ Apifox 配置完整！

🔧 环境配置：
- APIFOX_ACCESS_TOKEN: ✓ 已配置
- APIFOX_PROJECT_ID: ✓ 已配置 (5384026)
- .env 文件: ✓ 存在
- .mcp.json: ✓ 存在
- MCP Server: ✓ 运行正常

您可以开始使用：
- /apifox-generate - 生成新的 API 客户端
- /apifox-list - 查看已配置的 API
```

#### 场景 B：项目未初始化

```
📝 项目还未初始化 Apifox 配置。

运行以下命令初始化：
/apifox-init

初始化后会创建：
- .env.example - 环境变量模板
- .mcp.json - MCP Server 配置
- apifox.config.json - API 配置文件
```

#### 场景 C：缺少环境变量

```
⚠️ 环境变量未配置。

请按以下步骤配置：

1. 如果没有 .env 文件：
   cp .env.example .env

2. 编辑 .env 文件，填写配置

3. 重启 Claude Code

详细步骤见下方 👇
```

### 3. 提供详细配置指南

无论当前状态如何，都向用户展示完整的配置指南：

```
# Apifox 详细配置指南

## 一、获取 Access Token（全局配置）

1. 访问 Apifox 个人设置：
   https://app.apifox.com/user/settings

2. 点击「API 访问令牌」→「创建令牌」

3. 令牌名称：建议填写 "Claude Code"

4. 复制生成的 Token（⚠️ 只显示一次，请立即保存）

## 二、获取 Project ID（项目级配置）

1. 在 Apifox 中打开你的项目

2. 从 URL 中复制 Project ID：
   https://app.apifox.com/project/{PROJECT_ID}/...
   
   例如：https://app.apifox.com/project/5384026/apis
   Project ID 就是：5384026

## 三、配置项目环境变量（推荐方式）

### 为什么使用项目级 .env？

✅ 项目隔离 - 每个项目可以配置不同的 PROJECT_ID
✅ 团队协作 - .env.example 提供配置模板
✅ 安全性 - .env 不提交 Git
✅ 便捷性 - 新成员只需 cp .env.example .env

### 配置步骤

```bash
# 1. 确保项目已初始化（如果还没有）
/apifox-init

# 2. 复制模板
cp .env.example .env

# 3. 编辑 .env 文件
nano .env  # 或使用其他编辑器

# 4. 填写配置
APIFOX_ACCESS_TOKEN=your-token-here
APIFOX_PROJECT_ID=5384026

# 5. 保存并重启 Claude Code
```

### .env 文件示例

```
# Apifox 配置
APIFOX_ACCESS_TOKEN=APS-xxxxxxxxxxxxxxxx
APIFOX_PROJECT_ID=5384026
```

⚠️ 注意：
- 不要加引号
- 不要有空格
- Token 和 ID 直接跟在 = 后面

## 四、配置全局环境变量（可选）

如果你只有一个 Apifox 项目，也可以配置全局环境变量：

### macOS / Linux

```bash
# 编辑 shell 配置
nano ~/.zshrc  # macOS 默认使用 zsh
# 或
nano ~/.bashrc  # Linux 通常使用 bash

# 添加以下内容
export APIFOX_ACCESS_TOKEN="your-token-here"
export APIFOX_PROJECT_ID="5384026"

# 重新加载配置
source ~/.zshrc
# 或
source ~/.bashrc
```

### Windows

**PowerShell（管理员）：**

```powershell
[System.Environment]::SetEnvironmentVariable('APIFOX_ACCESS_TOKEN', 'your-token-here', 'User')
[System.Environment]::SetEnvironmentVariable('APIFOX_PROJECT_ID', '5384026', 'User')
```

**或通过系统设置：**
1. 搜索「环境变量」
2. 点击「编辑系统环境变量」
3. 点击「环境变量」按钮
4. 在「用户变量」中新建
5. 添加两个变量：
   - APIFOX_ACCESS_TOKEN = your-token-here
   - APIFOX_PROJECT_ID = 5384026

## 五、重启 Claude Code

⚠️ 重要：配置环境变量后，必须重启 Claude Code 才能生效。

## 六、验证配置

运行以下命令验证：

```
/apifox-list
```

**成功示例：**
```
✅ Apifox 配置完整！
📝 当前项目还没有配置任何 API。
```

**失败示例：**
```
❌ 无法连接到 Apifox
请检查环境变量配置
```

## 故障排查

### Token 无效

**错误：** `401 Unauthorized` 或 `Invalid token`

**解决：**
1. 检查 Token 是否正确复制（无空格、无换行）
2. 确认 Token 未过期
3. 在 Apifox 中重新生成 Token
4. 确保 .env 文件格式正确（无引号）

### Project ID 错误

**错误：** `Project not found` 或 `403 Forbidden`

**解决：**
1. 检查 Project ID 是否正确（纯数字）
2. 确认你有该项目的访问权限
3. 从 Apifox URL 中重新复制 ID
4. 确保 .env 文件格式正确（无引号）

### 环境变量未生效

**错误：** `APIFOX_ACCESS_TOKEN is not set`

**解决：**
1. 确认已重启 Claude Code
2. 检查 .env 文件是否在项目根目录
3. 检查 .env 文件格式（运行：cat .env）
4. 确保变量名正确（大写，无空格）
5. macOS: 检查 shell 配置文件路径（~/.zshrc vs ~/.bashrc）

### MCP Server 无法启动

**错误：** `Failed to start MCP server`

**解决：**
1. 检查网络连接（需要访问 npm registry）
2. 清除缓存：`npm cache clean --force`
3. 检查 .mcp.json 文件格式
4. 重启 Claude Code
5. 查看 Claude Code 日志（如果有）

### .env 文件格式问题

**常见错误：**
```bash
# ❌ 错误：有引号
APIFOX_ACCESS_TOKEN="your-token"

# ❌ 错误：有空格
APIFOX_ACCESS_TOKEN = your-token

# ✅ 正确
APIFOX_ACCESS_TOKEN=your-token
```

## 推荐配置方案

**单项目用户：**
- 使用全局环境变量（~/.zshrc）
- 一次配置，到处使用

**多项目用户 / 团队协作：**
- 使用项目级 .env（推荐）
- 每个项目独立配置
- 团队成员共享 .env.example

## 需要帮助？

如果遇到其他问题，请访问：
https://github.com/yourusername/apifox-generator-plugin/issues
```

## 注意事项

- 强调 Token 安全性（不要分享、提交到 Git）
- 提供清晰的分步指南
- 区分全局配置和项目级配置
- 推荐使用项目级 .env 文件
- 提供详细的故障排查步骤

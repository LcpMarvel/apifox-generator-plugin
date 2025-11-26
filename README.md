# Apifox Generator - Claude Code Plugin

从 Apifox 自动生成 API 客户端代码的 Claude Code 插件。支持多语言、智能推荐、项目级配置。

## 快速开始

### 1. 初始化项目

在你的项目根目录运行：

```
/apifox-init
```

这会创建以下配置文件：
- `.env.example` - 环境变量模板
- `.mcp.json` - MCP Server 配置
- `apifox.config.json` - API 配置文件

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件
nano .env
```

填写以下配置：

```bash
# 从 https://app.apifox.com/user/settings 获取
APIFOX_ACCESS_TOKEN=your-token-here

# 从项目 URL 获取：https://app.apifox.com/project/{ID}
APIFOX_PROJECT_ID=your-project-id
```

### 3. 重启 Claude Code

配置环境变量后，重启 Claude Code 以加载配置。

### 4. 生成 API 客户端

```
/apifox-generate game-api
```

完成！代码已生成到 `src/api/game` 目录。

## 命令列表

| 命令 | 说明 | 示例 |
|------|------|------|
| `/apifox-init` | 初始化项目配置 | `/apifox-init` |
| `/apifox-generate` | 生成新的 API 客户端 | `/apifox-generate game-api` |
| `/apifox-update` | 更新已有的 API 客户端 | `/apifox-update game-api` |
| `/apifox-list` | 列出所有已配置的 API | `/apifox-list` |
| `/apifox-setup` | 配置向导（详细指南） | `/apifox-setup` |

## 使用示例

### 生成新的 API 客户端

```
你：/apifox-generate game-api

系统：
🔍 正在搜索项目...
✓ 找到 1 个项目

找到项目：Game Service API
- 项目 ID：5384026
- 描述：游戏核心 API
- 文档数量：2 个

请选择要使用的文档：
1. Game API v1 (23 个 API)
2. Game API v2 (45 个 API)

你：1

系统：
📊 正在分析 API...
✓ 分析完成

💡 推荐配置：
- 生成器类型：typescript-axios
- 输出路径：src/api/game
- 原因：中型项目，推荐使用功能完整的 Axios 客户端

是否使用推荐配置？

你：是

系统：
⚙️ 正在生成代码...
✓ 代码生成完成

✅ game-api 的客户端代码已生成！

📁 输出路径：src/api/game
📄 生成了 15 个文件
⚙️ 生成器：typescript-axios
📝 配置已保存到 apifox.config.json

💡 下一步建议：
- 安装依赖：pnpm install axios
- 运行 lint：pnpm run lint:fix src/api/game
- 提交代码：git add . && git commit -m "feat: add game-api client"
```

### 更新已有的 API

```
你：/apifox-update game-api

系统：
✅ game-api 已更新！

📁 输出路径：src/api/game
📄 更新了 15 个文件
⏱️ 上次生成：2025-01-15 10:30
⏱️ 本次生成：2025-11-26 14:20

💡 提示：使用 git diff 查看变更内容
```

### 列出所有 API

```
你：/apifox-list

系统：
📋 已配置的 API (2 个):

1. game-api
   - 描述：游戏核心 API
   - 生成器：typescript-axios
   - 输出路径：src/api/game
   - 最后生成：2025-01-15 10:30

2. user-service
   - 描述：用户服务 API
   - 生成器：typescript-fetch
   - 输出路径：src/api/user
   - 最后生成：2025-11-26 14:20

💡 提示：
- 更新 API：/apifox-update <API名称>
- 生成新 API：/apifox-generate
```

## 配置说明

### 获取 Access Token

1. 访问：https://app.apifox.com/user/settings
2. 点击「API 访问令牌」→「创建令牌」
3. 复制生成的 Token

### 获取 Project ID

1. 在 Apifox 中打开你的项目
2. 从 URL 中复制 ID：`https://app.apifox.com/project/{PROJECT_ID}/...`
3. 例如：`https://app.apifox.com/project/5384026/apis` → ID 是 `5384026`

### 环境变量配置

推荐使用项目级 `.env` 文件：

**优势：**
- ✅ 项目隔离 - 每个项目独立配置
- ✅ 团队协作 - `.env.example` 提供配置模板
- ✅ 安全性 - `.env` 不提交 Git
- ✅ 便捷性 - 新成员只需复制并填写

**.env 文件格式：**

```bash
# 不要加引号，不要有空格
APIFOX_ACCESS_TOKEN=APS-xxxxxxxxxxxxxxxx
APIFOX_PROJECT_ID=5384026
```

## 支持的生成器

| 生成器 | 语言 | 说明 |
|--------|------|------|
| `typescript-axios` | TypeScript | Axios HTTP 客户端（推荐） |
| `typescript-fetch` | TypeScript | 原生 Fetch API |
| `typescript-node` | TypeScript | Node.js 客户端 |
| `java` | Java | Java 客户端 |
| `go` | Go | Go 客户端 |
| `python` | Python | Python 客户端 |
| `kotlin` | Kotlin | Kotlin 客户端 |
| `swift` | Swift | Swift 客户端 |

## 项目结构

初始化后的项目结构：

```
my-project/
├── .env                          # 环境变量（不提交 Git）
├── .env.example                  # 环境变量模板（提交 Git）
├── .mcp.json                     # MCP Server 配置（提交 Git）
├── apifox.config.json           # API 配置（提交 Git）
├── .gitignore                    # 包含 .env 规则
└── src/
    └── api/
        ├── game/                 # 生成的 game-api 客户端
        └── user/                 # 生成的 user-api 客户端
```

## 配置文件示例

### apifox.config.json

```json
{
  "global": {
    "defaultGenerator": "typescript-axios",
    "outputBaseDir": "src/api"
  },
  "apis": [
    {
      "name": "game-api",
      "description": "游戏核心 API",
      "apifox": {
        "projectId": "5384026",
        "documentId": "146557348"
      },
      "generator": {
        "type": "typescript-axios",
        "outputPath": "src/api/game"
      },
      "lastGenerated": "2025-11-26T14:20:00Z"
    }
  ]
}
```

## 故障排查

### Token 无效

**错误：** `401 Unauthorized`

**解决：**
1. 检查 `.env` 文件中的 `APIFOX_ACCESS_TOKEN`
2. 确认 Token 未过期
3. 重新生成 Token：https://app.apifox.com/user/settings
4. 重启 Claude Code

### Project ID 错误

**错误：** `Project not found`

**解决：**
1. 检查 `APIFOX_PROJECT_ID` 是否正确（纯数字）
2. 确认有项目访问权限
3. 从 Apifox URL 重新复制 ID

### 环境变量未生效

**错误：** `APIFOX_ACCESS_TOKEN is not set`

**解决：**
1. 确认已重启 Claude Code
2. 检查 `.env` 文件是否在项目根目录
3. 验证文件格式（运行 `cat .env`）
4. 确保没有引号和多余空格

### Docker 未运行

**错误：** `Cannot connect to the Docker daemon`

**解决：**
```bash
# macOS
open -a Docker

# 验证
docker ps
```

详细配置指南：运行 `/apifox-setup`

## 团队协作

### 推荐的 Git 配置

**提交到 Git：**
- ✅ `.env.example` - 配置模板
- ✅ `.mcp.json` - MCP 配置
- ✅ `apifox.config.json` - API 配置

**不要提交：**
- ❌ `.env` - 包含敏感信息

### 新成员加入流程

```bash
# 1. 克隆仓库
git clone <repo-url>
cd <project>

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，填写自己的 APIFOX_ACCESS_TOKEN

# 3. 重启 Claude Code

# 4. 验证配置
/apifox-list

# 5. 开始工作
/apifox-generate
```

## 前置要求

- **Node.js** >= 18
- **Docker Desktop** - 用于 OpenAPI Generator
- **Claude Code** >= 1.0.0
- **Apifox 账号** - 需要 Access Token 和项目访问权限

## 许可证

MIT

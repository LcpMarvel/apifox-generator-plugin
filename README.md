# Apifox Generator - Claude Code Plugin

从 Apifox 自动生成 API 客户端代码的 Claude Code 插件。支持多语言、智能推荐、项目级配置。

## 快速开始

### 1. 配置环境变量

首先设置 `APIFOX_ACCESS_TOKEN` 环境变量：

```bash
# 1. 获取 Token
# 访问 https://app.apifox.com/ → 账号设置 → API 访问令牌

# 2. 永久生效（添加到 shell 配置文件）
echo 'export APIFOX_ACCESS_TOKEN="APS-xxxxxxxxxxxxxxxx"' >> ~/.zshrc
source ~/.zshrc

# 💡 Bash 用户请将 ~/.zshrc 替换为 ~/.bashrc
```

### 2. 重启 Claude Code

配置环境变量后，完全退出并重启 Claude Code 以加载配置。

### 3. 初始化项目

在你的项目根目录运行：

```
/apifox-init
```

这会创建以下配置文件：
- `.mcp.json` - MCP Server 配置（包含 Project ID）
- `apifox.config.json` - API 配置文件

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

## 配置说明

### 获取 Access Token

1. 访问：https://app.apifox.com/
2. 点击右上角头像 → 「账号设置」 → 「API 访问令牌」
3. 点击「新建令牌」，复制生成的 Token

### 获取 Project ID

1. 在 Apifox 中打开你的项目
2. 从 URL 中复制 ID：`https://app.apifox.com/project/{PROJECT_ID}/...`
3. 例如：`https://app.apifox.com/project/5384026/apis` → ID 是 `5384026`
4. 运行 `/apifox-init` 时输入此 ID

### 环境变量配置

使用 shell 环境变量配置 Access Token：

```bash
# macOS / Linux
echo 'export APIFOX_ACCESS_TOKEN="APS-xxxxxxxxxxxxxxxx"' >> ~/.zshrc
source ~/.zshrc

# Windows (PowerShell 管理员)
[System.Environment]::SetEnvironmentVariable('APIFOX_ACCESS_TOKEN', 'APS-xxxxxxxxxxxxxxxx', 'User')
```

**优势：**
- ✅ 安全性 - Token 不会被意外提交到 Git
- ✅ 便捷性 - 一次配置，所有项目共享
- ✅ 标准化 - 符合行业最佳实践

**Project ID 配置：**
- Project ID 通过 `/apifox-init` 写入 `.mcp.json` 文件
- `.mcp.json` 可以提交到 Git，团队共享

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
├── .mcp.json                     # MCP Server 配置（提交 Git，包含 Project ID）
├── apifox.config.json           # API 配置（提交 Git）
└── src/
    └── api/
        ├── game/                 # 生成的 game-api 客户端
        └── user/                 # 生成的 user-api 客户端
```

## 故障排查

### Token 无效

**错误：** `401 Unauthorized`

**解决：**
1. 检查环境变量 `APIFOX_ACCESS_TOKEN` 是否正确设置
2. 确认 Token 未过期
3. 重新生成 Token：https://app.apifox.com/ → 账号设置 → API 访问令牌
4. 重启 Claude Code

### Project ID 错误

**错误：** `Project not found`

**解决：**
1. 检查 `.mcp.json` 中的 Project ID 是否正确（纯数字）
2. 确认有项目访问权限
3. 从 Apifox URL 重新复制 ID
4. 重新运行 `/apifox-init`

### 环境变量未生效

**错误：** `APIFOX_ACCESS_TOKEN is not set`

**解决：**
1. 确认已重启 Claude Code
2. 检查环境变量是否设置：`echo $APIFOX_ACCESS_TOKEN`
3. 确保已添加到 shell 配置文件并执行 `source ~/.zshrc`
4. macOS: 检查 shell 配置文件路径（~/.zshrc vs ~/.bashrc）

### Docker 未运行

**错误：** `Cannot connect to the Docker daemon`

**解决：**
```bash
# macOS
open -a Docker

# 验证
docker ps
```

## 团队协作

### 推荐的 Git 配置

**提交到 Git：**
- ✅ `.mcp.json` - MCP 配置（包含 Project ID）
- ✅ `apifox.config.json` - API 配置

**不要提交：**
- Access Token 通过 shell 环境变量配置，不会出现在项目文件中

### 新成员加入流程

```bash
# 1. 克隆仓库
git clone <repo-url>
cd <project>

# 2. 配置环境变量（一次性设置）
# 获取 Token: https://app.apifox.com/ → 账号设置 → API 访问令牌
echo 'export APIFOX_ACCESS_TOKEN="APS-xxxxx"' >> ~/.zshrc
source ~/.zshrc

# 3. 重启 Claude Code

# 4. 验证配置
/apifox-list

# 5. 开始工作
/apifox-generate
```

## 系统要求

- **Claude Code** >= 1.0.0
- **Node.js** >= 18
- **Docker Desktop** - 用于 OpenAPI Generator
- **Apifox 账号** - 需要 Access Token 和项目访问权限

## 许可证

MIT
---
name: apifox-generate
description: 从 Apifox 生成新的 API 客户端代码
usage: /apifox-generate [项目名称]
examples:
  - /apifox-generate game-api
  - /apifox-generate
---

# 生成 Apifox API 客户端

帮助用户从 Apifox 项目生成 API 客户端代码。

## 参数

- `[项目名称]` - 可选，Apifox 项目名称或关键词

## 工作流程

### 1. 确定项目名称

- 如果命令带参数（如 `/apifox-generate game-api`），使用该参数
- 如果没有参数，询问用户要生成哪个项目的代码

### 2. 检查前置条件

在启动 Agent 前，检查：

**A. 检查项目是否已初始化**

检查文件是否存在：
- `.mcp.json`
- `apifox.config.json`

如果未初始化，引导用户：
```
❌ 项目还未初始化 Apifox 配置。

请先运行初始化命令：
/apifox-init
```

**B. 检查环境变量**

检查 `.env` 文件是否存在：
```bash
if [ ! -f .env ]; then
  echo "⚠️ 未找到 .env 文件"
fi
```

如果不存在，引导用户：
```
⚠️ 未找到 .env 文件。

请按以下步骤配置：

1. 复制模板：
   cp .env.example .env

2. 编辑 .env 文件，填写：
   - APIFOX_ACCESS_TOKEN（从 https://app.apifox.com/user/settings 获取）
   - APIFOX_PROJECT_ID（从项目 URL 获取）

3. 重启 Claude Code

详细配置指南：运行 /apifox-setup
```

**C. 检查 Apifox MCP Server 是否可用**

尝试调用 MCP 工具：
```
mcp__apifox__list_projects
```

如果失败，说明配置有问题，引导用户检查：
```
❌ 无法连接到 Apifox。

可能的原因：
1. .env 文件不存在或配置错误
2. APIFOX_ACCESS_TOKEN 无效或过期
3. APIFOX_PROJECT_ID 不正确
4. 未重启 Claude Code

解决方法：
1. 检查 .env 文件内容（运行：cat .env）
2. 确认环境变量格式正确（无引号、无空格）
3. 重新获取 Token（https://app.apifox.com/user/settings）
4. 重启 Claude Code

详细配置指南：运行 /apifox-setup
```

**D. 检查 Docker 是否运行**

执行命令：
```bash
docker ps
```

如果失败，提示用户：
```
❌ Docker 未运行，无法生成代码。

请启动 Docker：
- macOS: open -a Docker
- Windows: 启动 Docker Desktop
- Linux: sudo systemctl start docker

启动 Docker 后重试。
```

### 3. 启动 Agent

所有检查通过后，使用 Task 工具启动 `apifox-generator` agent：

```
Task(
  subagent_type: "apifox-generator",
  description: "生成 {项目名} 的客户端代码",
  prompt: "为项目 '{项目名}' 生成 API 客户端代码。这是一个新的生成任务。"
)
```

### 4. 展示结果

Agent 完成后，向用户展示：
- ✅ 生成成功信息
- 📁 输出路径
- 📄 生成的文件数量
- ⚙️ 配置信息（生成器类型、输出路径）
- 💡 下一步建议（如运行 lint、test、提交代码等）

示例：
```
✅ game-api 的客户端代码已生成！

📁 输出路径：src/api/game
📄 生成了 15 个文件
⚙️ 生成器：typescript-axios
📝 配置已保存到 apifox.config.json

💡 下一步建议：
- 安装依赖：pnpm install axios
- 运行 lint：pnpm run lint:fix src/api/game
- 测试代码：pnpm test
- 提交代码：git add . && git commit -m "feat: add game-api client"
```

## 注意事项

- 始终保持友好、自然的对话风格
- 遇到问题时，提供清晰的解决方案
- 不要向用户暴露技术细节（如 Agent 名称、MCP 工具名称等）
- 优先使用易懂的语言，避免专业术语

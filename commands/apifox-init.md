---
name: apifox-init
description: 初始化 Apifox 项目配置
usage: /apifox-init
---

# 初始化 Apifox 项目配置

在当前项目中初始化 Apifox 相关配置文件。

## 工作流程

### 1. 检查是否已初始化

检查以下文件是否存在：
- `.env` 或 `.env.example`
- `.mcp.json`
- `apifox.config.json`

如果已存在，询问用户是否覆盖：
```
检测到项目已初始化 Apifox 配置。

已存在的文件：
- .env.example ✓
- .mcp.json ✓
- apifox.config.json ✓

是否重新初始化（会覆盖现有文件）？
1. 是，重新初始化
2. 否，取消操作
```

### 2. 复制模板文件

从 Plugin 的 `templates/` 目录复制模板文件到项目根目录：

使用 Read 工具读取模板内容，然后用 Write 工具写入到项目根目录。

**需要复制的文件：**
- `${CLAUDE_PLUGIN_ROOT}/templates/.env.example` → `./.env.example`
- `${CLAUDE_PLUGIN_ROOT}/templates/.mcp.json` → `./.mcp.json`  
- `${CLAUDE_PLUGIN_ROOT}/templates/apifox.config.json` → `./apifox.config.json`

### 3. 自动添加到 .gitignore

检查 `.gitignore` 文件，如果不存在或没有 `.env` 规则，自动添加：

```bash
# 检查是否已有 .env 规则
if [ ! -f .gitignore ] || ! grep -q "^\.env$" .gitignore 2>/dev/null; then
  echo ".env" >> .gitignore
  echo "✅ 已将 .env 添加到 .gitignore"
fi
```

### 4. 引导用户配置

向用户展示配置指南：

```
✅ 项目初始化完成！

已创建以下文件：
- .env.example - 环境变量模板
- .mcp.json - MCP Server 配置
- apifox.config.json - API 配置文件
- .gitignore - 已添加 .env 规则

📝 下一步：配置环境变量

1. 复制环境变量模板：
   cp .env.example .env

2. 编辑 .env 文件，填写配置：
   
   a) 获取 APIFOX_ACCESS_TOKEN：
      - 访问：https://app.apifox.com/user/settings
      - 点击「API 访问令牌」→「创建令牌」
      - 复制生成的 Token
   
   b) 获取 APIFOX_PROJECT_ID：
      - 在 Apifox 中打开你的项目
      - 从 URL 中复制 ID：https://app.apifox.com/project/{PROJECT_ID}/...
      - 例如：https://app.apifox.com/project/5384026/apis
      - Project ID 就是：5384026

3. 重启 Claude Code 以加载新配置

4. 验证配置：
   /apifox-list

💡 提示：
- .env.example 应该提交到 Git（作为配置模板）
- .env 不要提交到 Git（包含敏感信息）
- .mcp.json 可以提交到 Git（团队共享 MCP 配置）
- apifox.config.json 可以提交到 Git（团队共享 API 配置）
```

## 注意事项

- 提醒用户保护 `.env` 文件，不要提交到 Git
- 团队新成员只需 `cp .env.example .env` 并填写即可
- 如果项目已有 `.env` 文件，不要覆盖
- 确保 `.gitignore` 包含 `.env` 规则

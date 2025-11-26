---
name: apifox-init
description: 初始化 Apifox 项目配置
usage: /apifox-init
---

# 初始化 Apifox 项目配置

在当前项目中初始化 Apifox 相关配置文件。

## 工作流程

### 1. 检查环境变量

首先检查 `APIFOX_ACCESS_TOKEN` 是否已设置：

```bash
echo "APIFOX_ACCESS_TOKEN: ${APIFOX_ACCESS_TOKEN:-(未设置)}"
```

如果环境变量**未设置**，引导用户配置：

```
⚠️ 检测到 APIFOX_ACCESS_TOKEN 未配置

请先设置环境变量，否则 MCP 服务无法正常工作。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 设置步骤：

1️⃣ 获取 Access Token：
   - 访问 https://app.apifox.com/
   - 点击右上角头像 →「账号设置」→「API 访问令牌」
   - 点击「新建令牌」，复制生成的 Token

2️⃣ 设置环境变量：

   # 添加到 Shell 配置文件（永久生效）
   echo 'export APIFOX_ACCESS_TOKEN="your_token_here"' >> ~/.zshrc
   source ~/.zshrc

   💡 Bash 用户请将 ~/.zshrc 替换为 ~/.bashrc

3️⃣ 验证：
   echo $APIFOX_ACCESS_TOKEN

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

完成后请重新运行：/apifox-init
```

**重要**：如果环境变量未配置，到此为止，不要继续后面的步骤！

### 2. 询问 Project ID

环境变量配置好后，询问用户 Project ID：

```
✅ APIFOX_ACCESS_TOKEN 已配置

现在需要您的 Apifox Project ID。

🆔 获取方式：
   - 在 Apifox 中打开你的项目
   - 查看浏览器地址栏 URL
   - 例如：https://app.apifox.com/project/5384026/apis
   - 这里的 Project ID 是：5384026

请输入您的 Project ID：
```

等待用户输入 Project ID。

### 3. 检查是否已初始化

检查以下文件是否存在：
- `.mcp.json`
- `apifox.config.json`

如果已存在，询问用户是否覆盖：
```
检测到项目已有 Apifox 配置。

已存在的文件：
- .mcp.json ✓
- apifox.config.json ✓

是否重新初始化（会覆盖现有文件）？
1. 是，重新初始化
2. 否，取消操作
```

### 4. 创建配置文件

使用用户输入的 Project ID 创建以下配置文件：

**文件 1: `.mcp.json`**
```json
{
  "mcpServers": {
    "apifox": {
      "command": "npx",
      "args": [
        "-y",
        "apifox-mcp-server@latest",
        "--project=<用户输入的 Project ID>"
      ],
      "env": {
        "APIFOX_ACCESS_TOKEN": "${APIFOX_ACCESS_TOKEN}"
      }
    }
  }
}
```

**文件 2: `apifox.config.json`**
```json
{
  "$schema": "https://raw.githubusercontent.com/LcpMarvel/apifox-generator-plugin/master/schema.json",
  "global": {
    "defaultGenerator": "typescript-axios",
    "outputBaseDir": "src/api"
  },
  "apis": []
}
```

### 5. 显示成功消息

```
✅ 项目初始化完成！

已创建以下文件：
- .mcp.json - MCP Server 配置（Project ID: <用户输入的值>）
- apifox.config.json - API 配置文件

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 下一步：

1. 重启 Claude Code 以加载 MCP 配置
   - 完全退出 Claude Code（Cmd+Q）
   - 重新打开项目

2. 验证配置：
   /doctor  # 检查 MCP 状态，应该没有警告

3. 开始使用：
   /apifox-list              # 查看 API 列表
   /apifox-generate <name>   # 生成 API 代码

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 提示：
- .mcp.json 可以提交到 Git（Token 从环境变量读取）
- apifox.config.json 可以提交到 Git（团队共享 API 配置）
- 团队成员只需设置自己的 APIFOX_ACCESS_TOKEN 环境变量即可
```

## 故障排除

如果用户在 `/doctor` 中看到以下警告：
```
[Warning] Missing environment variables: APIFOX_ACCESS_TOKEN
```

引导用户：

```
🔧 环境变量未生效，请检查：

1. 确认环境变量已设置：
   echo $APIFOX_ACCESS_TOKEN
   
   如果输出为空，请设置：
   export APIFOX_ACCESS_TOKEN="your_token"

2. 确认已添加到 Shell 配置文件：
   cat ~/.zshrc | grep APIFOX_ACCESS_TOKEN
   
   如果没有，请添加：
   echo 'export APIFOX_ACCESS_TOKEN="your_token"' >> ~/.zshrc
   source ~/.zshrc

3. 重启 Claude Code（必须完全退出再打开）
```

## 注意事项

- **只需要一个环境变量**：`APIFOX_ACCESS_TOKEN`
- **Project ID 直接写入配置**：不需要设置 `APIFOX_PROJECT_ID` 环境变量
- `.mcp.json` 可以安全提交到 Git（不包含敏感信息）
- 团队成员共享同一个 Project ID，各自设置自己的 Access Token
---
name: apifox-list
description: 列出所有已配置的 API
---

# 列出已配置的 API

读取项目根目录的 `apifox.config.json`，展示所有已配置的 API。

## 工作流程

### 1. 读取配置文件

```
Read("./apifox.config.json")
```

### 2. 展示 API 列表

**如果配置文件不存在：**
```
📝 项目还未初始化 Apifox 配置。

运行以下命令初始化：
/apifox-init
```

**如果配置文件存在但为空：**
```
📝 当前项目还没有配置任何 API。

使用以下命令生成第一个 API 客户端：
/apifox-generate
```

**如果有配置，展示列表：**
```
📋 已配置的 API (2 个):

1. game-api
   - 描述：游戏核心 API
   - 生成器：typescript-axios
   - 输出路径：src/api/game
   - 最后生成：2025-01-15 10:30
   - Apifox 项目 ID：5384026
   - Apifox 文档 ID：146557348

2. user-service
   - 描述：用户服务 API
   - 生成器：typescript-fetch
   - 输出路径：src/api/user
   - 最后生成：2025-11-26 14:20
   - Apifox 项目 ID：5384027
   - Apifox 文档 ID：146557350

💡 提示：
- 更新 API：/apifox-update <API名称>
- 生成新 API：/apifox-generate
```

### 3. 展示全局配置（如果有）

如果配置文件中有 `global` 配置，一并展示：
```
⚙️ 全局配置：
- 默认生成器：typescript-axios
- 输出基础目录：src/api
- 生成后钩子：pnpm run lint:fix src/api
```

### 4. 展示环境变量状态

检查并显示环境变量配置状态：

```bash
# 检查环境变量（从 shell 环境变量读取）
echo "APIFOX_ACCESS_TOKEN: ${APIFOX_ACCESS_TOKEN:+✓ 已配置}"
echo "APIFOX_ACCESS_TOKEN: ${APIFOX_ACCESS_TOKEN:-✗ 未配置}"

# 检查 .mcp.json
if [ -f .mcp.json ]; then
  echo ".mcp.json: ✓ 存在"
else
  echo ".mcp.json: ✗ 不存在"
fi
```

展示状态：
```
🔧 环境配置：
- APIFOX_ACCESS_TOKEN: ✓ 已配置（shell 环境变量）
- .mcp.json: ✓ 存在（包含 Project ID）
```

或者如果有问题：
```
⚠️ 环境配置：
- APIFOX_ACCESS_TOKEN: ✗ 未配置

请先设置环境变量：
1. export APIFOX_ACCESS_TOKEN="APS-xxxxx"
2. 添加到 ~/.zshrc 永久生效
3. 重启 Claude Code

或运行初始化向导：/apifox-init
```

## 注意事项

- 使用清晰的格式化输出
- 突出重要信息（API 名称、输出路径）
- 提供下一步操作建议
- 不要在输出中显示敏感信息（如 Access Token 的值）

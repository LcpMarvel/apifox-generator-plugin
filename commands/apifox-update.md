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

## 执行流程

### 第 1 步：读取配置

读取 `apifox.config.json`，查找对应的 API 配置。

**如果配置文件不存在：**
```
❌ 项目还未初始化

请先运行：/apifox-init
```

**如果 API 未配置：**
```
❌ 未找到 API "{API名称}" 的配置

已配置的 API：
• game-api
• user-service

生成新 API：/apifox-generate <项目名>
```

---

### 第 2 步：确认更新

向用户展示当前配置并确认：
```
准备更新 {apiName}

当前配置：
• 输出路径：{outputPath}
• 生成器：{generatorType}
• 上次生成：{lastGenerated}
• 上次参数：{additionalProperties}

⚠️ 这将覆盖现有文件。

是否继续？(yes/no)
```

---

### 第 3 步：检查未提交的修改

**静默执行** git 检查：
```bash
git status --porcelain ${outputPath} 2>/dev/null | head -5
```

如果有修改：
```
⚠️ 检测到未提交的修改：

  M src/api/game/api.ts
  M src/api/game/models.ts

建议先提交或备份这些修改。

是否继续更新？(yes/no)
```

---

### 第 4 步：获取生成器配置选项 ⭐

**在更新前，获取生成器的最新配置选项。**

使用 Docker 命令获取生成器的配置帮助：

```bash
docker run --rm openapitools/openapi-generator-cli config-help -g ${generator_type}
```

这会输出该生成器支持的所有 `additional-properties`，包括：
- 参数名称
- 参数描述
- 默认值
- 可选值（如果有）

**备用方案**：如果 Docker 不可用，可以用 fetch 工具从 https://openapi-generator.tech/docs/generators/ 获取文档。

---

### 第 5 步：重新分析用户项目 ⭐

**项目配置可能已经变化，需要重新分析。**

根据项目类型，检查以下配置文件：

| 项目类型 | 检查的文件 |
|----------|------------|
| TypeScript | `package.json`, `tsconfig.json`, `pnpm-workspace.yaml` |
| Java | `pom.xml`, `build.gradle` |
| Go | `go.mod` |
| Python | `pyproject.toml`, `setup.py` |

**分析要点：**
1. 从配置文件中提取项目的技术栈信息
2. 与上次生成时的配置对比
3. 对照第 4 步获取的配置选项列表
4. 为每个相关的配置选项决定合适的值

**如果检测到变化，向用户报告：**
```
检测到项目配置变化：

• tsconfig.json target 已更新
• package.json 新增/更新依赖

建议更新参数。

是否使用新参数？
1. 是 - 使用新参数
2. 否 - 保持原参数

请选择（输入 1 或 2）：
```

---

### 第 6 步：下载 OpenAPI 规范

向用户展示：
```
📥 正在下载最新的 OpenAPI 规范...
```

从配置中获取 projectId 和 documentId，调用 MCP 工具：
```
mcp__apifox__get_export_config({
  projectId: config.apifox.projectId,
  documentId: config.apifox.documentId
})
```

然后执行下载（静默执行，不展示命令细节）：
```bash
timestamp=$(date +%s)
spec_file="/tmp/openapi-spec-${timestamp}.json"

curl -s -o "$spec_file" \
  -X POST \
  "${url}" \
  -H "Content-Type: application/json" \
  -H "X-Project-Id: ${project_id}" \
  --data-raw "${body}"

if [ -f "$spec_file" ] && [ -s "$spec_file" ]; then
  echo "SPEC_FILE=$spec_file"
else
  echo "DOWNLOAD_FAILED"
fi
```

向用户展示：
```
✅ 下载完成
```

---

### 第 7 步：生成代码

向用户展示：
```
🔨 正在重新生成代码...
```

**根据第 4-5 步的分析，使用最新的参数**执行 Docker 生成（静默执行）：
```bash
docker run --rm \
  -v "${PWD}:/local" \
  -v "${spec_file}:/spec.json:ro" \
  openapitools/openapi-generator-cli generate \
  -i /spec.json \
  -g "${generator_type}" \
  -o "/local/${output_path}" \
  --skip-validate-spec \
  --additional-properties="${computed_props}" 2>&1 | \
  grep -E "(Successfully|writing file|Error)" | head -5

exit_code=$?

rm -f "${spec_file}"

if [ $exit_code -eq 0 ]; then
  file_count=$(find "${output_path}" -type f -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
  echo "SUCCESS"
  echo "FILE_COUNT=${file_count}"
else
  echo "FAILED"
fi
```

向用户展示：
```
✅ 代码生成完成
```

---

### 第 8 步：更新配置

更新 `apifox.config.json`：
```javascript
api.lastGenerated = new Date().toISOString()
// 如果参数有变化，也更新
if (paramsChanged) {
  api.generator.additionalProperties = newAdditionalProps
}
```

---

### 第 9 步：展示结果

```
✅ {apiName} 已更新！

📁 输出路径：{outputPath}
📄 更新了 {fileCount} 个文件
⏱️ 上次生成：{previousTime}
⏱️ 本次生成：{currentTime}
🔧 使用参数：{additionalProps}

💡 下一步：
• 查看变更：git diff {outputPath}
• 运行测试：pnpm test
• 提交代码：git add . && git commit -m "chore: update {apiName} client"
```

---

## 错误处理

### 下载失败

```
❌ 下载 OpenAPI 规范失败

可能的原因：
1. 网络连接问题
2. Access Token 过期
3. 项目访问权限已变更

解决方法：
1. 检查网络连接
2. 重新获取 Token: https://app.apifox.com/ → 账号设置 → API 访问令牌
3. 确认仍有项目访问权限
```

### 生成失败

```
❌ 代码生成失败

可能的原因：
1. OpenAPI 规范格式有变化
2. Docker 未运行

建议：
1. 检查 Docker 状态：docker ps
2. 在 Apifox 中检查 API 定义
3. 尝试重新生成：/apifox-generate {apiName}
```

### 配置不匹配

```
⚠️ 配置可能已过期

检测到的问题：
• Apifox 项目 ID 无效
• 文档可能已被删除

建议：
1. 重新生成 API：/apifox-generate {apiName}
2. 手动更新 apifox.config.json 中的配置
```

---

## 用户体验原则

### ✅ 应该做的

1. **用 Docker 命令获取最新配置选项**
   ```
   🔍 正在获取生成器配置选项...
   ✅ 获取完成
   ```

2. **重新分析项目配置**
   ```
   🔍 正在检查项目配置变化...
   ✅ 检测到配置更新
   ```

3. **报告参数变化**
   ```
   📊 参数对比：
   • 原参数：{原参数}
   • 新参数：{新参数}
   ```

4. **简洁的进度显示**
   ```
   📥 正在下载...
   ✅ 下载完成
   
   🔨 正在生成...
   ✅ 生成完成
   ```

5. **清晰的变更对比**
   ```
   ⏱️ 上次生成：2025-01-15 10:30
   ⏱️ 本次生成：2025-11-26 14:20
   ```

6. **有用的后续建议**
   ```
   💡 下一步：
   • 查看变更：git diff ...
   ```

### ❌ 不要做的

1. **不要打印脚本内容**
2. **不要展示 curl 命令细节**
3. **不要展示 Docker 完整输出**
4. **不要展示 OpenAPI 规范内容**
5. **不要跳过项目分析直接使用旧参数**
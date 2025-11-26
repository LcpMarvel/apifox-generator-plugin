---
name: apifox-generate
description: 从 Apifox 生成新的 API 客户端代码
usage: /apifox-generate [API名称]
examples:
  - /apifox-generate dota-api
  - /apifox-generate game-service
  - /apifox-generate
---

# 生成 Apifox API 客户端

从 Apifox 项目生成 API 客户端代码。

## 参数

- `[API名称]` - 可选，想要生成的 API 名称（如 dota-api、user-service）

## 执行流程

### 第 1 步：确定 API 名称

**如果用户提供了 API 名称：**
```
用户：/apifox-generate dota-api
→ apiName = "dota-api"
```

**如果用户没有提供：**
```
想为哪个 API 生成客户端代码？

请输入 API 名称（例如：game-api、user-service）
或输入 "list" 查看可用的项目列表
```

---

### 第 2 步：前置检查

**静默执行**，只输出检查结果：

```
📋 环境检查...

✅ Docker 正在运行
✅ APIFOX_ACCESS_TOKEN 已配置
✅ apifox.config.json 存在

检查通过，继续执行。
```

**如果检查失败，提示用户：**

```
❌ 环境检查未通过

问题：
• Docker 未运行

解决方法：
• macOS: open -a Docker
• Windows: 启动 Docker Desktop
• Linux: sudo systemctl start docker

解决后请重试。
```

---

### 第 3 步：搜索 Apifox 项目

向用户展示：
```
🔍 正在搜索项目...
```

调用 MCP 工具：
```
mcp__apifox__list_projects({ search: apiName })
```

**处理结果：**

#### 找到 0 个项目
```
未找到包含 "xxx" 的项目。

你可以：
1. 修改搜索关键词
2. 输入 "list" 查看所有项目
3. 输入 "cancel" 取消

请选择：
```

#### 找到 1 个项目
```
✅ 找到项目：{projectName}

• ID: {projectId}
• 文档数量: {documentCount}

是否使用此项目？(yes/no)
```

#### 找到多个项目
```
找到 {count} 个项目：

1. {project1.name} (ID: {project1.id})
   • 文档：{project1.documentCount} 个

2. {project2.name} (ID: {project2.id})
   • 文档：{project2.documentCount} 个

请选择（输入序号 1-{count}）：
```

---

### 第 4 步：分析项目并推荐配置

向用户展示：
```
📊 正在分析项目...
```

调用 MCP 工具：
```
mcp__apifox__get_apis({ projectId })
```

分析后展示：
```
✅ 项目分析完成！

📊 项目特征：
   • API 数量：{apiCount} 个
   • HTTP 方法：GET ({getCount}), POST ({postCount}), PUT ({putCount}), DELETE ({deleteCount})
   • 特点：{hasFileUpload ? "包含文件上传" : "标准 REST API"}

💡 推荐配置：
   • 生成器类型：{recommendedGenerator}
   • 输出路径：{recommendedPath}
   • 推荐理由：{reason}

是否使用推荐配置？
1. 是 - 使用推荐配置（快速开始）
2. 否 - 自定义配置

请选择（输入 1 或 2）：
```

**如果用户选择自定义：**
```
请选择生成器类型：
1. typescript-axios（推荐）- TypeScript + Axios
2. typescript-fetch - TypeScript + Fetch API
3. java - Java 客户端
4. go - Go 客户端
5. python - Python 客户端

请选择（1-5）：
```

```
请输入输出路径（默认：{recommendedPath}）：
```

---

### 第 5 步：获取生成器配置选项 ⭐

**⚠️ 重要：在生成代码前，必须先了解生成器的所有配置选项！**

使用 Docker 命令获取生成器的配置帮助（比抓网页更可靠）：

```bash
docker run --rm openapitools/openapi-generator-cli config-help -g ${selectedGenerator}
```

例如，获取 typescript-axios 的配置选项：
```bash
docker run --rm openapitools/openapi-generator-cli config-help -g typescript-axios
```

这会输出该生成器支持的所有 `additional-properties`，包括：
- 参数名称
- 参数描述
- 默认值
- 可选值（如果有）

**备用方案**：如果 Docker 不可用，可以用 fetch 工具从 https://openapi-generator.tech/docs/generators/ 获取文档。

---

### 第 6 步：分析用户项目，确定生成器参数

**静默分析用户项目**，结合第 5 步获取的配置选项，确定最佳的 `--additional-properties`。

根据项目类型，检查以下配置文件：

| 项目类型 | 检查的文件 |
|----------|------------|
| TypeScript | `package.json`, `tsconfig.json`, `pnpm-workspace.yaml` |
| Java | `pom.xml`, `build.gradle` |
| Go | `go.mod` |
| Python | `pyproject.toml`, `setup.py` |

**分析要点：**
1. 从配置文件中提取项目的技术栈信息（ES 版本、框架、包管理器等）
2. 对照第 5 步获取的配置选项列表
3. 为每个相关的配置选项决定合适的值
4. 构建 `--additional-properties` 参数字符串

---

### 第 7 步：下载 OpenAPI 规范

**⚠️ 重要：不要向用户展示下载细节！**

向用户展示：
```
📥 正在下载 OpenAPI 规范...
```

调用 MCP 工具获取下载配置：
```
mcp__apifox__get_export_config({
  projectId: selectedProjectId,
  documentId: selectedDocumentId
})
```

然后执行下载（静默执行，不展示脚本内容）：
```bash
timestamp=$(date +%s)
spec_file="/tmp/openapi-spec-${timestamp}.json"

curl -s -o "$spec_file" \
  -X POST \
  "${export_url}" \
  -H "Content-Type: application/json" \
  -H "X-Project-Id: ${project_id}" \
  --data-raw "${export_body}"

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

**如果下载失败：**
```
❌ 下载失败

可能的原因：
1. 网络连接问题
2. Access Token 过期
3. 没有项目访问权限

解决方法：
1. 检查网络连接
2. 重新获取 Token: https://app.apifox.com/ → 账号设置 → API 访问令牌
```

---

### 第 8 步：生成客户端代码

向用户展示：
```
🔨 正在生成客户端代码...
   ⏳ 运行 Docker 生成器（首次可能需要下载镜像）...
```

**根据第 5-6 步的分析，构建 Docker 命令**（静默执行，不展示完整命令）：

```bash
# 变量来自前面步骤的分析
spec_file="/tmp/openapi-spec-${timestamp}.json"
generator_type="${selectedGenerator}"        # 如 typescript-axios
output_path="${selectedOutputPath}"          # 如 src/api/game
additional_props="${computedAdditionalProps}" # 如 supportsES6=true,withSeparateModelsAndApi=true

docker run --rm \
  -v "${PWD}:/local" \
  -v "${spec_file}:/spec.json:ro" \
  openapitools/openapi-generator-cli generate \
  -i /spec.json \
  -g "${generator_type}" \
  -o "/local/${output_path}" \
  --skip-validate-spec \
  --additional-properties="${additional_props}" 2>&1 | \
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

**注意：`${additional_props}` 是根据第 5-6 步分析计算出的参数，不是固定值！**

向用户展示：
```
✅ 代码生成完成
```

**如果生成失败：**
```
❌ 代码生成失败

可能的原因：
1. OpenAPI 规范格式问题
2. 输出目录权限不足
3. 磁盘空间不足

建议：
1. 在 Apifox 中检查 API 定义是否完整
2. 尝试使用其他生成器类型
```

---

### 第 9 步：保存配置

更新 `apifox.config.json`：
```javascript
config.apis.push({
  name: apiName,
  apifox: {
    projectId: selectedProjectId,
    documentId: selectedDocumentId,
    projectName: selectedProjectName
  },
  generator: {
    type: generatorType,
    outputPath: outputPath,
    additionalProperties: additionalProps  // 保存使用的参数
  },
  lastGenerated: new Date().toISOString()
})
```

---

### 第 10 步：展示成功信息

```
✅ {apiName} 的客户端代码已生成！

📁 输出路径：{outputPath}
📄 生成了 {fileCount} 个文件
⚙️ 生成器：{generatorType}
🔧 参数：{additionalProps}
📝 配置已保存到 apifox.config.json

💡 下一步：

1️⃣ 安装依赖：
   pnpm install axios

2️⃣ 使用示例：
   import { DefaultApi, Configuration } from './{outputPath}'
   
   const api = new DefaultApi(new Configuration({
     basePath: 'https://api.example.com'
   }))
   
   const data = await api.getSomething()

3️⃣ 更新代码：
   /apifox-update {apiName}
```

---

## 用户体验原则

### ✅ 应该做的

1. **用 Docker 命令获取配置选项**
   - `docker run --rm openapitools/openapi-generator-cli config-help -g <generator>`
   - 获取该生成器支持的所有参数

2. **分析用户项目确定参数**
   - 读取项目配置文件
   - 结合配置选项列表，智能推断最佳参数

3. **简洁的进度显示**
   - 每个步骤一行状态
   - 使用 emoji 增加可读性

4. **展示使用的参数**
   - 让用户知道用了什么配置
   - 方便后续调整

### ❌ 不要做的

1. **不要打印脚本内容**
   - curl 命令的完整参数
   - Bash 脚本源码
   - Docker 完整命令

2. **不要暴露技术细节**
   - MCP 工具名称
   - 内部变量值
   - 临时文件路径

3. **不要展示大量输出**
   - Docker 的详细日志
   - OpenAPI 规范内容
   - 生成器的所有警告

4. **不要使用固定参数**
   - 应该根据项目情况动态决定
   - 不同项目可能需要不同配置
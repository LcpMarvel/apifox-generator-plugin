/**
 * Apifox Generator Plugin - Type Definitions
 * 完全基于 MCP + AI 协调模式的类型系统
 */

// ============================================================================
// 配置文件类型（用户项目目录下的 apifox.config.json）
// ============================================================================

export interface ApifoxConfig {
  $schema?: string;

  /** 全局配置 */
  global?: GlobalConfig;

  /** 多个 API 源配置 */
  apis: APIConfig[];
}

export interface GlobalConfig {
  /** 默认生成器类型 */
  defaultGenerator?: GeneratorType;

  /** 输出基础目录 */
  outputBaseDir?: string;

  /** 全局 hooks */
  hooks?: HooksConfig;
}

export interface APIConfig {
  /** API 名称（用户友好的标识符） */
  name: string;

  /** API 描述 */
  description?: string;

  /** Apifox 项目信息（通过 MCP 自动发现） */
  apifox: ApifoxProjectInfo;

  /** 生成器配置 */
  generator: GeneratorConfig;

  /** 单独的 hooks（覆盖全局配置） */
  hooks?: HooksConfig;

  /** 最后生成时间 */
  lastGenerated?: string;

  /** 是否通过 MCP 自动发现 */
  autoDiscovered?: boolean;
}

export interface ApifoxProjectInfo {
  /** Apifox 项目 ID */
  projectId: string;

  /** Apifox 文档 ID */
  documentId: string;

  /** Apifox 项目名称（来自 MCP） */
  projectName?: string;

  /** API 端点数量（来自 MCP） */
  apiCount?: number;
}

export interface GeneratorConfig {
  /** 生成器类型 */
  type: GeneratorType;

  /** 输出路径 */
  outputPath: string;

  /** 自定义配置文件路径（可选） */
  configFile?: string;
}

export interface HooksConfig {
  /** 生成前执行的命令 */
  preGenerate?: string[];

  /** 生成后执行的命令 */
  postGenerate?: string[];
}

export type GeneratorType =
  | "typescript-axios"
  | "typescript-fetch"
  | "typescript-node"
  | "java"
  | "go"
  | "python"
  | "kotlin"
  | "swift";

// ============================================================================
// AI 协调模式类型
// ============================================================================

/** AI 协调请求 - Skill 返回给 AI 的指令 */
export type AICoordinationRequest =
  | MCPQueryRequest
  | UserInputRequest
  | CompleteRequest;

/** MCP 查询请求 - 告诉 AI 需要调用 MCP 工具 */
export interface MCPQueryRequest {
  type: "mcp_query";
  step: WorkflowStep;
  query: MCPQuery;
}

/** 用户输入请求 - 告诉 AI 需要询问用户 */
export interface UserInputRequest {
  type: "user_input";
  step: WorkflowStep;
  message: string;
  options?: UserInputOptions;
}

/** 完成请求 - 告诉 AI 流程已完成 */
export interface CompleteRequest {
  type: "complete";
  step: WorkflowStep;
  message: string;
  result?: GenerationResult;
}

/** MCP 查询定义 */
export interface MCPQuery {
  /** MCP 工具名称 */
  tool: MCPToolName;

  /** 工具参数 */
  params?: Record<string, any>;

  /** 查询原因（帮助 AI 理解） */
  reason: string;

  /** 下一步骤 */
  nextStep: WorkflowStep;
}

export type MCPToolName =
  | "apifox_list_projects"
  | "apifox_search_projects"
  | "apifox_get_project_info"
  | "apifox_get_apis"
  | "apifox_get_openapi_spec";

/** 用户输入选项 */
export interface UserInputOptions {
  /** 选择项（单选） */
  choices?: Array<{
    label: string;
    value: any;
  }>;

  /** 推荐配置 */
  suggestions?: Partial<GeneratorConfig>;

  /** 默认值 */
  defaultValue?: any;
}

/** 工作流步骤 */
export type WorkflowStep =
  | "init"
  | "search_project"
  | "confirm_project"
  | "analyze_project"
  | "get_user_preferences"
  | "fetch_openapi_spec"
  | "generate_code"
  | "save_config"
  | "complete";

// ============================================================================
// MCP 数据类型（从 MCP 工具返回的数据）
// ============================================================================

/** MCP 返回的项目信息 */
export interface MCPProjectInfo {
  id: string;
  name: string;
  description?: string;
  memberCount?: number;
  apiCount?: number;
  documents?: MCPDocumentInfo[];
}

/** MCP 返回的文档信息 */
export interface MCPDocumentInfo {
  id: string;
  name: string;
  type: string;
}

/** MCP 返回的 API 信息 */
export interface MCPAPIInfo {
  id: string;
  name: string;
  path: string;
  method: string;
  description?: string;
}

/** OpenAPI 规范（从 MCP 获取） */
export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  paths: Record<string, any>;
  components?: Record<string, any>;
  [key: string]: any;
}

// ============================================================================
// 工作流上下文类型
// ============================================================================

/** 生成流程上下文 */
export interface GenerateContext {
  /** 用户请求的项目名称 */
  projectName: string;

  /** 当前工作流步骤 */
  currentStep: WorkflowStep;

  /** 从 MCP 获取的项目信息 */
  mcpProject?: MCPProjectInfo;

  /** 选中的文档 */
  selectedDocument?: MCPDocumentInfo;

  /** 用户确认的配置 */
  userConfig?: Partial<GeneratorConfig>;

  /** 从 MCP 获取的 OpenAPI 规范 */
  openAPISpec?: OpenAPISpec;

  /** 本地已有的配置（如果存在） */
  existingConfig?: APIConfig;
}

/** 更新流程上下文 */
export interface UpdateContext {
  /** API 名称 */
  apiName: string;

  /** 当前步骤 */
  currentStep: WorkflowStep;

  /** 本地配置 */
  localConfig: APIConfig;

  /** 最新的 OpenAPI 规范 */
  openAPISpec?: OpenAPISpec;
}

// ============================================================================
// 代码生成结果类型
// ============================================================================

export interface GenerationResult {
  /** 是否成功 */
  success: boolean;

  /** 输出路径 */
  outputPath: string;

  /** 生成的文件列表 */
  files: string[];

  /** 生成耗时（毫秒） */
  duration: number;

  /** 错误信息（如果失败） */
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

// ============================================================================
// Plugin 主接口
// ============================================================================

/** Plugin 主入口参数 */
export interface PluginInput {
  /** 操作类型 */
  action: "generate" | "update" | "list" | "remove";

  /** 项目/API 名称 */
  name?: string;

  /** MCP 返回的数据（AI 协调过程中传递） */
  mcpData?: MCPData;

  /** 用户输入数据（AI 协调过程中传递） */
  userData?: any;
}

/** MCP 数据包装 */
export interface MCPData {
  /** 来自哪个步骤 */
  fromStep: WorkflowStep;

  /** MCP 工具名称 */
  tool: MCPToolName;

  /** MCP 返回的结果 */
  result: any;
}

// ============================================================================
// 智能推荐类型
// ============================================================================

/** 推荐的配置 */
export interface RecommendedConfig {
  /** 推荐的生成器类型 */
  generator: GeneratorType;

  /** 推荐的输出路径 */
  outputPath: string;

  /** 推荐的配置文件（如果需要） */
  configFile?: string;

  /** 推荐原因 */
  reasons: string[];
}

// ============================================================================
// 工具函数类型
// ============================================================================

/** 配置验证结果 */
export interface ConfigValidation {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

/** OpenAPI 规范验证结果 */
export interface SpecValidation {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
  stats?: {
    pathCount: number;
    operationCount: number;
    schemaCount: number;
  };
}

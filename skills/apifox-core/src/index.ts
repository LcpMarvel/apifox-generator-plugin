/**
 * Apifox Generator Plugin - Core Utilities
 *
 * 提供核心工具函数，由 Agent 调用
 * 不再需要复杂的协调逻辑，Agent 自主完成所有流程
 */

// 导出核心模块（如果还保留）
export { SmartRecommender } from "./core/smart-recommender.js";
export { LocalConfigManager } from "./core/config-manager.js";
export { CodeGenerator } from "./core/code-generator.js";

// 导出类型
export * from "./types/index.js";

// 注意：不再导出独立接口类
// Agent 会直接调用 MCP 工具和文件操作

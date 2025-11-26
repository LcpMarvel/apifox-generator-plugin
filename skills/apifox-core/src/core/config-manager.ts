/**
 * Local Config Manager
 * 管理用户项目目录下的 apifox.config.json
 */

import { promises as fs } from "fs";
import path from "path";
import type {
  ApifoxConfig,
  APIConfig,
  GlobalConfig,
  ConfigValidation,
} from "../types/index.js";

const CONFIG_FILENAME = "apifox.config.json";
const SCHEMA_URL =
  "https://cdn.jsdelivr.net/npm/@claude/apifox-generator-plugin/schema.json";

export class LocalConfigManager {
  private configPath: string;
  private workingDir: string;

  constructor(workingDir: string = process.cwd()) {
    this.workingDir = workingDir;
    this.configPath = path.join(workingDir, CONFIG_FILENAME);
  }

  // ============================================================================
  // 读取配置
  // ============================================================================

  /**
   * 加载配置文件
   */
  async loadConfig(): Promise<ApifoxConfig | null> {
    try {
      const content = await fs.readFile(this.configPath, "utf-8");
      const config = JSON.parse(content) as ApifoxConfig;
      return config;
    } catch (error: any) {
      if (error.code === "ENOENT") {
        return null; // 文件不存在
      }
      throw new Error(`读取配置文件失败: ${error.message}`);
    }
  }

  /**
   * 获取特定 API 的配置
   */
  async getAPI(name: string): Promise<APIConfig | null> {
    const config = await this.loadConfig();
    if (!config) return null;

    return config.apis.find((api) => api.name === name) || null;
  }

  /**
   * 列出所有 API 配置
   */
  async listAPIs(): Promise<APIConfig[]> {
    const config = await this.loadConfig();
    if (!config) return [];

    return config.apis;
  }

  /**
   * 检查配置文件是否存在
   */
  async exists(): Promise<boolean> {
    try {
      await fs.access(this.configPath);
      return true;
    } catch {
      return false;
    }
  }

  // ============================================================================
  // 写入配置
  // ============================================================================

  /**
   * 保存完整配置
   */
  async saveConfig(config: ApifoxConfig): Promise<void> {
    // 添加 schema 引用
    const configWithSchema = {
      $schema: SCHEMA_URL,
      ...config,
    };

    const content = JSON.stringify(configWithSchema, null, 2);
    await fs.writeFile(this.configPath, content, "utf-8");
  }

  /**
   * 添加新的 API 配置
   */
  async addAPI(apiConfig: APIConfig): Promise<void> {
    let config = await this.loadConfig();

    if (!config) {
      // 创建新配置
      config = {
        $schema: SCHEMA_URL,
        apis: [apiConfig],
      };
    } else {
      // 检查是否已存在
      const existingIndex = config.apis.findIndex(
        (api) => api.name === apiConfig.name,
      );

      if (existingIndex >= 0) {
        // 替换现有配置
        config.apis[existingIndex] = apiConfig;
      } else {
        // 添加新配置
        config.apis.push(apiConfig);
      }
    }

    await this.saveConfig(config);
  }

  /**
   * 更新已有的 API 配置
   */
  async updateAPI(name: string, updates: Partial<APIConfig>): Promise<boolean> {
    const config = await this.loadConfig();
    if (!config) return false;

    const apiIndex = config.apis.findIndex((api) => api.name === name);
    if (apiIndex < 0) return false;

    // 合并更新
    config.apis[apiIndex] = {
      ...config.apis[apiIndex],
      ...updates,
      apifox: {
        ...config.apis[apiIndex].apifox,
        ...(updates.apifox || {}),
      },
      generator: {
        ...config.apis[apiIndex].generator,
        ...(updates.generator || {}),
      },
    };

    await this.saveConfig(config);
    return true;
  }

  /**
   * 删除 API 配置
   */
  async removeAPI(name: string): Promise<boolean> {
    const config = await this.loadConfig();
    if (!config) return false;

    const originalLength = config.apis.length;
    config.apis = config.apis.filter((api) => api.name !== name);

    if (config.apis.length === originalLength) {
      return false; // 未找到
    }

    await this.saveConfig(config);
    return true;
  }

  /**
   * 更新全局配置
   */
  async updateGlobalConfig(globalConfig: Partial<GlobalConfig>): Promise<void> {
    const config = await this.loadConfig();

    if (!config) {
      await this.saveConfig({
        global: globalConfig as GlobalConfig,
        apis: [],
      });
    } else {
      config.global = {
        ...config.global,
        ...globalConfig,
      };
      await this.saveConfig(config);
    }
  }

  // ============================================================================
  // 验证配置
  // ============================================================================

  /**
   * 验证配置文件格式
   */
  async validateConfig(config?: ApifoxConfig): Promise<ConfigValidation> {
    const targetConfig = config || (await this.loadConfig());

    if (!targetConfig) {
      return {
        valid: false,
        errors: ["配置文件不存在"],
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证基本结构
    if (!targetConfig.apis) {
      errors.push("缺少 apis 字段");
    } else if (!Array.isArray(targetConfig.apis)) {
      errors.push("apis 字段必须是数组");
    } else {
      // 验证每个 API 配置
      targetConfig.apis.forEach((api, index) => {
        if (!api.name) {
          errors.push(`apis[${index}]: 缺少 name 字段`);
        }
        if (!api.apifox?.projectId) {
          errors.push(`apis[${index}]: 缺少 apifox.projectId 字段`);
        }
        if (!api.apifox?.documentId) {
          errors.push(`apis[${index}]: 缺少 apifox.documentId 字段`);
        }
        if (!api.generator?.type) {
          errors.push(`apis[${index}]: 缺少 generator.type 字段`);
        }
        if (!api.generator?.outputPath) {
          errors.push(`apis[${index}]: 缺少 generator.outputPath 字段`);
        }
      });

      // 检查重复名称
      const names = targetConfig.apis.map((api) => api.name);
      const duplicates = names.filter(
        (name, index) => names.indexOf(name) !== index,
      );
      if (duplicates.length > 0) {
        errors.push(`发现重复的 API 名称: ${duplicates.join(", ")}`);
      }
    }

    // 验证全局配置
    if (targetConfig.global) {
      if (targetConfig.global.hooks) {
        if (
          targetConfig.global.hooks.preGenerate &&
          !Array.isArray(targetConfig.global.hooks.preGenerate)
        ) {
          errors.push("global.hooks.preGenerate 必须是数组");
        }
        if (
          targetConfig.global.hooks.postGenerate &&
          !Array.isArray(targetConfig.global.hooks.postGenerate)
        ) {
          errors.push("global.hooks.postGenerate 必须是数组");
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  // ============================================================================
  // 工具方法
  // ============================================================================

  /**
   * 获取配置文件路径
   */
  getConfigPath(): string {
    return this.configPath;
  }

  /**
   * 获取工作目录
   */
  getWorkingDir(): string {
    return this.workingDir;
  }

  /**
   * 初始化配置文件（创建示例）
   */
  async initConfig(): Promise<void> {
    const exists = await this.exists();
    if (exists) {
      throw new Error("配置文件已存在");
    }

    const initialConfig: ApifoxConfig = {
      $schema: SCHEMA_URL,
      global: {
        defaultGenerator: "typescript-axios",
        outputBaseDir: "src/api",
      },
      apis: [],
    };

    await this.saveConfig(initialConfig);
  }

  /**
   * 获取全局配置
   */
  async getGlobalConfig(): Promise<GlobalConfig | null> {
    const config = await this.loadConfig();
    return config?.global || null;
  }
}

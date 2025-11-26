/**
 * Smart Recommender
 * 基于项目信息智能推荐生成器配置
 */

import type {
  GeneratorType,
  RecommendedConfig,
  MCPProjectInfo,
  MCPAPIInfo,
  OpenAPISpec,
} from '../types/index.js';

export class SmartRecommender {
  /**
   * 推荐完整配置
   */
  recommend(
    projectName: string,
    projectInfo: MCPProjectInfo,
    apis?: MCPAPIInfo[],
    spec?: OpenAPISpec
  ): RecommendedConfig {
    const generator = this.recommendGenerator(apis, spec);
    const outputPath = this.recommendOutputPath(projectName);
    const configFile = this.recommendConfigFile(generator);
    const reasons = this.buildReasons(projectName, projectInfo, apis, generator);

    return {
      generator,
      outputPath,
      configFile,
      reasons,
    };
  }

  /**
   * 推荐生成器类型
   */
  private recommendGenerator(
    apis?: MCPAPIInfo[],
    spec?: OpenAPISpec
  ): GeneratorType {
    // 分析 OpenAPI 规范
    if (spec) {
      // 检查是否有 WebSocket
      const hasWebSocket = this.hasWebSocketAPIs(spec);
      if (hasWebSocket) {
        return 'typescript-axios'; // Axios 支持更好的拦截器
      }

      // 检查是否有文件上传
      const hasFileUpload = this.hasFileUploadAPIs(spec);
      if (hasFileUpload) {
        return 'typescript-axios'; // Axios 对文件上传支持更好
      }

      // 检查是否有大量的并发请求需求
      const operationCount = this.countOperations(spec);
      if (operationCount > 50) {
        return 'typescript-axios'; // 大项目推荐 Axios
      }
    }

    // 分析 API 列表
    if (apis && apis.length > 0) {
      // 检查 HTTP 方法分布
      const methods = apis.map(api => api.method.toUpperCase());
      const hasComplexMethods = methods.some(m =>
        ['PATCH', 'DELETE', 'OPTIONS'].includes(m)
      );

      if (hasComplexMethods) {
        return 'typescript-axios';
      }
    }

    // 默认推荐
    return 'typescript-axios';
  }

  /**
   * 推荐输出路径
   */
  private recommendOutputPath(projectName: string): string {
    // 标准化项目名称
    const cleanName = projectName
      .toLowerCase()
      .replace(/[-_]api$/i, '')        // 移除后缀 -api
      .replace(/[-_]service$/i, '')    // 移除后缀 -service
      .replace(/[-_]client$/i, '')     // 移除后缀 -client
      .replace(/\s+/g, '-')            // 空格转换为 -
      .replace(/[^a-z0-9-]/g, '');     // 移除特殊字符

    return `src/api/${cleanName}`;
  }

  /**
   * 推荐配置文件
   */
  private recommendConfigFile(_generator: GeneratorType): string | undefined {
    // 配置内容通过 generateConfigFileContent() 动态生成，不再使用静态配置文件
    return undefined;
  }

  /**
   * 构建推荐理由
   */
  private buildReasons(
    projectName: string,
    projectInfo: MCPProjectInfo,
    apis: MCPAPIInfo[] | undefined,
    generator: GeneratorType
  ): string[] {
    const reasons: string[] = [];

    // API 数量
    const apiCount = projectInfo.apiCount || apis?.length || 0;
    if (apiCount > 0) {
      reasons.push(`项目包含 ${apiCount} 个 API 端点`);
    }

    // 生成器选择理由
    if (generator === 'typescript-axios') {
      reasons.push('推荐 TypeScript + Axios：类型安全，支持拦截器，适合大多数场景');
    } else if (generator === 'typescript-fetch') {
      reasons.push('推荐 TypeScript + Fetch：轻量级，适合简单项目');
    }

    // 输出路径理由
    reasons.push(`输出路径基于项目名称自动生成`);

    return reasons;
  }

  // ============================================================================
  // OpenAPI 规范分析
  // ============================================================================

  /**
   * 检查是否有 WebSocket APIs
   */
  private hasWebSocketAPIs(spec: OpenAPISpec): boolean {
    if (!spec.paths) return false;

    for (const path in spec.paths) {
      const pathItem = spec.paths[path];
      for (const method in pathItem) {
        const operation = pathItem[method];
        // 检查是否有 WebSocket 相关的标记
        if (operation.tags?.some((tag: string) =>
          tag.toLowerCase().includes('websocket') ||
          tag.toLowerCase().includes('ws')
        )) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * 检查是否有文件上传 APIs
   */
  private hasFileUploadAPIs(spec: OpenAPISpec): boolean {
    if (!spec.paths) return false;

    for (const path in spec.paths) {
      const pathItem = spec.paths[path];
      for (const method in pathItem) {
        const operation = pathItem[method];

        // 检查 requestBody 是否包含文件上传
        if (operation.requestBody?.content?.['multipart/form-data']) {
          return true;
        }

        // 检查参数中是否有 file 类型
        if (operation.parameters) {
          const hasFile = operation.parameters.some((param: any) =>
            param.schema?.type === 'string' &&
            param.schema?.format === 'binary'
          );
          if (hasFile) return true;
        }
      }
    }

    return false;
  }

  /**
   * 统计操作数量
   */
  private countOperations(spec: OpenAPISpec): number {
    if (!spec.paths) return 0;

    let count = 0;
    for (const path in spec.paths) {
      const pathItem = spec.paths[path];
      const methods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];
      for (const method of methods) {
        if (pathItem[method]) count++;
      }
    }

    return count;
  }

  // ============================================================================
  // 配置文件内容生成
  // ============================================================================

  /**
   * 生成推荐的 OpenAPI Generator 配置文件内容
   */
  generateConfigFileContent(generator: GeneratorType): Record<string, any> {
    switch (generator) {
      case 'typescript-axios':
        return {
          supportsES6: true,
          withSeparateModelsAndApi: true,
          modelPackage: 'models',
          apiPackage: 'apis',
          useSingleRequestParameter: true,
          removeOperationIdPrefix: true,
          nullSafeAdditionalProps: true,
          stringEnums: false,
          enumNameSuffix: 'Enum',
          modelPropertyNaming: 'camelCase',
          paramNaming: 'camelCase',
          withNullable: true,
          sortParamsByRequiredFlag: true,
        };

      case 'typescript-fetch':
        return {
          supportsES6: true,
          useSingleRequestParameter: true,
          modelPropertyNaming: 'camelCase',
          paramNaming: 'camelCase',
        };

      case 'typescript-node':
        return {
          supportsES6: true,
          npmName: '@myorg/api-client',
          npmVersion: '1.0.0',
        };

      default:
        return {};
    }
  }
}

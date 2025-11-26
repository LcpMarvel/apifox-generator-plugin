/**
 * Code Generator
 * 使用 OpenAPI Generator 生成代码（基于 Docker）
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import { existsSync } from 'fs';
import { join, relative } from 'path';
import type {
  GeneratorConfig,
  GenerationResult,
  OpenAPISpec,
  SpecValidation,
} from '../types/index.js';

const execAsync = promisify(exec);

export class CodeGenerator {
  /**
   * 检查 Docker 是否可用
   */
  async checkDocker(): Promise<{ available: boolean; message?: string }> {
    try {
      await execAsync('docker --version');

      // 检查 Docker daemon 是否运行
      try {
        await execAsync('docker ps');
        return { available: true };
      } catch (error) {
        return {
          available: false,
          message:
            'Docker daemon 未运行\n\n' +
            '建议：\n' +
            '  1. 启动 Docker Desktop\n' +
            '  2. macOS: open -a Docker\n' +
            '  3. 确认运行: docker ps',
        };
      }
    } catch (error) {
      return {
        available: false,
        message:
          'Docker 未安装\n\n' +
          '建议：\n' +
          '  1. 安装 Docker Desktop: https://www.docker.com/products/docker-desktop\n' +
          '  2. 或使用 Homebrew: brew install --cask docker',
      };
    }
  }

  /**
   * 生成客户端代码
   */
  async generate(
    spec: OpenAPISpec,
    config: GeneratorConfig,
    workingDir: string
  ): Promise<GenerationResult> {
    const startTime = Date.now();

    try {
      // 1. 检查 Docker
      const dockerCheck = await this.checkDocker();
      if (!dockerCheck.available) {
        throw new Error(dockerCheck.message);
      }

      // 2. 验证规范
      const validation = await this.validateSpec(spec);
      if (!validation.valid) {
        throw new Error(`OpenAPI 规范无效:\n${validation.errors?.join('\n')}`);
      }

      // 3. 写入临时 spec 文件
      const tempSpecPath = join(workingDir, '.temp-openapi-spec.json');
      await fs.writeFile(tempSpecPath, JSON.stringify(spec, null, 2), 'utf-8');

      // 4. 构建 Docker 命令
      const dockerCommand = this.buildDockerCommand(workingDir, config);

      console.log(`\n⚙️  执行 OpenAPI Generator...\n`);

      // 5. 执行生成
      const { stdout, stderr } = await execAsync(dockerCommand, {
        cwd: workingDir,
        maxBuffer: 10 * 1024 * 1024, // 10MB
      });

      // 输出日志
      if (stdout) {
        console.log(stdout);
      }
      if (stderr && !stderr.includes('Downloading')) {
        console.warn('⚠️  Warnings:', stderr);
      }

      // 6. 清理临时文件
      try {
        await fs.unlink(tempSpecPath);
      } catch (error) {
        console.warn('清理临时文件失败:', error);
      }

      // 7. 收集生成的文件
      const absoluteOutputPath = join(workingDir, config.outputPath);
      const files = await this.collectFiles(absoluteOutputPath);

      return {
        success: true,
        outputPath: config.outputPath,
        files,
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        success: false,
        outputPath: config.outputPath,
        files: [],
        duration: Date.now() - startTime,
        error: {
          message: error.message,
          code: error.code,
        },
      };
    }
  }

  /**
   * 验证 OpenAPI 规范
   */
  async validateSpec(spec: OpenAPISpec): Promise<SpecValidation> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 检查基本字段
    if (!spec.openapi && !spec.swagger) {
      errors.push('缺少 openapi 或 swagger 版本字段');
    }

    if (!spec.info) {
      errors.push('缺少 info 字段');
    }

    if (!spec.paths || Object.keys(spec.paths).length === 0) {
      errors.push('没有定义任何 API 路径');
    }

    // 统计信息
    const stats = this.calculateStats(spec);

    if (stats.operationCount === 0) {
      warnings.push('没有定义任何 API 操作');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      stats,
    };
  }

  // ============================================================================
  // 私有方法
  // ============================================================================

  /**
   * 构建 Docker 命令
   */
  private buildDockerCommand(workingDir: string, config: GeneratorConfig): string {
    const parts = [
      'docker run --rm',
      `-v "${workingDir}:/local"`,
      'openapitools/openapi-generator-cli:latest generate',
      '-i /local/.temp-openapi-spec.json',
      `-g ${config.type}`,
      `-o /local/${config.outputPath}`,
      '--skip-validate-spec',
    ];

    // 添加配置文件
    if (config.configFile) {
      const configPath = join(workingDir, config.configFile);
      if (existsSync(configPath)) {
        parts.push(`-c /local/${config.configFile}`);
      }
    }

    return parts.join(' ');
  }

  /**
   * 收集生成的文件
   */
  private async collectFiles(dir: string): Promise<string[]> {
    const files: string[] = [];

    if (!existsSync(dir)) {
      return files;
    }

    const traverse = async (currentDir: string) => {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(currentDir, entry.name);

        if (entry.isDirectory()) {
          await traverse(fullPath);
        } else {
          files.push(relative(dir, fullPath));
        }
      }
    };

    await traverse(dir);
    return files;
  }

  /**
   * 计算规范统计信息
   */
  private calculateStats(spec: OpenAPISpec): {
    pathCount: number;
    operationCount: number;
    schemaCount: number;
  } {
    let pathCount = 0;
    let operationCount = 0;
    let schemaCount = 0;

    // 统计路径和操作
    if (spec.paths) {
      pathCount = Object.keys(spec.paths).length;

      for (const path in spec.paths) {
        const pathItem = spec.paths[path];
        const methods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];

        for (const method of methods) {
          if (pathItem[method]) {
            operationCount++;
          }
        }
      }
    }

    // 统计 schema
    if (spec.components?.schemas) {
      schemaCount = Object.keys(spec.components.schemas).length;
    }

    return { pathCount, operationCount, schemaCount };
  }
}

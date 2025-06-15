import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { SparcConfig } from '../types';
import { DEFAULT_CONFIG } from '../constants';
import { Logger } from '../utils/logger';

// Zod schemas for validation
const PhaseConfigSchema = z.object({
  enabled: z.boolean(),
  templates: z.record(z.string()).optional(),
  research: z.object({
    enabled: z.boolean(),
    depth: z.enum(['basic', 'standard', 'comprehensive']),
    sources: z.array(z.string()),
    maxSearches: z.number()
  }).optional(),
  requirements: z.object({
    functional: z.boolean(),
    nonFunctional: z.boolean(),
    constraints: z.boolean(),
    acceptance: z.boolean()
  }).optional(),
  validation: z.object({
    logic: z.boolean().optional(),
    complexity: z.boolean().optional(),
    patterns: z.boolean().optional(),
    tests: z.boolean().optional(),
    linting: z.boolean().optional(),
    typeCheck: z.boolean().optional(),
    security: z.boolean().optional(),
    performance: z.boolean().optional()
  }).optional(),
  documentation: z.object({
    code: z.boolean().optional(),
    api: z.boolean().optional(),
    user: z.boolean().optional(),
    deployment: z.boolean().optional(),
    decisions: z.boolean().optional(),
    tradeoffs: z.boolean().optional(),
    alternatives: z.boolean().optional()
  }).optional(),
  iterations: z.number().optional(),
  feedback: z.object({
    automated: z.boolean(),
    manual: z.boolean(),
    ai: z.boolean()
  }).optional(),
  optimization: z.object({
    performance: z.boolean(),
    security: z.boolean(),
    scalability: z.boolean(),
    maintainability: z.boolean()
  }).optional()
});

const SparcConfigSchema = z.object({
  project: z.object({
    name: z.string(),
    version: z.string(),
    description: z.string(),
    repository: z.string().optional(),
    license: z.string().optional()
  }),
  
  sparc: z.object({
    version: z.string(),
    mode: z.enum(['basic', 'advanced']),
    phases: z.object({
      specification: PhaseConfigSchema,
      pseudocode: PhaseConfigSchema,
      architecture: PhaseConfigSchema,
      refinement: PhaseConfigSchema,
      completion: PhaseConfigSchema
    }),
    automation: z.object({
      enabled: z.boolean(),
      parallelTasks: z.boolean(),
      maxConcurrency: z.number(),
      retryPolicy: z.object({
        attempts: z.number(),
        backoff: z.enum(['linear', 'exponential']),
        maxDelay: z.number()
      }),
      monitoring: z.object({
        progress: z.boolean(),
        metrics: z.boolean(),
        logging: z.enum(['quiet', 'normal', 'verbose'])
      })
    }),
    testDrivenDevelopment: z.object({
      enabled: z.boolean(),
      coverage: z.object({
        target: z.number().min(0).max(100),
        branches: z.number().min(0).max(100),
        functions: z.number().min(0).max(100),
        lines: z.number().min(0).max(100),
        statements: z.number().min(0).max(100)
      }),
      types: z.object({
        unit: z.boolean(),
        integration: z.boolean(),
        e2e: z.boolean(),
        performance: z.boolean(),
        security: z.boolean()
      }),
      frameworks: z.object({
        unit: z.string(),
        e2e: z.string(),
        performance: z.string(),
        security: z.string()
      })
    })
  }),
  
  firebase: z.object({
    projectId: z.string(),
    adminProjectId: z.string().optional(),
    emulators: z.object({
      enabled: z.boolean(),
      auth: z.object({ port: z.number() }).optional(),
      firestore: z.object({ port: z.number() }).optional(),
      storage: z.object({ port: z.number() }).optional(),
      ui: z.object({ port: z.number() }).optional()
    }).optional(),
    security: z.object({
      rules: z.object({
        firestore: z.string().optional(),
        storage: z.string().optional()
      }).optional(),
      indexes: z.string().optional()
    }).optional()
  }).optional(),
  
  agents: z.object({
    coordination: z.object({
      enabled: z.boolean(),
      path: z.string(),
      multiAgent: z.boolean(),
      roles: z.record(z.object({
        priority: z.enum(['low', 'medium', 'high', 'critical']),
        vetoRights: z.boolean().optional(),
        responsibilities: z.array(z.string())
      }))
    })
  }).optional(),
  
  features: z.record(z.any()).optional(),
  
  development: z.object({
    environment: z.object({
      node: z.string(),
      npm: z.string(),
      typescript: z.string()
    }),
    conventions: z.object({
      naming: z.string(),
      files: z.string(),
      components: z.string(),
      constants: z.string()
    }),
    quality: z.object({
      linting: z.object({
        enabled: z.boolean(),
        config: z.string(),
        autoFix: z.boolean().optional()
      }),
      formatting: z.object({
        enabled: z.boolean(),
        config: z.string(),
        onSave: z.boolean().optional()
      }),
      typeChecking: z.object({
        strict: z.boolean(),
        noImplicitAny: z.boolean(),
        strictNullChecks: z.boolean()
      })
    })
  }).optional(),
  
  deployment: z.record(z.any()).optional(),
  monitoring: z.record(z.any()).optional(),
  security: z.record(z.any()).optional(),
  performance: z.record(z.any()).optional(),
  workflows: z.record(z.any()).optional(),
  customCommands: z.record(z.any()).optional()
});

export class ConfigLoader {
  private logger: Logger;
  private configCache: Map<string, SparcConfig> = new Map();

  constructor() {
    this.logger = new Logger('ConfigLoader');
  }

  async load(configPath: string): Promise<SparcConfig> {
    // Check cache first
    if (this.configCache.has(configPath)) {
      this.logger.debug(`Loading config from cache: ${configPath}`);
      return this.configCache.get(configPath)!;
    }

    try {
      // Resolve absolute path
      const absolutePath = path.isAbsolute(configPath) 
        ? configPath 
        : path.join(process.cwd(), configPath);

      this.logger.info(`Loading config from: ${absolutePath}`);

      // Read config file
      const configContent = await fs.readFile(absolutePath, 'utf-8');
      const rawConfig = JSON.parse(configContent);

      // Merge with defaults
      const mergedConfig = this.mergeWithDefaults(rawConfig);

      // Validate with Zod
      const validatedConfig = SparcConfigSchema.parse(mergedConfig);

      // Cache the config
      this.configCache.set(configPath, validatedConfig);

      this.logger.info('Config loaded and validated successfully');
      return validatedConfig;

    } catch (error) {
      if (error instanceof z.ZodError) {
        this.logger.error('Config validation failed', error.errors);
        throw new Error(`Invalid config: ${this.formatZodError(error)}`);
      }
      
      if (error instanceof Error && error.message.includes('ENOENT')) {
        this.logger.error(`Config file not found: ${configPath}`);
        throw new Error(`Config file not found: ${configPath}`);
      }

      this.logger.error('Failed to load config', error);
      throw error;
    }
  }

  async validate(config: any): Promise<SparcConfig> {
    try {
      return SparcConfigSchema.parse(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid config: ${this.formatZodError(error)}`);
      }
      throw error;
    }
  }

  async save(configPath: string, config: SparcConfig): Promise<void> {
    try {
      // Validate before saving
      await this.validate(config);

      const absolutePath = path.isAbsolute(configPath) 
        ? configPath 
        : path.join(process.cwd(), configPath);

      // Ensure directory exists
      await fs.mkdir(path.dirname(absolutePath), { recursive: true });

      // Write config
      await fs.writeFile(
        absolutePath,
        JSON.stringify(config, null, 2),
        'utf-8'
      );

      // Update cache
      this.configCache.set(configPath, config);

      this.logger.info(`Config saved to: ${absolutePath}`);
    } catch (error) {
      this.logger.error('Failed to save config', error);
      throw error;
    }
  }

  private mergeWithDefaults(config: any): any {
    return {
      ...config,
      sparc: {
        ...DEFAULT_CONFIG.sparc,
        ...config.sparc,
        automation: {
          ...DEFAULT_CONFIG.sparc.automation,
          ...config.sparc?.automation,
          retryPolicy: {
            ...DEFAULT_CONFIG.sparc.automation.retryPolicy,
            ...config.sparc?.automation?.retryPolicy
          },
          monitoring: {
            ...DEFAULT_CONFIG.sparc.automation.monitoring,
            ...config.sparc?.automation?.monitoring
          }
        },
        testDrivenDevelopment: {
          ...DEFAULT_CONFIG.sparc.testDrivenDevelopment,
          ...config.sparc?.testDrivenDevelopment,
          coverage: {
            ...DEFAULT_CONFIG.sparc.testDrivenDevelopment.coverage,
            ...config.sparc?.testDrivenDevelopment?.coverage
          }
        },
        phases: config.sparc?.phases || {}
      }
    };
  }

  private formatZodError(error: z.ZodError): string {
    const issues = error.errors.map(issue => {
      const path = issue.path.join('.');
      return `  - ${path}: ${issue.message}`;
    });
    
    return `\n${issues.join('\n')}`;
  }

  // Utility methods
  clearCache(): void {
    this.configCache.clear();
    this.logger.debug('Config cache cleared');
  }

  getCachedConfigs(): string[] {
    return Array.from(this.configCache.keys());
  }

  async reloadConfig(configPath: string): Promise<SparcConfig> {
    this.configCache.delete(configPath);
    return this.load(configPath);
  }

  // Environment-specific config loading
  async loadForEnvironment(
    baseConfigPath: string,
    environment: string
  ): Promise<SparcConfig> {
    const baseConfig = await this.load(baseConfigPath);
    
    // Try to load environment-specific config
    const envConfigPath = baseConfigPath.replace(
      /\.json$/,
      `.${environment}.json`
    );

    try {
      const envConfig = await this.load(envConfigPath);
      
      // Deep merge configs
      return this.deepMerge(baseConfig, envConfig);
    } catch (error) {
      // Environment-specific config is optional
      this.logger.debug(`No environment config found for: ${environment}`);
      return baseConfig;
    }
  }

  private deepMerge(target: any, source: any): any {
    const output = { ...target };
    
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this.deepMerge(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    
    return output;
  }

  private isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item);
  }
}
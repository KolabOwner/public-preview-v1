/**
 * Configuration management for cloud functions
 * Environment-specific settings and feature flags
 */

export interface FunctionConfig {
  projectId: string;
  storageBucket: string;
  region: string;
  enableEnterprise: boolean;
  enableValidation: boolean;
  enableDLP: boolean;
  enableAuditLogging: boolean;
}

export const FUNCTION_CONFIGS = {
  api: {
    memory: '512MiB' as const,
    timeoutSeconds: 60,
    maxInstances: 100,
    concurrency: 50
  },
  worker: {
    memory: '2GiB' as const,
    timeoutSeconds: 540,
    maxInstances: 10,
    concurrency: 1
  },
  trigger: {
    memory: '256MiB' as const,
    timeoutSeconds: 60,
    maxInstances: 50,
    concurrency: 10
  }
} as const;

export function getConfig(): FunctionConfig {
  const env = process.env.NODE_ENV || 'development';
  
  const configs = {
    development: {
      projectId: process.env.FIREBASE_PROJECT_ID || 'dev-project',
      storageBucket: process.env.STORAGE_BUCKET || 'dev-bucket',
      region: 'us-central1',
      enableEnterprise: false,
      enableValidation: true,
      enableDLP: false,
      enableAuditLogging: false
    },
    staging: {
      projectId: process.env.FIREBASE_PROJECT_ID || 'staging-project',
      storageBucket: process.env.STORAGE_BUCKET || 'staging-bucket',
      region: 'us-central1',
      enableEnterprise: true,
      enableValidation: true,
      enableDLP: true,
      enableAuditLogging: true
    },
    production: {
      projectId: process.env.FIREBASE_PROJECT_ID || 'prod-project',
      storageBucket: process.env.STORAGE_BUCKET || 'prod-bucket',
      region: 'us-central1',
      enableEnterprise: true,
      enableValidation: true,
      enableDLP: true,
      enableAuditLogging: true
    }
  };
  
  return configs[env as keyof typeof configs] || configs.development;
}
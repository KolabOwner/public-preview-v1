export interface SparcConfig {
  project: {
    name: string;
    version: string;
    description: string;
    repository?: string;
    license?: string;
  };
  
  sparc: {
    version: string;
    mode: 'basic' | 'advanced';
    phases: {
      specification: PhaseConfig;
      pseudocode: PhaseConfig;
      architecture: PhaseConfig;
      refinement: PhaseConfig;
      completion: PhaseConfig;
    };
    automation: AutomationConfig;
    testDrivenDevelopment: TDDConfig;
  };
  
  firebase?: FirebaseConfig;
  agents?: AgentConfig;
  features?: Record<string, any>;
  development?: DevelopmentConfig;
  deployment?: DeploymentConfig;
  monitoring?: MonitoringConfig;
  security?: SecurityConfig;
  performance?: PerformanceConfig;
  workflows?: WorkflowConfig;
}

export interface PhaseConfig {
  enabled: boolean;
  templates?: Record<string, string>;
  research?: ResearchConfig;
  requirements?: RequirementsConfig;
  validation?: ValidationConfig;
  documentation?: DocumentationConfig;
  iterations?: number;
  feedback?: FeedbackConfig;
  optimization?: OptimizationConfig;
}

export interface ResearchConfig {
  enabled: boolean;
  depth: 'basic' | 'standard' | 'comprehensive';
  sources: string[];
  maxSearches: number;
}

export interface RequirementsConfig {
  functional: boolean;
  nonFunctional: boolean;
  constraints: boolean;
  acceptance: boolean;
}

export interface ValidationConfig {
  logic?: boolean;
  complexity?: boolean;
  patterns?: boolean;
  tests?: boolean;
  linting?: boolean;
  typeCheck?: boolean;
  security?: boolean;
  performance?: boolean;
}

export interface DocumentationConfig {
  code?: boolean;
  api?: boolean;
  user?: boolean;
  deployment?: boolean;
  decisions?: boolean;
  tradeoffs?: boolean;
  alternatives?: boolean;
}

export interface FeedbackConfig {
  automated: boolean;
  manual: boolean;
  ai: boolean;
}

export interface OptimizationConfig {
  performance: boolean;
  security: boolean;
  scalability: boolean;
  maintainability: boolean;
}

export interface AutomationConfig {
  enabled: boolean;
  parallelTasks: boolean;
  maxConcurrency: number;
  retryPolicy: {
    attempts: number;
    backoff: 'linear' | 'exponential';
    maxDelay: number;
  };
  monitoring: {
    progress: boolean;
    metrics: boolean;
    logging: 'quiet' | 'normal' | 'verbose';
  };
}

export interface TDDConfig {
  enabled: boolean;
  coverage: {
    target: number;
    branches: number;
    functions: number;
    lines: number;
    statements: number;
  };
  types: {
    unit: boolean;
    integration: boolean;
    e2e: boolean;
    performance: boolean;
    security: boolean;
  };
  frameworks: {
    unit: string;
    e2e: string;
    performance: string;
    security: string;
  };
}

export interface FirebaseConfig {
  projectId: string;
  adminProjectId?: string;
  emulators?: {
    enabled: boolean;
    auth?: { port: number };
    firestore?: { port: number };
    storage?: { port: number };
    ui?: { port: number };
  };
  security?: {
    rules?: {
      firestore?: string;
      storage?: string;
    };
    indexes?: string;
  };
}

export interface AgentConfig {
  coordination: {
    enabled: boolean;
    path: string;
    multiAgent: boolean;
    roles: Record<string, AgentRoleConfig>;
  };
}

export interface AgentRoleConfig {
  priority: 'low' | 'medium' | 'high' | 'critical';
  vetoRights?: boolean;
  responsibilities: string[];
}

export interface DevelopmentConfig {
  environment: {
    node: string;
    npm: string;
    typescript: string;
  };
  conventions: {
    naming: string;
    files: string;
    components: string;
    constants: string;
  };
  quality: {
    linting: QualityToolConfig;
    formatting: QualityToolConfig;
    typeChecking: TypeCheckConfig;
  };
}

export interface QualityToolConfig {
  enabled: boolean;
  config: string;
  autoFix?: boolean;
  onSave?: boolean;
}

export interface TypeCheckConfig {
  strict: boolean;
  noImplicitAny: boolean;
  strictNullChecks: boolean;
}

export interface DeploymentConfig {
  environments: Record<string, EnvironmentConfig>;
  vercel?: VercelConfig;
}

export interface EnvironmentConfig {
  url: string;
  firebase?: string;
  features: Record<string, boolean>;
}

export interface VercelConfig {
  enabled: boolean;
  config: string;
  regions: string[];
  functions: {
    maxDuration: number;
    memory: number;
  };
}

export interface MonitoringConfig {
  logging: LoggingConfig;
  metrics: MetricsConfig;
  alerts: AlertConfig;
}

export interface LoggingConfig {
  level: string;
  destinations: string[];
  rotation?: {
    enabled: boolean;
    maxSize: string;
    maxFiles: number;
  };
}

export interface MetricsConfig {
  collection: boolean;
  interval: number;
  retention: string;
}

export interface AlertConfig {
  enabled: boolean;
  channels: string[];
  rules: Record<string, AlertRule>;
}

export interface AlertRule {
  threshold: number;
  window: string;
}

export interface SecurityConfig {
  authentication: AuthConfig;
  authorization: AuthzConfig;
  encryption: EncryptionConfig;
  compliance: ComplianceConfig;
  scanning: ScanningConfig;
}

export interface AuthConfig {
  providers: string[];
  mfa: boolean;
  sessionTimeout: string;
}

export interface AuthzConfig {
  model: string;
  roles: string[];
  permissions: Record<string, string[]>;
}

export interface EncryptionConfig {
  atRest: boolean;
  inTransit: boolean;
  algorithm: string;
}

export interface ComplianceConfig {
  gdpr: boolean;
  ccpa: boolean;
  soc2: boolean;
}

export interface ScanningConfig {
  dependencies: boolean;
  code: boolean;
  containers: boolean;
  frequency: string;
}

export interface PerformanceConfig {
  targets: PerformanceTargets;
  optimization: PerformanceOptimization;
  benchmarking: BenchmarkingConfig;
}

export interface PerformanceTargets {
  ttfb: number;
  fcp: number;
  lcp: number;
  cls: number;
  fid: number;
}

export interface PerformanceOptimization {
  bundleAnalysis: boolean;
  codeSpitting: boolean;
  lazyLoading: boolean;
  caching: {
    browser: boolean;
    cdn: boolean;
    redis: boolean;
  };
}

export interface BenchmarkingConfig {
  enabled: boolean;
  frequency: string;
  lighthouse: boolean;
  webVitals: boolean;
}

export interface WorkflowConfig {
  [key: string]: {
    steps: string[];
    automation: boolean;
    approval?: string[];
    fastTrack?: boolean;
  };
}

export interface SparcOptions {
  projectName: string;
  readmePath: string;
  mode?: 'full' | 'backend-only' | 'frontend-only' | 'api-only';
  options?: {
    parallel?: boolean;
    testCoverage?: number;
    commitFrequency?: 'phase' | 'feature' | 'manual';
    skipResearch?: boolean;
    skipTests?: boolean;
    verbose?: boolean;
    dryRun?: boolean;
  };
}

export interface SparcResult {
  success: boolean;
  phases: PhaseResult[];
  metrics: ExecutionMetrics;
  artifacts: Record<string, any>;
  errors?: Error[];
}

export interface PhaseResult {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  tasks: TaskResult[];
  artifacts?: Record<string, any>;
  error?: Error;
}

export interface TaskResult {
  id: string;
  name: string;
  agent?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  result?: any;
  error?: Error;
}

export interface ExecutionMetrics {
  totalDuration: number;
  phaseMetrics: Record<string, PhaseMetrics>;
  agentMetrics: Record<string, AgentMetrics>;
  resourceUsage: ResourceMetrics;
}

export interface PhaseMetrics {
  duration: number;
  taskCount: number;
  successRate: number;
  retryCount: number;
}

export interface AgentMetrics {
  tasksExecuted: number;
  successRate: number;
  averageExecutionTime: number;
  decisionsPerformed: number;
}

export interface ResourceMetrics {
  apiCalls: number;
  tokensUsed: number;
  cacheHits: number;
  cacheMisses: number;
}

export interface AIProvider {
  name: string;
  execute(prompt: string, options?: AIExecutionOptions): Promise<AIResponse>;
  validateConfig(): Promise<boolean>;
}

export interface AIExecutionOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  tools?: string[];
  timeout?: number;
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: Record<string, any>;
}

export interface Agent {
  role: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  vetoRights: boolean;
  responsibilities: string[];
  
  execute(task: AgentTask): Promise<AgentTaskResult>;
  review(artifact: any): Promise<ReviewResult>;
  collaborate(message: AgentMessage): Promise<AgentResponse>;
}

export interface AgentTask {
  id: string;
  type: string;
  phase: string;
  description: string;
  input: any;
  dependencies?: string[];
  priority?: number;
}

export interface AgentTaskResult {
  taskId: string;
  success: boolean;
  output?: any;
  decisions?: Decision[];
  recommendations?: string[];
  error?: Error;
}

export interface ReviewResult {
  approved: boolean;
  feedback?: string[];
  requiredChanges?: string[];
  vetoReason?: string;
}

export interface AgentMessage {
  from: string;
  to: string | string[];
  type: 'request' | 'response' | 'broadcast';
  content: any;
  replyTo?: string;
}

export interface AgentResponse {
  from: string;
  content: any;
  consensus?: boolean;
}

export interface Decision {
  type: string;
  description: string;
  rationale: string;
  alternatives?: string[];
  impact?: 'low' | 'medium' | 'high';
}

export interface SparcEvent {
  type: string;
  timestamp: Date;
  phase?: string;
  agent?: string;
  data: any;
}

export interface TaskQueue {
  enqueue(task: AgentTask): Promise<void>;
  dequeue(): Promise<AgentTask | null>;
  peek(): Promise<AgentTask | null>;
  size(): Promise<number>;
  clear(): Promise<void>;
}
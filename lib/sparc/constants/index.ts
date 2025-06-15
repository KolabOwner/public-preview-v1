export enum SparcPhase {
  SPECIFICATION = 'specification',
  PSEUDOCODE = 'pseudocode',
  ARCHITECTURE = 'architecture',
  REFINEMENT = 'refinement',
  COMPLETION = 'completion'
}

export enum AgentRole {
  SECURITY = 'security',
  ARCHITECTURE = 'architecture',
  FRONTEND = 'frontend',
  BACKEND = 'backend',
  TESTING = 'testing',
  DEVOPS = 'devops'
}

export enum DevelopmentMode {
  FULL = 'full',
  BACKEND_ONLY = 'backend-only',
  FRONTEND_ONLY = 'frontend-only',
  API_ONLY = 'api-only'
}

export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum CommitFrequency {
  PHASE = 'phase',
  FEATURE = 'feature',
  MANUAL = 'manual'
}

export enum ResearchDepth {
  BASIC = 'basic',
  STANDARD = 'standard',
  COMPREHENSIVE = 'comprehensive'
}

export enum MessageType {
  REQUEST = 'request',
  RESPONSE = 'response',
  BROADCAST = 'broadcast'
}

export enum EventType {
  PHASE_START = 'phase:start',
  PHASE_COMPLETE = 'phase:complete',
  PHASE_FAILED = 'phase:failed',
  
  TASK_START = 'task:start',
  TASK_COMPLETE = 'task:complete',
  TASK_FAILED = 'task:failed',
  TASK_RETRY = 'task:retry',
  
  AGENT_DECISION = 'agent:decision',
  AGENT_VETO = 'agent:veto',
  AGENT_CONSENSUS = 'agent:consensus',
  AGENT_MESSAGE = 'agent:message',
  
  PROGRESS_UPDATE = 'progress:update',
  METRIC_RECORDED = 'metric:recorded',
  ERROR_OCCURRED = 'error:occurred',
  
  COMMIT_CREATED = 'commit:created',
  VALIDATION_PASSED = 'validation:passed',
  VALIDATION_FAILED = 'validation:failed'
}

export const DEFAULT_CONFIG = {
  sparc: {
    version: '1.0.0',
    mode: 'advanced',
    automation: {
      enabled: true,
      parallelTasks: true,
      maxConcurrency: 5,
      retryPolicy: {
        attempts: 3,
        backoff: 'exponential' as const,
        maxDelay: 10000
      },
      monitoring: {
        progress: true,
        metrics: true,
        logging: 'normal' as const
      }
    },
    testDrivenDevelopment: {
      enabled: true,
      coverage: {
        target: 90,
        branches: 85,
        functions: 90,
        lines: 90,
        statements: 90
      }
    }
  }
};

export const PHASE_ORDER = [
  SparcPhase.SPECIFICATION,
  SparcPhase.PSEUDOCODE,
  SparcPhase.ARCHITECTURE,
  SparcPhase.REFINEMENT,
  SparcPhase.COMPLETION
];

export const AGENT_PRIORITIES = {
  [AgentRole.SECURITY]: 'critical',
  [AgentRole.ARCHITECTURE]: 'high',
  [AgentRole.FRONTEND]: 'high',
  [AgentRole.BACKEND]: 'high',
  [AgentRole.TESTING]: 'high',
  [AgentRole.DEVOPS]: 'medium'
};

export const AI_PROVIDERS = {
  CLAUDE: 'claude',
  GEMINI: 'gemini',
  OLLAMA: 'ollama'
} as const;

export const REDIS_KEYS = {
  TASK_QUEUE: 'sparc:tasks',
  PHASE_STATE: 'sparc:phase',
  AGENT_STATE: 'sparc:agent',
  METRICS: 'sparc:metrics',
  ARTIFACTS: 'sparc:artifacts',
  MESSAGES: 'sparc:messages',
  LOCKS: 'sparc:locks'
} as const;

export const TIMEOUTS = {
  AI_CALL: 120000, // 2 minutes
  TASK_EXECUTION: 600000, // 10 minutes
  PHASE_EXECUTION: 3600000, // 1 hour
  CONSENSUS: 300000, // 5 minutes
  LOCK_ACQUISITION: 5000 // 5 seconds
} as const;

export const PROMPTS = {
  SPECIFICATION: `You are executing the SPECIFICATION phase of SPARC methodology.
Your task is to analyze requirements and create comprehensive specifications.
Focus on functional requirements, non-functional requirements, constraints, and acceptance criteria.`,
  
  PSEUDOCODE: `You are executing the PSEUDOCODE phase of SPARC methodology.
Your task is to design high-level algorithms and system architecture.
Create structured pseudocode with clear logic flow and error handling.`,
  
  ARCHITECTURE: `You are executing the ARCHITECTURE phase of SPARC methodology.
Your task is to create detailed system design and component architecture.
Define interfaces, data models, and integration patterns.`,
  
  REFINEMENT: `You are executing the REFINEMENT phase of SPARC methodology.
Your task is to implement the system using TDD approach.
Write tests first, then implementation, ensuring high code quality.`,
  
  COMPLETION: `You are executing the COMPLETION phase of SPARC methodology.
Your task is to finalize the system with validation, documentation, and deployment.
Ensure all quality gates are passed and the system is production-ready.`
} as const;
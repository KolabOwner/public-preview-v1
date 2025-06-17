# Cloud Functions Architecture

Production-ready cloud functions implementation for enterprise resume processing with complete preservation of existing RMS metadata pipeline and custom font support.

## Architecture Principles

### 1. Serverless-First Design
- **Stateless workers**: Each function processes independently
- **Event-driven**: Triggered by storage events, HTTP requests, or scheduled tasks
- **Auto-scaling**: Handles variable workloads automatically
- **Cost-effective**: Pay only for execution time

### 2. Separation of Concerns
```
Client → API Gateway → Cloud Functions → Storage
   ↑                        ↓
   └── Real-time Updates ←──┘
```

### 3. Data Flow Architecture
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Upload    │    │   Storage   │    │   Worker    │    │   Results   │
│   Trigger   │───▶│   Event     │───▶│  Function   │───▶│   Storage   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                                      │                    │
       ▼                                      ▼                    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Job Queue  │    │ Validation  │    │ Processing  │    │ Notification│
│   Update    │    │  Pipeline   │    │  Pipeline   │    │   Service   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## Function Categories

### 1. API Functions (HTTP Triggers)
**Purpose**: Handle client requests and provide RESTful endpoints

```typescript
// functions/src/api/resume-upload.ts
export const uploadResume = onRequest({
  cors: true,
  memory: '512MiB',
  timeoutSeconds: 60
}, async (req, res) => {
  // Handle file upload and queue processing
});
```

**Responsibilities**:
- File upload handling
- Authentication/authorization
- Input validation
- Job queue management
- Response formatting

### 2. Worker Functions (Callable)
**Purpose**: Process jobs asynchronously with full enterprise features

```typescript
// functions/src/workers/resume-processor.ts
export const processResume = onCall({
  memory: '2GiB',
  timeoutSeconds: 540,  // 9 minutes (max for callable)
  region: 'us-central1'
}, async (request) => {
  // Heavy processing logic
});
```

**Responsibilities**:
- File processing
- Security validation
- RMS metadata generation
- Custom font handling
- Error recovery

### 3. Event Functions (Storage Triggers)
**Purpose**: React to storage events automatically

```typescript
// functions/src/triggers/file-uploaded.ts
export const onFileUploaded = onObjectFinalized({
  bucket: 'your-storage-bucket',
  region: 'us-central1'
}, async (event) => {
  // Auto-process uploaded files
});
```

**Responsibilities**:
- Automatic processing triggers
- File metadata extraction
- Cleanup operations
- Monitoring events

### 4. Scheduled Functions (Cron Jobs)
**Purpose**: Periodic maintenance and monitoring

```typescript
// functions/src/scheduled/cleanup.ts
export const dailyCleanup = onSchedule({
  schedule: '0 2 * * *',  // Daily at 2 AM
  timeZone: 'America/New_York'
}, async (event) => {
  // Clean up old files and jobs
});
```

**Responsibilities**:
- File cleanup
- Metrics aggregation
- Health checks
- Data archival

## Implementation Standards

### Function Configuration Standards
```typescript
// Standard configuration for different function types
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
    concurrency: 1  // CPU-intensive work
  },
  trigger: {
    memory: '256MiB' as const,
    timeoutSeconds: 60,
    maxInstances: 50,
    concurrency: 10
  }
};
```

### Error Handling Standards
```typescript
// Standard error handling wrapper
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context: string
) {
  return async (...args: T): Promise<R> => {
    const timer = performanceAnalytics.startTimer(`function.${context}`);
    
    try {
      const result = await fn(...args);
      await performanceAnalytics.recordMetric(`function.${context}.success`, 1);
      return result;
    } catch (error) {
      await performanceAnalytics.recordMetric(`function.${context}.error`, 1);
      logger.error(`Function ${context} failed`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        args: JSON.stringify(args)
      });
      throw error;
    } finally {
      await timer();
    }
  };
}
```

### Validation Standards
```typescript
// Input validation for all functions
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown
): T {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

// Example schema
const ResumeProcessingSchema = z.object({
  fileUrl: z.string().url(),
  userId: z.string().min(1),
  options: z.object({
    enableValidation: z.boolean().default(true),
    enableDLP: z.boolean().default(true),
    priority: z.enum(['low', 'normal', 'high', 'critical']).default('normal')
  }).default({})
});
```

## Enterprise Integration

### Preserving Existing Functionality
```typescript
// Worker function that preserves RMS pipeline
export const processResumeWithRMS = onCall(
  FUNCTION_CONFIGS.worker,
  withErrorHandling(async (request) => {
    const { fileUrl, userId, options } = validateInput(
      ResumeProcessingSchema,
      request.data
    );
    
    // 1. Download file from storage
    const fileData = await storageService.downloadFile(fileUrl);
    
    // 2. Enterprise pre-processing (NEW)
    await enterpriseValidation.validateFile(fileData, options);
    await dlpScanner.scan(fileData);
    
    // 3. EXISTING PROCESSING (PRESERVED)
    const parsedData = await existingResumeParser(fileData);
    const rmsMetadata = await formatResumeDataToRMS(parsedData);
    
    // 4. EXISTING PDF GENERATION (PRESERVED)
    const pdfBlob = await generateResumePDFWithRMS(parsedData);
    
    // 5. EXISTING EXIFTOOL INTEGRATION (PRESERVED)
    const finalPdf = await embedRMSMetadata(pdfBlob, rmsMetadata);
    
    // 6. Enterprise post-processing (NEW)
    await auditLogger.log('resume_processed', { userId, fileUrl });
    await performanceAnalytics.recordMetric('resume.processing.success', 1);
    
    // 7. Store results
    const resultUrl = await storageService.uploadFile(
      finalPdf,
      `results/${userId}/resume-${Date.now()}.pdf`
    );
    
    return {
      success: true,
      resultUrl,
      metadata: rmsMetadata
    };
  }, 'processResumeWithRMS')
);
```

### Storage Integration
```typescript
// Storage service integrated with functions
export class CloudFunctionStorageService {
  private storage = getStorage();
  
  async downloadFile(url: string): Promise<ArrayBuffer> {
    // Download from storage URL
    const response = await fetch(url);
    return response.arrayBuffer();
  }
  
  async uploadFile(
    data: ArrayBuffer | Blob,
    path: string
  ): Promise<string> {
    const bucket = this.storage.bucket();
    const file = bucket.file(path);
    
    await file.save(Buffer.from(data instanceof ArrayBuffer ? data : await data.arrayBuffer()));
    
    // Return signed URL
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 days
    });
    
    return url;
  }
}
```

### Real-time Updates
```typescript
// Update job status in real-time
export async function updateJobProgress(
  jobId: string,
  userId: string,
  progress: number,
  message: string
) {
  await admin.firestore()
    .collection('job_status')
    .doc(jobId)
    .update({
      progress,
      message,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  
  // Trigger real-time update to client
  await realtimeService.sendUpdate({
    type: 'JOB_PROGRESS',
    userId,
    resourceId: jobId,
    status: 'processing',
    progress,
    message
  });
}
```

## Deployment Architecture

### Multi-Environment Setup
```typescript
// Environment-specific configurations
export const getConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  const configs = {
    development: {
      projectId: 'your-dev-project',
      storageBucket: 'your-dev-bucket',
      region: 'us-central1',
      enableEnterprise: false
    },
    staging: {
      projectId: 'your-staging-project',
      storageBucket: 'your-staging-bucket',
      region: 'us-central1',
      enableEnterprise: true
    },
    production: {
      projectId: 'your-prod-project',
      storageBucket: 'your-prod-bucket',
      region: 'us-central1',
      enableEnterprise: true
    }
  };
  
  return configs[env as keyof typeof configs] || configs.development;
};
```

### Resource Allocation
```typescript
// Resource allocation based on function type
export const RESOURCE_CONFIGS = {
  // Light API functions
  'api-upload': {
    memory: '256MiB',
    timeoutSeconds: 30,
    maxInstances: 100
  },
  
  // Heavy processing functions
  'worker-resume-processing': {
    memory: '4GiB',
    timeoutSeconds: 540,
    maxInstances: 5,
    cpu: 2
  },
  
  // Real-time functions
  'trigger-file-uploaded': {
    memory: '512MiB',
    timeoutSeconds: 60,
    maxInstances: 50
  }
} as const;
```

### Monitoring Integration
```typescript
// Built-in monitoring for all functions
export function createMonitoredFunction<T extends any[], R>(
  name: string,
  config: any,
  handler: (...args: T) => Promise<R>
) {
  return onCall(config, async (request) => {
    const startTime = Date.now();
    const functionTimer = performanceAnalytics.startTimer(`function.${name}`);
    
    try {
      // Log function start
      logger.info(`Function ${name} started`, {
        requestId: request.id,
        userId: request.auth?.uid,
        data: request.data
      });
      
      // Execute function
      const result = await handler(request.data);
      
      // Record success metrics
      await performanceAnalytics.recordMetric(`function.${name}.success`, 1);
      await performanceAnalytics.recordMetric(
        `function.${name}.duration`,
        Date.now() - startTime
      );
      
      return result;
    } catch (error) {
      // Record error metrics
      await performanceAnalytics.recordMetric(`function.${name}.error`, 1);
      
      // Log error
      logger.error(`Function ${name} failed`, {
        requestId: request.id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      throw error;
    } finally {
      await functionTimer();
    }
  });
}
```

## Security Standards

### Authentication & Authorization
```typescript
// Enforce authentication for all protected functions
export function requireAuth(request: CallableRequest): string {
  if (!request.auth) {
    throw new Error('Authentication required');
  }
  return request.auth.uid;
}

// Role-based access control
export function requireRole(request: CallableRequest, requiredRole: string): void {
  const userId = requireAuth(request);
  
  // Check user role in Firestore
  // Implementation depends on your role system
}
```

### Input Sanitization
```typescript
// Sanitize all inputs
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input.trim().slice(0, 10000); // Limit length
  }
  
  if (Array.isArray(input)) {
    return input.slice(0, 1000).map(sanitizeInput); // Limit array size
  }
  
  if (input && typeof input === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      if (typeof key === 'string' && key.length < 100) {
        sanitized[key] = sanitizeInput(value);
      }
    }
    return sanitized;
  }
  
  return input;
}
```

## Performance Optimization

### Cold Start Mitigation
```typescript
// Keep functions warm with scheduled pings
export const keepWarm = onSchedule({
  schedule: 'every 5 minutes',
  region: 'us-central1'
}, async () => {
  // Ping critical functions to keep them warm
  const criticalFunctions = [
    'processResume',
    'uploadFile',
    'getJobStatus'
  ];
  
  for (const funcName of criticalFunctions) {
    try {
      await callFunction(funcName, { warmup: true });
    } catch (error) {
      // Ignore warmup errors
    }
  }
});
```

### Memory Management
```typescript
// Proper memory cleanup after processing
export function withMemoryCleanup<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      const result = await fn(...args);
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      return result;
    } catch (error) {
      // Clean up on error too
      if (global.gc) {
        global.gc();
      }
      throw error;
    }
  };
}
```

## Next Steps

1. **Review existing enterprise infrastructure** in `/lib/enterprise/`
2. **Create functions directory structure** following the patterns above
3. **Implement storage service** with proper abstraction
4. **Create first worker function** for resume processing
5. **Add monitoring and error handling** using enterprise components
6. **Test with existing RMS pipeline** to ensure preservation
7. **Deploy incrementally** with proper environment configuration

For implementation examples, see the next section on creating the actual cloud functions structure.
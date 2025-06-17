# Enterprise Integration Guide

This guide provides detailed instructions for integrating the enterprise architecture with your existing resume processing system while preserving all core functionality.

## Table of Contents

1. [Core Principles](#core-principles)
2. [Architecture Overview](#architecture-overview)
3. [Integration Patterns](#integration-patterns)
4. [Cloud Functions Architecture](#cloud-functions-architecture)
5. [Storage Strategy](#storage-strategy)
6. [Step-by-Step Integration](#step-by-step-integration)
7. [Production Deployment](#production-deployment)

## Core Principles

### 1. Preservation First
- **NEVER modify existing core functions**
- Preserve RMS metadata pipeline v2.0.1
- Maintain custom font support (Merriweather Light)
- Keep ExifTool.exe integration intact
- Ensure PDF generation workflow continues unchanged

### 2. Wrapper Pattern
```typescript
// ✅ CORRECT: Wrap existing functionality
export class EnterpriseWrapper {
  async processWithEnterprise(data: any, options: EnterpriseOptions) {
    // 1. Pre-processing (validation, security, logging)
    await this.validateInput(data, options);
    
    // 2. Call EXISTING function unchanged
    const result = await existingFunction(data);
    
    // 3. Post-processing (metrics, audit, storage)
    await this.recordMetrics(result, options);
    
    return result;
  }
}

// ❌ INCORRECT: Don't modify existing functions
export async function existingFunction(data: any) {
  // DON'T ADD enterprise features here
  // This breaks the preservation principle
}
```

### 3. Opt-in Enhancement
All enterprise features are opt-in via configuration:
```typescript
const options: EnterpriseOptions = {
  enableValidation: true,    // Optional
  enableDLP: false,         // Can be disabled
  enableAuditLogging: true, // Environment-specific
  priority: JobPriority.HIGH
};
```

## Architecture Overview

```
Production Architecture:

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │    │  Cloud Storage  │    │ Cloud Functions │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Enterprise  │ │◄──►│ │ File Storage│ │◄──►│ │ Job Workers │ │
│ │ Wrapper     │ │    │ │ (Firebase/  │ │    │ │             │ │
│ └─────────────┘ │    │ │ AWS S3/GCS) │ │    │ │ - Validation│ │
│                 │    │ └─────────────┘ │    │ │ - Processing│ │
│ ┌─────────────┐ │    │                 │    │ │ - Metadata  │ │
│ │ Real-time   │ │    │ ┌─────────────┐ │    │ └─────────────┘ │
│ │ Updates     │ │◄──►│ │ Job Queue   │ │◄──►│                 │
│ └─────────────┘ │    │ │ (Firestore) │ │    │ ┌─────────────┐ │
└─────────────────┘    │ └─────────────┘ │    │ │ Monitoring  │ │
                       └─────────────────┘    │ │ & Analytics │ │
                                              │ └─────────────┘ │
                                              └─────────────────┘
```

## Integration Patterns

### Pattern 1: File Processing with Storage
```typescript
// Client uploads file → Cloud Storage → Job Queue → Worker processes
export class FileProcessingPattern {
  async processFile(file: File, userId: string): Promise<ProcessingJob> {
    // 1. Upload to cloud storage
    const storageResult = await storageService.uploadFile(file, {
      path: `uploads/${userId}/${Date.now()}-${file.name}`,
      metadata: { userId, uploadedAt: new Date().toISOString() }
    });
    
    // 2. Queue processing job with file reference
    const job = await jobQueue.addJob('file_processing', {
      fileUrl: storageResult.url,
      filePath: storageResult.path,
      userId,
      originalName: file.name
    });
    
    // 3. Return job for tracking
    return job;
  }
}
```

### Pattern 2: Real-time Progress Updates
```typescript
// Worker updates progress → Firestore → Client receives updates
export class ProgressPattern {
  async processWithProgress(jobId: string, userId: string) {
    // Worker updates progress
    await realtimeService.sendUpdate({
      type: UpdateType.JOB_PROGRESS,
      userId,
      resourceId: jobId,
      status: 'processing',
      progress: 50,
      message: 'Extracting text from PDF...'
    });
    
    // Client subscribes to updates
    realtimeService.subscribeToJobUpdates(jobId, (update) => {
      console.log(`Progress: ${update.progress}% - ${update.message}`);
    });
  }
}
```

### Pattern 3: Resilient Processing
```typescript
// Circuit breaker + Retry + Recovery for robust processing
export class ResilientPattern {
  private circuitBreaker = new CircuitBreaker('pdf_processing');
  
  async processWithResilience(data: any) {
    return this.circuitBreaker.execute(async () => {
      // Use retry strategy
      return retryWithBackoff(async () => {
        // Call existing function
        return await existingPDFProcessor(data);
      }, {
        maxAttempts: 3,
        baseDelay: 1000,
        backoffStrategy: 'exponential'
      });
    });
  }
}
```

## Cloud Functions Architecture

### Function Structure
```
functions/
├── src/
│   ├── workers/           # Job processing workers
│   │   ├── resume-parser.ts     # PDF parsing worker
│   │   ├── metadata-writer.ts   # RMS metadata worker
│   │   └── validation.ts        # Security validation worker
│   ├── triggers/          # Event-driven functions
│   │   ├── file-upload.ts       # Storage upload trigger
│   │   └── job-completion.ts    # Job status trigger
│   ├── api/              # HTTP API functions
│   │   ├── resume-parse.ts      # Parse resume endpoint
│   │   └── health-check.ts      # Health monitoring
│   └── shared/           # Shared utilities
│       ├── storage.ts           # Storage abstraction
│       ├── validation.ts        # Validation logic
│       └── monitoring.ts        # Metrics collection
├── package.json
├── firebase.json
└── .env.example
```

### Worker Function Example
```typescript
// functions/src/workers/resume-parser.ts
import { onCall } from 'firebase-functions/v2/https';
import { storageService } from '../shared/storage';
import { validateFile } from '../shared/validation';

export const parseResume = onCall({
  memory: '1GiB',
  timeoutSeconds: 300,
  region: 'us-central1'
}, async (request) => {
  const { fileUrl, userId, options } = request.data;
  
  try {
    // 1. Download file from storage
    const file = await storageService.downloadFile(fileUrl);
    
    // 2. Validate with enterprise security
    await validateFile(file, options);
    
    // 3. Parse using existing logic (PRESERVED)
    const parsedData = await existingResumeParser(file);
    
    // 4. Store results
    await storageService.uploadFile(
      new Blob([JSON.stringify(parsedData)]),
      `results/${userId}/parsed-data.json`
    );
    
    return { success: true, data: parsedData };
  } catch (error) {
    console.error('Resume parsing failed:', error);
    throw error;
  }
});
```

## Storage Strategy

### Multi-Provider Storage Abstraction
```typescript
// Supports Firebase Storage, AWS S3, Google Cloud Storage
export interface StorageConfig {
  default: 'firebase' | 'aws' | 'gcs';
  providers: {
    firebase: FirebaseStorageConfig;
    aws?: S3StorageConfig;
    gcs?: GCSStorageConfig;
  };
}

// Usage remains consistent across providers
const storageService = new StorageService(config);
await storageService.uploadFile(file, 'path/to/file.pdf');
```

### File Lifecycle Management
```typescript
export class FileLifecycle {
  async handleUpload(file: File, userId: string) {
    // 1. Upload to staging
    const stagingPath = `staging/${userId}/${uuid()}-${file.name}`;
    await storageService.uploadFile(file, stagingPath);
    
    // 2. Queue processing
    const job = await jobQueue.addJob('file_processing', {
      stagingPath,
      userId
    });
    
    // 3. Move to permanent storage after processing
    // 4. Clean up staging after retention period
  }
}
```

## Step-by-Step Integration

### Phase 1: Setup Infrastructure
1. **Create Cloud Functions project**
   ```bash
   firebase init functions
   cd functions
   npm install firebase-admin firebase-functions
   ```

2. **Setup storage buckets**
   ```typescript
   // Configure storage in firebase.json
   {
     "storage": {
       "rules": "storage.rules"
     }
   }
   ```

3. **Deploy basic infrastructure**
   ```bash
   firebase deploy --only functions,storage
   ```

### Phase 2: Implement Storage Layer
1. **Create storage abstraction**
   ```typescript
   // lib/enterprise/infrastructure/storage/index.ts
   export { StorageService } from './storage-service';
   export { FirebaseAdapter } from './firebase-adapter';
   ```

2. **Update job queue to use file references**
   ```typescript
   // Instead of storing file data directly
   const job = await jobQueue.addJob('parse', {
     fileUrl: storageResult.url,  // ✅ Store URL reference
     // file: arrayBuffer          // ❌ Don't store binary data
   });
   ```

### Phase 3: Deploy Workers
1. **Create resume processing worker**
   ```typescript
   // functions/src/workers/resume-parser.ts
   export const processResume = onCall(processResumeHandler);
   ```

2. **Update EnterpriseWrapper**
   ```typescript
   async parseResumeWithEnterprise(file: File, userId: string) {
     // Upload file
     const storageResult = await storageService.uploadFile(file);
     
     // Call cloud function
     const result = await callableFunction('processResume', {
       fileUrl: storageResult.url,
       userId
     });
     
     return result;
   }
   ```

### Phase 4: Test End-to-End
1. **Upload test file**
2. **Verify processing in cloud functions logs**
3. **Confirm RMS metadata is preserved**
4. **Test custom font rendering**

## Production Deployment

### Environment Configuration
```env
# Production
FIREBASE_PROJECT_ID=your-prod-project
STORAGE_BUCKET=your-prod-bucket
ENABLE_ENTERPRISE_FEATURES=true

# Development
FIREBASE_PROJECT_ID=your-dev-project
STORAGE_BUCKET=your-dev-bucket
ENABLE_ENTERPRISE_FEATURES=false
```

### Monitoring Setup
```typescript
// Add monitoring to all critical functions
export const monitoredFunction = onCall({
  // ... config
}, async (request) => {
  const timer = performanceAnalytics.startTimer('function.execution');
  
  try {
    const result = await processLogic(request.data);
    await performanceAnalytics.recordMetric('function.success', 1);
    return result;
  } catch (error) {
    await performanceAnalytics.recordMetric('function.error', 1);
    throw error;
  } finally {
    await timer();
  }
});
```

### Security Considerations
1. **Storage security rules**
   ```javascript
   // storage.rules
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /uploads/{userId}/{allPaths=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

2. **Function authentication**
   ```typescript
   export const protectedFunction = onCall({
     enforceAppCheck: true  // Require app check
   }, async (request) => {
     if (!request.auth) {
       throw new Error('Authentication required');
     }
     // ... function logic
   });
   ```

## Next Steps

1. **Review existing enterprise components**: Understand what's already implemented
2. **Choose storage provider**: Firebase Storage is recommended for Firebase projects
3. **Implement storage layer**: Start with the storage abstraction
4. **Create first worker**: Begin with resume parsing worker
5. **Test integration**: Ensure existing functionality is preserved
6. **Deploy incrementally**: Gradual rollout with feature flags
7. **Monitor performance**: Use enterprise monitoring tools

For specific implementation examples, see the `/examples` directory (to be created) and the existing enterprise components in `/lib/enterprise/`.
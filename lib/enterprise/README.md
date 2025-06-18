# Enterprise Architecture Components

This directory contains enterprise-grade components that enhance the resume processing system with production-ready features including security, monitoring, error recovery, and compliance.

## Core Principles

1. **Preservation of Existing Functionality**
   - RMS metadata pipeline (v2.0.1) with ExifTool remains unchanged
   - Custom font generation (Merriweather Light) preserved
   - PDF generation workflow maintained

2. **Abstraction Layer Approach**
   - Enterprise features wrap existing functionality
   - No modification of core resume processing logic
   - Clean interfaces for integration

3. **Browser Compatibility**
   - Web Crypto API instead of Node.js crypto
   - Firebase/Firestore for persistence
   - Pattern-based security scanning

## Architecture Overview

```
enterprise/
├── core/                  # Core abstractions and interfaces
│   ├── interfaces.ts      # Contracts for existing functionality
│   ├── integrations/      # Integration logic for existing services
│   └── types.ts           # Shared type definitions
├── contexts/              # Enterprise context management
│   ├── job/              # Job information management
│   │   ├── index.ts      # Job context service
│   │   ├── store.ts      # Firestore persistence
│   │   ├── types.ts      # Job data types
│   │   └── validator.ts  # Job data validation
│   └── index.ts          # Context exports
├── security/              # Security validation and protection
│   ├── validators/        # Browser-compatible validators
│   │   ├── index.ts       # Validation pipeline orchestrator
│   │   ├── file-type-validator.ts
│   │   ├── size-validator.ts
│   │   ├── content-validator.ts
│   │   ├── security-validator.ts
│   │   └── malware-scanner.ts    # Pattern-based scanning
│   ├── encryption/        # Web Crypto API encryption
│   │   └── index.ts       # AES-GCM with PBKDF2
│   └── dlp/              # Data leak protection
│       └── index.ts       # Pattern matching for sensitive data
├── monitoring/            # Observability and metrics
│   ├── logging/          # Structured logging framework
│   │   └── index.ts      # Console + Firestore logging
│   ├── metrics/          # Performance metrics collection
│   │   └── index.ts      # In-memory aggregation
│   └── analytics/        # Performance analytics
│       └── index.ts      # Firestore-based analytics
├── resilience/           # Error handling and recovery
│   ├── circuit-breaker/  # Circuit breaker patterns
│   │   └── index.ts      # Failure detection and recovery
│   ├── retry/           # Advanced retry strategies
│   │   └── index.ts      # Exponential backoff, jitter
│   └── recovery/        # Automated recovery workflows
│       └── index.ts      # Self-healing strategies
├── infrastructure/       # Core infrastructure
│   ├── queue/           # Firebase-based job queue
│   │   └── index.ts      # Firestore job processing
│   └── realtime/        # Firebase real-time updates
│       └── index.ts      # Firestore listeners
├── processors/           # Enterprise-grade processors
│   ├── rms/             # RMS metadata processor
│   │   ├── index.ts     # Enterprise RMS processor
│   │   └── service.ts   # High-level RMS service
│   ├── keywords/        # Keyword analysis & targeting
│   │   ├── index.ts     # Enterprise keyword processor
│   │   ├── service.ts   # Keyword analysis service
│   │   ├── extractor.ts # Multi-layer keyword extraction
│   │   ├── matcher.ts   # ATS-optimized matching engine
│   │   └── scorer.ts    # Keyword quality scoring
│   └── index.ts         # Processor exports
└── compliance/          # Privacy and compliance
    ├── privacy/         # GDPR and data privacy
    │   └── index.ts      # Data anonymization, consent
    ├── audit/           # Audit trail logging
    │   └── index.ts      # Immutable Firestore logs
    └── retention/       # Data retention policies
        └── index.ts      # Automated cleanup
```

## Processor Components

### Keywords Analysis Processor

The keywords processor provides enterprise-grade ATS optimization and keyword analysis with multi-layer extraction, real-time matching, and quality scoring.

#### Architecture
```
processors/keywords/
├── index.ts        # Enterprise keyword processor with monitoring
├── service.ts      # High-level keyword analysis operations
├── extractor.ts    # Multi-layer keyword extraction (TF-IDF, NLP, rule-based)
├── matcher.ts      # ATS-optimized matching engine
└── scorer.ts       # Keyword quality and relevance scoring
```

#### Features
- **Multi-layer Extraction**: Combines TF-IDF, NLP, and rule-based approaches
- **ATS Optimization**: Ensures compatibility with applicant tracking systems
- **Real-time Analysis**: Instant feedback on keyword matches
- **Quality Scoring**: Rates keyword relevance and importance
- **Fallback Support**: Local analysis when API is unavailable
- **Job Context Integration**: Analyzes resumes against specific job descriptions

#### Integration with Job Context
The keyword processor works seamlessly with the Job Context Management system (see below) to provide targeted analysis.

### Job Context Management

Job information is managed through a dedicated context service that sits outside the keywords directory, allowing multiple processors to leverage job data.

#### Architecture
```
enterprise/
├── contexts/              # Enterprise context management
│   ├── job/              # Job information management
│   │   ├── index.ts      # Job context service
│   │   ├── store.ts      # Firestore persistence
│   │   ├── types.ts      # Job data types
│   │   └── validator.ts  # Job data validation
│   └── index.ts          # Context exports
```

#### Features
- **Resume Association**: Links job information to specific resumes
- **Multi-processor Access**: Available to keywords, RMS, and other processors
- **Persistent Storage**: Firestore-backed with local caching
- **Real-time Updates**: Synchronized across all active sessions
- **Validation**: Ensures job data integrity

## Implementation Status

### ✅ Completed Components

- [x] Base architecture structure
- [x] Security validation pipeline (browser-compatible)
- [x] Malware scanning (pattern-based for browser)
- [x] Data leak protection (DLP)
- [x] Encryption services (Web Crypto API)
- [x] Circuit breaker implementation
- [x] Structured logging framework
- [x] Performance metrics collection
- [x] Job queue system (Firebase-based)
- [x] Real-time updates (Firestore listeners)
- [x] Compliance features (GDPR, audit logging)
- [x] Performance analytics system
- [x] Recovery system (browser-compatible)
- [x] Enterprise RMS processor integration
- [x] Keyword analysis processor architecture
- [x] Job context management design

### 🚧 Integration Tasks

- [ ] Implement enterprise keyword processor
- [ ] Create job context service
- [ ] Integrate with existing keyword service
- [ ] Add monitoring for keyword analysis
- [ ] Document integration patterns

## Integration with Existing System

### Preserving Core Features

#### 1. RMS Metadata Pipeline
```typescript
// Existing pipeline preserved
1. Parse resume data
2. Format to RMS v2.0.1 metadata
3. Generate PDF with custom fonts
4. Call ExifTool.exe to embed metadata
5. Return PDF with embedded RMS
```

#### 2. Custom Font Support
```typescript
// Merriweather fonts still loaded from Google CDN
const FONT_URLS = {
  merriweather: {
    light: 'https://fonts.gstatic.com/s/merriweather/...',
    regular: 'https://fonts.gstatic.com/s/merriweather/...',
    // ... other weights
  }
};
```

#### 3. ExifTool Integration
```typescript
// Local ExifTool.exe path unchanged
const EXIFTOOL_PATH = 'C:\\Users\\ashto\\OneDrive\\ExifTool\\exiftool.exe';
const EXIFTOOL_CONFIG_PATH = './config/exiftool/rms-config.pl';
```

### Enterprise Enhancement Pattern

```typescript
// Wrapper pattern - adds features without modifying core
export class EnterpriseWrapper {
  async processWithEnterprise(data: any, options: EnterpriseOptions) {
    // Pre-processing (validation, DLP, logging)
    await this.preProcess(data, options);
    
    // Call EXISTING function unchanged
    const result = await existingProcessor.process(data);
    
    // Post-processing (metrics, audit)
    await this.postProcess(result, options);
    
    return result;
  }
}
```

## Usage Examples

### Basic Integration
```typescript
import { enterpriseWrapper } from '@/lib/enterprise/core/wrapper';

// Enhance existing PDF generation
const pdfBlob = await enterpriseWrapper.generatePDFWithEnterprise(
  resumeData,
  userId,
  {
    enableValidation: true,
    enableDLP: true,
    enableMetrics: true
  }
);
```

### Enterprise RMS Processor
```typescript
import { rmsProcessorService } from '@/lib/enterprise/processors/rms/service';

// Process PDF with enterprise RMS processor
const result = await rmsProcessorService.processPDF(
  '/path/to/resume.pdf',
  userId,
  {
    enableValidation: true,
    enableAuditLog: true,
    enableRealTimeUpdates: true,
    force: false // Use cache if available
  }
);

// Batch processing
const batchResult = await rmsProcessorService.processBatch(
  ['/path/to/resume1.pdf', '/path/to/resume2.pdf'],
  userId,
  {
    concurrency: 3,
    enableMetrics: true
  }
);

// Extract and validate RMS metadata
const metadata = await rmsProcessorService.extractMetadata('/path/to/resume.pdf', userId);
const validation = await rmsProcessorService.validateMetadata(metadata, userId);
```

### Job Queue Integration
```typescript
import { jobQueue } from '@/lib/enterprise/infrastructure/queue';

// Queue resume processing
const job = await jobQueue.addJob('resume_parse', {
  file: pdfFile,
  userId,
  options: { priority: JobPriority.HIGH }
});
```

### Real-time Updates
```typescript
import { realtimeService } from '@/lib/enterprise/infrastructure/realtime';

// Subscribe to updates
realtimeService.subscribeToUserUpdates(userId, (updates) => {
  console.log('Processing status:', updates);
});
```

### Keyword Analysis Integration
```typescript
import { keywordProcessorService } from '@/lib/enterprise/processors/keywords/service';
import { jobContextService } from '@/lib/enterprise/contexts/job';

// Set job context for a resume
await jobContextService.setJobInfo(userId, resumeId, {
  title: 'Senior Software Engineer',
  company: 'Tech Corp',
  description: 'Looking for experienced engineer with React and TypeScript...',
  keywords: ['React', 'TypeScript', 'Node.js']
});

// Analyze resume against job description
const analysis = await keywordProcessorService.analyzeResume(
  resumeContent,
  userId,
  resumeId,
  {
    enableATS: true,
    includeScoring: true,
    extractionLayers: ['tfidf', 'nlp', 'rules']
  }
);

// Get keyword recommendations
const recommendations = await keywordProcessorService.getRecommendations(
  analysis,
  {
    maxSuggestions: 10,
    priorityThreshold: 0.7
  }
);

// Real-time keyword tracking
keywordProcessorService.subscribeToAnalysis(resumeId, (update) => {
  console.log('Keyword match rate:', update.matchRate);
  console.log('Missing keywords:', update.missingKeywords);
});
```

### Job Context Service Usage
```typescript
import { jobContextService } from '@/lib/enterprise/contexts/job';

// Get job info for a resume
const jobInfo = await jobContextService.getJobInfo(userId, resumeId);

// Update job information
await jobContextService.updateJobInfo(userId, resumeId, {
  description: 'Updated job description...'
});

// Subscribe to job context changes
jobContextService.subscribeToJobInfo(resumeId, (jobInfo) => {
  console.log('Job context updated:', jobInfo);
});

// Bulk operations for multiple resumes
const jobs = await jobContextService.getJobsForUser(userId);

// Clear job info when no longer needed
await jobContextService.clearJobInfo(userId, resumeId);
```

## Configuration

### Environment Variables
```env
# Enterprise features (opt-in)
ENABLE_ENTERPRISE_FEATURES=true
ENABLE_VALIDATION=true
ENABLE_DLP=true
ENABLE_AUDIT_LOGGING=true

# Existing configuration (preserved)
EXIFTOOL_PATH=C:\Users\ashto\OneDrive\ExifTool\exiftool.exe
```

### Feature Flags
```typescript
const config = {
  enterprise: {
    validation: { enabled: true },
    dlp: { enabled: true },
    metrics: { enabled: true },
    audit: { enabled: false }
  },
  // Existing features unchanged
  rms: { enabled: true },
  customFonts: { enabled: true }
};
```

## Keyword Analysis System Details

### How It Works

1. **Resume Processing Flow**
   ```
   Resume Upload → Text Extraction → Keyword Analysis → ATS Scoring → Recommendations
        ↓                ↓                  ↓                ↓              ↓
   Job Context → Keyword Extraction → Match Analysis → Quality Score → User Feedback
   ```

2. **Multi-Layer Extraction**
   - **TF-IDF Layer**: Statistical importance of terms
   - **NLP Layer**: Context-aware keyword identification
   - **Rule-Based Layer**: Industry-specific keyword patterns

3. **Integration Points**
   - **With RMS Processor**: Keywords embedded in PDF metadata
   - **With Job Context**: Dynamic analysis based on job requirements
   - **With Storage Service**: Persistent keyword tracking
   - **With Real-time Updates**: Live keyword match feedback

### Keyword Categories

The system recognizes and categorizes keywords:
- **Technical Skills**: Programming languages, frameworks, tools
- **Soft Skills**: Leadership, communication, teamwork
- **Business Keywords**: Industry terms, methodologies
- **ATS Keywords**: Terms optimized for applicant tracking systems
- **Action Verbs**: Achievement-oriented language

### Fallback Analysis

When the API is unavailable, the system uses local analysis:
```typescript
// Automatic fallback to local analysis
const analysis = await keywordService.analyzeKeywords(resumeText, jobDescription);
// System automatically uses localStorage and predefined keyword banks
```

## Job Context Architecture

### Design Rationale

Job information is managed separately from the keywords directory to:
1. **Enable Multi-Processor Access**: RMS, keywords, and future processors can all use job data
2. **Maintain Separation of Concerns**: Job data is application-level, not processor-specific
3. **Support Complex Workflows**: Multiple resumes can be analyzed against the same job
4. **Enable Caching**: Job descriptions are cached to reduce API calls

### Data Flow
```
User Input → Job Context Service → Firestore
     ↓              ↓                  ↓
Resume ID → Context Association → Real-time Sync
     ↓              ↓                  ↓
Processors → Keyword Analysis → RMS Metadata
```

### Storage Schema
```typescript
// Firestore structure
users/{userId}/
  jobs/{jobId}/
    - title: string
    - company: string
    - description: string
    - keywords: string[]
    - created_at: timestamp
    - updated_at: timestamp
  
  resumes/{resumeId}/
    - job_associations: {
        [jobId]: {
          associated_at: timestamp
          match_score: number
        }
      }
```

## Best Practices

1. **Never modify core functions** - Always wrap or extend
2. **Make features opt-in** - Use feature flags
3. **Graceful degradation** - Fall back to original behavior
4. **Preserve metadata** - Ensure RMS fields are processed
5. **Test thoroughly** - Verify PDFs render with custom fonts
6. **Monitor performance** - Track impact of enterprise features
7. **Use Job Context** - Always associate job info before keyword analysis
8. **Cache Strategically** - Job descriptions change infrequently

## Next Steps

See [INTEGRATION-GUIDE.md](./INTEGRATION-GUIDE.md) for detailed integration instructions.
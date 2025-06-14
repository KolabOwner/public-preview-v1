# SPARC Implementation Guide for Hirable AI

## Quick Start

### 1. Initial Setup

```bash
# Clone the repository
git clone https://github.com/your-org/hirable-ai.git
cd hirable-ai

# Copy configuration files
cp CLAUDE.md .
cp claude_desktop_config.json ~/.claude/
mkdir -p .claude/commands
cp -r commands/* .claude/commands/

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase credentials

# Initialize Firebase
firebase init
```

### 2. Run SPARC Development

```bash
# Full development cycle
./claude-sparc.sh "hirable-ai-enhancement" "CLAUDE.md" \
  --mode full \
  --research-depth comprehensive \
  --coverage 90

# Backend-only improvements
./claude-sparc.sh "api-optimization" "CLAUDE.md" \
  --mode backend-only \
  --skip-research

# Frontend feature development
./claude-sparc.sh "resume-editor-v2" "requirements/editor-v2.md" \
  --mode frontend-only
```

## Project-Specific SPARC Phases

### Phase 0: Research & Discovery

For Hirable AI, research should focus on:

```bash
BatchTool(
  WebFetchTool("ATS system requirements 2024"),
  WebFetchTool("resume parsing best practices"),
  WebFetchTool("PDF.js vs alternative libraries performance"),
  WebFetchTool("Firebase Firestore optimization techniques"),
  WebFetchTool("Next.js 14 app directory patterns")
)
```

### Phase 1: Specification

Key areas to specify:
- Resume parsing accuracy requirements (>95%)
- ATS compatibility standards
- Performance targets (<2s parse time)
- Security requirements (SOC2 compliance)
- Accessibility standards (WCAG 2.1 AA)

### Phase 2: Pseudocode

Architecture patterns for Hirable AI:
```
System Architecture:
├── Presentation Layer (Next.js App Router)
├── API Layer (Next.js Route Handlers)
├── Business Logic Layer (Services)
├── Data Access Layer (Firebase)
└── External Services (AI APIs)

Processing Pipeline:
1. File Upload → Validation
2. PDF Extraction → Text Processing
3. AI Parsing → RMS Conversion
4. Data Storage → User Notification
5. Editor Display → Real-time Updates
```

### Phase 3: Architecture

Detailed component design:
```typescript
// Resume Processing Architecture
interface ResumeProcessor {
  upload(file: File): Promise<string>;
  extract(fileUrl: string): Promise<string>;
  parse(text: string): Promise<ParsedData>;
  validate(data: ParsedData): ValidationResult;
  store(data: ParsedData): Promise<void>;
}

// Real-time Collaboration Architecture
interface CollaborationService {
  joinSession(resumeId: string): WebSocket;
  broadcastChange(change: Delta): void;
  resolveConflict(changes: Delta[]): Delta;
}
```

### Phase 4: Refinement (TDD)

Test-driven development approach:

```bash
# Backend Tests
BatchTool(
  Task("tdd", "Test PDF extraction with various formats"),
  Task("tdd", "Test resume parsing accuracy"),
  Task("tdd", "Test authentication flows"),
  Task("tdd", "Test rate limiting")
)

# Frontend Tests
BatchTool(
  Task("tdd", "Test resume editor interactions"),
  Task("tdd", "Test responsive design"),
  Task("tdd", "Test error states"),
  Task("tdd", "Test accessibility")
)
```

### Phase 5: Completion

Deployment checklist:
- [ ] All tests passing (>90% coverage)
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Documentation updated
- [ ] Monitoring configured
- [ ] Feature flags set
- [ ] Deployment pipeline tested

## Hirable AI Specific Workflows

### Adding AI-Powered Features

```bash
# 1. Research AI capabilities
./claude-sparc.sh "ai-content-generation" "requirements/ai-features.md" \
  --research-depth comprehensive \
  --mode backend-only

# 2. Implement with TDD
BatchTool(
  Task("tdd", "Create AI service tests"),
  Task("code", "Implement AI integration"),
  Task("integration", "Connect to resume editor"),
  Task("security-review", "Audit API key usage")
)
```

### Optimizing Performance

```bash
# 1. Identify bottlenecks
BatchTool(
  Task("debug", "Profile PDF processing"),
  Task("debug", "Analyze bundle size"),
  Task("debug", "Check database queries")
)

# 2. Implement optimizations
BatchTool(
  Task("refinement-optimization-mode", {
    "targets": ["PDF processing", "Bundle size", "Query performance"],
    "metrics": ["Parse time < 2s", "Bundle < 200KB", "Query < 100ms"]
  })
)
```

### Implementing New Resume Templates

```bash
# Use custom command
Run command: create-component "ModernTemplate" "/components/resume/templates"

# Then enhance with SPARC
./claude-sparc.sh "modern-template" "requirements/template-modern.md" \
  --mode frontend-only \
  --skip-tests  # Templates are visual, test manually
```

## Integration with Existing Codebase

### File Organization

```
hirable-ai/
├── .claude/                    # Claude-specific configuration
│   ├── commands/              # Custom commands
│   └── context/               # Additional context files
├── coordination/              # Multi-agent coordination
│   ├── memory_bank/          # Shared knowledge
│   ├── subtasks/             # Task breakdowns
│   └── orchestration/        # Agent assignments
├── app/                      # Next.js app directory
├── components/               # React components
├── lib/                      # Utilities and services
└── CLAUDE.md                # Main context file
```

### Git Workflow Integration

```bash
# Feature branch workflow
git checkout -b feature/ai-keyword-analysis

# Run SPARC development
./claude-sparc.sh "keyword-analysis" "requirements/keyword-analysis.md"

# SPARC will commit at each phase
git log --oneline
# feat: complete specification phase
# feat: complete architecture phase
# test: implement keyword analysis tests
# feat: complete keyword analysis implementation

# Push for review
git push origin feature/ai-keyword-analysis
```

### Environment-Specific Configurations

```bash
# Development
./claude-sparc.sh "feature" "spec.md" \
  --config .roo/mcp-dev.json

# Staging
./claude-sparc.sh "feature" "spec.md" \
  --config .roo/mcp-staging.json \
  --no-commits  # Manual commits for staging

# Production hotfix
./claude-sparc.sh "hotfix" "issue.md" \
  --mode backend-only \
  --skip-research \
  --coverage 100  # Ensure thorough testing
```

## Monitoring SPARC Progress

### Real-time Progress Tracking

```markdown
# In coordination/orchestration/progress_tracker.md

## SPARC Phase Status - Hirable AI Enhancement

### Phase 0: Research ✅
- ATS requirements researched
- Competitor analysis complete
- Technology decisions made

### Phase 1: Specification 🟡
- Functional requirements defined
- Non-functional requirements in progress
- API contracts pending

### Phase 2: Pseudocode ⚪
- Waiting on specification completion

### Phase 3: Architecture ⚪
- Blocked by specification

### Phase 4: Refinement ⚪
- TDD implementation pending

### Phase 5: Completion ⚪
- Deployment preparation pending
```

### Success Metrics

Track these metrics for each SPARC run:
- **Development Velocity**: Features completed per sprint
- **Code Quality**: Test coverage, linting scores
- **Performance**: Page load times, API response times
- **User Satisfaction**: Error rates, completion rates
- **Technical Debt**: Code complexity, outdated dependencies

## Troubleshooting

### Common Issues

1. **PDF Processing Timeout**
   ```bash
   # Increase timeout in next.config.js
   Edit next.config.js
   # Add: maxDuration: 60
   ```

2. **Firebase Permission Errors**
   ```bash
   # Check rules
   Run command: add-firebase-rule "resumes" "read-write"
   ```

3. **Build Failures**
   ```bash
   # Clean and rebuild
   Bash rm -rf .next node_modules
   Bash npm install
   Bash npm run build
   ```

### Debug Mode

```bash
# Run SPARC with verbose debugging
./claude-sparc.sh "feature" "spec.md" \
  --verbose \
  --dry-run  # See what would be executed

# Check specific phase
./claude-sparc.sh "feature" "spec.md" \
  --start-phase 3  # Start from architecture
```

## Best Practices

### 1. Keep Context Updated
```bash
# After major changes
Edit CLAUDE.md
# Update architecture, add new features, document decisions
```

### 2. Use Memory Bank
```bash
# Document important findings
Edit coordination/memory_bank/performance_metrics.md
# Add: PDF parsing improved 40% with streaming
```

### 3. Leverage Custom Commands
```bash
# Chain commands for complex tasks
Run commands:
1. create-api-endpoint "resume/optimize" "POST"
2. add-firebase-rule "optimizations" "user-only"
3. run-performance-test "optimization-api"
```

### 4. Regular Coordination Syncs
```bash
# Weekly sync format
Edit coordination/orchestration/weekly_sync.md
# Add progress, blockers, next week's focus
```

## Next Steps

1. **Set up your environment** with the provided configuration files
2. **Run your first SPARC cycle** on a small feature
3. **Monitor progress** using the coordination system
4. **Iterate and improve** based on results
5. **Share learnings** in the memory bank

Remember: SPARC is a methodology, not a rigid process. Adapt it to your team's needs while maintaining its core principles of structured, AI-assisted development.

<SPARC-READY>
Your Hirable AI project is now configured for SPARC development!
</SPARC-READY>

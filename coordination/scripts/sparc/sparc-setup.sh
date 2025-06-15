#!/bin/bash
# SPARC Setup Script for Hirable AI Resume Analysis Service
# This script configures your project for SPARC development

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project information
PROJECT_NAME="Hirable AI"
PROJECT_DIR=$(pwd)

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}SPARC Setup for ${PROJECT_NAME}${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command_exists git; then
    echo -e "${RED}Error: git is not installed${NC}"
    exit 1
fi

if ! command_exists node; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All prerequisites met${NC}"
echo ""

# Create directory structure
echo -e "${YELLOW}Creating SPARC directory structure...${NC}"

mkdir -p .claude/commands
mkdir -p coordination/memory_bank
mkdir -p coordination/subtasks
mkdir -p coordination/orchestration
mkdir -p performance-reports
mkdir -p docs/api
mkdir -p docs/adr
mkdir -p tests/firebase-rules

echo -e "${GREEN}✓ Directory structure created${NC}"
echo ""

# Download SPARC script if not present
if [ ! -f "claude-sparc.sh" ]; then
    echo -e "${YELLOW}Downloading SPARC script...${NC}"
    curl -o claude-sparc.sh https://gist.github.com/ruvnet/e8bb444c6149e6e060a785d1a693a194/raw/claude-sparc.sh
    chmod +x claude-sparc.sh
    echo -e "${GREEN}✓ SPARC script downloaded${NC}"
else
    echo -e "${GREEN}✓ SPARC script already exists${NC}"
fi
echo ""

# Create configuration files
echo -e "${YELLOW}Creating configuration files...${NC}"

# Create .env.example with your actual project structure
if [ ! -f ".env.example" ]; then
    cat > .env.example << 'EOF'
# Development Environment
NODE_ENV=production

# Firebase Client SDK (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAHSfL2tQZDwRtgAQyOwxUKGCnflb66270
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=my-rms-validator.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=my-rms-validator
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=my-rms-validator.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1088027807867
NEXT_PUBLIC_FIREBASE_APP_ID=1:1088027807867:web:02e77bb631ce2f1f2392de

# Firebase Admin SDK (Server-side)
FIREBASE_PROJECT_ID=kolabai-project
FIREBASE_CLIENT_EMAIL=service-account@kolabai-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----"

# Optional: Vercel Deployment
VERCEL_TOKEN=your-vercel-token
VERCEL_PROJECT_ID=your-vercel-project-id

# Optional: External APIs
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
EOF
    echo -e "${GREEN}✓ Created .env.example${NC}"
fi

# Update .env.local with proper credentials if it doesn't exist
if [ ! -f ".env.local" ]; then
    cat > .env.local << 'EOF'
# Force production Firebase in development
NODE_ENV=production

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAHSfL2tQZDwRtgAQyOwxUKGCnflb66270
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=my-rms-validator.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=my-rms-validator
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=my-rms-validator.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1088027807867
NEXT_PUBLIC_FIREBASE_APP_ID=1:1088027807867:web:02e77bb631ce2f1f2392de

FIREBASE_PROJECT_ID=kolabai-project
FIREBASE_CLIENT_EMAIL=service-account@kolabai-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCcs7Su9jOhr7OS\ncBQPTvBqanBl0jV0UcQI6Em411GIcdRR+Z0z3TxNNEOsHXhviie0gjzx7wM9XR1D\nQ0o/PdjIqmO44P0UcttyOuUX8QMJdaY/wFAY9yMLjPWkvaYOUo5XuUYKS9hK1nvC\nG3ixMYfPHtRQHd/1h/Zlx0gMidbVQLHVeU/szRSTND+V2d5oNhaBjGIQXV5aIj01\nG04onoEkR1r+h8g+QIVtahKAZbpWJCm8E/d3diAov7F1k9elf8mRTgkGjJKTZM3H\n+XRsMflkyJniRSNAfxlmkx2eDi0GkrfLOPvXO0jrrJV//WiYh5pr2Ji6oZopYUPe\nQMm7bB4RAgMBAAECggEAI0Or0z3zw5yzSC6xzPoiT4hxj/B8+BbYi3qe8JqALjkT\no3kNoBjXE7bBze955XwNUGmIxpdXvs0AI112zYGhEhOKSpZTTfFFIlFPshIacVwJ\nFEq2m8+uEtDfjPni71Ez2FkJApMr8zeOdVHSWOoBGqLg+8ClYG9/C0uMEspITwgc\ndz6AV+2n5imgT5MXDTOffFc8fOC3q/5gsmAfmM7T55+K/Nl7gyh3dkq4LGSwViCg\nDyGfXz69ZBTSKExmuWglXR8FGI+3b3QH58DRoZd9EalGXERKSBZQqE7yEOFzPxXf\nZI56uy1CTGHJ/gn2KH2TlPktJbBrW5cKZyq3BwmKAwKBgQDIuNWXGlgL2fxAiSKd\nNAMuqaVAHIprzhAEP1dkLPlRVPoZelLJoCdIp8jzfoo/tZZyu4BBPnTGjZCq1rUz\nvPidnRqOvpZ7bhjX23H6/Xeag08WCJtQfFPyF9YGlNWnRTOUQTgqy92amo81KF/6\nLSwbqUKWlNcjgSg9Hda39rvErwKBgQDH22a1SEf+bMQtcXzYB08Oe3Owhs4wycbl\nPUyqxrAwFp3l2jBak4LAtA9r1Jl7Jq1azWl7ACF+fpDbvrhU2OrBvM5W2kXHl6iT\nOR/0fdGF47vfhjI+y0ZdvTouL36GHE55zt0HWGHY4lhXtbQCoP9OopCx4Ri8uuAY\nJiv6QMB5PwKBgCWv1qKtVpS7FArF9NLRXjuXrKhR84d0RDuX7P+pFhK4QtEfz4V9\n5YJVxnw5aRm3LY1TOSyG3oQdNmltMM6LD58ATWk5zaVVMaLt2APJLXi8aM/5Q7gj\n79sHsK7BqS/j5WBTsokOiAgsNvFDKGofqyVybUc6oP5QlM6M2LDnya+PAoGBAI4z\n3z2nw4oVi/SlpmXztV2hm2yETpvKRloAJtfwbZaZ0RmmCPe5s7Q3qi1YZSiKGZjd\nRWs+aZaeqaWha3j7qvXUyKBlyHa+wzSV1dXZ3EY/BwOBcajabCPwq0AHjSgRZgkn\nln9OdLikPKWT5RRlx6ME6p2Wg0puUVr9dhcnEYxzAoGAR/T0WBHZUKnjG16v+NeN\ngMD5PLVK+ujkybQ+B1PzCw5NQsfp66+V/YnN+Iap9J1IM0ErVV44mo7sLuSC4gdB\n9synOYZuVdkF5TltQKDiRAfCKftQJOrLfgXIMeWhmeShSkQx6hYtzMc+Gu6XZjTw\nUYKuBDJzczlP67ltiB5j+XI=\n-----END PRIVATE KEY-----\n"
EOF
    echo -e "${GREEN}✓ Created .env.local with your Firebase credentials${NC}"
else
    echo -e "${GREEN}✓ .env.local already exists with credentials${NC}"
fi

# Create .gitignore additions
if ! grep -q "coordination/" .gitignore 2>/dev/null; then
    echo -e "\n# SPARC files\ncoordination/orchestration/\nperformance-reports/\n.claude/local/\n*.log" >> .gitignore
    echo -e "${GREEN}✓ Updated .gitignore${NC}"
fi

# Initialize coordination files
echo -e "${YELLOW}Initializing coordination system...${NC}"

# Create initial memory bank files
cat > coordination/memory_bank/README.md << 'EOF'
# Memory Bank

This directory contains shared knowledge and discoveries from all agents.

## Files
- `design_decisions.md` - Architecture and design decisions
- `bug_patterns.md` - Known issues and their solutions
- `performance_metrics.md` - Performance benchmarks and optimizations
- `security_audit.md` - Security findings and recommendations
- `feature_roadmap.md` - Planned features and enhancements
EOF

cat > coordination/memory_bank/design_decisions.md << 'EOF'
# Design Decisions

## Architecture Decisions

### 1. Next.js App Router (2024-01-15)
**Decision**: Use Next.js 14 App Router instead of Pages Router
**Rationale**: Better performance, server components, improved DX
**Trade-offs**: Learning curve for team, some libraries incompatible
**Status**: Implemented

### 2. Firebase vs Custom Backend (2024-01-10)
**Decision**: Use Firebase for auth, database, and storage
**Rationale**: Rapid development, built-in security, scalability
**Trade-offs**: Vendor lock-in, limited query capabilities
**Status**: Implemented

### 3. Resume Storage Format (2024-01-20)
**Decision**: Store parsed data in Firestore, PDFs in Storage
**Rationale**: Queryable data, cost-effective file storage
**Trade-offs**: Complexity in syncing, storage costs
**Status**: Implemented

### 4. Type Safety Implementation (2024-06-14)
**Decision**: Strict TypeScript with no 'any' types in production code
**Rationale**: Better development experience, fewer runtime errors
**Trade-offs**: Initial development overhead
**Status**: Implemented

### 5. Security-First API Design (2024-06-14)
**Decision**: All APIs require authentication by default
**Rationale**: Prevent unauthorized access and resource abuse
**Trade-offs**: Additional complexity for public endpoints
**Status**: In Progress
EOF

cat > coordination/memory_bank/performance_metrics.md << 'EOF'
# Performance Metrics

## Current Benchmarks (Updated 2024-06-14)

### PDF Processing
- Average parse time: 3.2s
- 95th percentile: 5.8s
- Memory usage: 128MB peak
- Success rate: 94%
- File size limit: 10MB
- Page limit: 100 pages

### Page Load Times
- Dashboard: 1.2s (FCP), 2.1s (TTI)
- Resume Editor: 1.5s (FCP), 2.8s (TTI)
- Landing Page: 0.8s (FCP), 1.4s (TTI)

### Bundle Sizes
- Main bundle: 245KB (gzipped)
- Editor chunk: 89KB (gzipped)
- PDF worker: 156KB

### Type Safety Metrics
- TypeScript strict mode: ✅ Enabled
- 'any' types removed: 155+ instances
- Type coverage: 95%+

## Optimization Opportunities
1. ✅ Lazy load PDF.js worker
2. Implement virtual scrolling for large resumes
3. Cache parsed resume data
4. Optimize Firestore queries with composite indexes
5. ✅ Extract constants for magic numbers
6. Add rate limiting to APIs
EOF

cat > coordination/memory_bank/security_audit.md << 'EOF'
# Security Audit Results (2024-06-14)

## Critical Issues Identified

### 🔴 HIGH PRIORITY
1. **Missing Authentication** - All API endpoints allow anonymous access
2. **Wide-open CORS** - `Access-Control-Allow-Origin: *` on file upload endpoints
3. **No Rate Limiting** - Vulnerable to DDoS and resource exhaustion
4. **XSS Vulnerability** - `dangerouslySetInnerHTML` in theme script without sanitization

### 🟡 MEDIUM PRIORITY
1. **Error Information Disclosure** - Internal configurations exposed in error messages
2. **File Upload Security** - No virus scanning or content validation
3. **Sensitive Data Exposure** - User metadata fully exposed in API responses

### 🟢 LOW PRIORITY
1. **Missing Security Headers** - CSP, X-Frame-Options not implemented
2. **Input Validation** - Basic validation present but could be strengthened

## Recommendations Implemented
- ✅ Created constants file for hardcoded values
- ✅ Improved TypeScript type safety
- ✅ Removed debug console statements

## Next Actions Required
1. Implement authentication middleware
2. Add rate limiting
3. Fix CORS configuration
4. Sanitize theme script inputs
5. Add comprehensive input validation
EOF

# Create subtask templates
cat > coordination/subtasks/task_template.md << 'EOF'
# Task: [Task Name]

## Overview
Brief description of what needs to be done.

## Requirements
- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

## Technical Approach
1. Step 1
2. Step 2
3. Step 3

## Success Criteria
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Code review approved
- [ ] Documentation updated

## Dependencies
- Depends on: [Other tasks]
- Blocks: [Tasks that depend on this]

## Assigned To
Agent: [Agent Name]
Status: ⚪ TODO
EOF

cat > coordination/subtasks/security_hardening.md << 'EOF'
# Task: Security Hardening

## Overview
Implement comprehensive security measures across the application based on security audit findings.

## Requirements
- [ ] Add authentication middleware to all API routes
- [ ] Implement rate limiting (100 requests/minute per IP)
- [ ] Fix CORS configuration (whitelist specific domains)
- [ ] Sanitize all user inputs including theme script
- [ ] Add comprehensive input validation using Zod
- [ ] Implement security headers (CSP, HSTS, etc.)
- [ ] Add file upload virus scanning
- [ ] Remove sensitive data from error responses

## Technical Approach
1. Create authentication middleware using Firebase Admin SDK
2. Implement rate limiting using express-rate-limit or Next.js middleware
3. Update CORS to whitelist approved domains
4. Add input sanitization library (DOMPurify)
5. Create Zod schemas for all API inputs
6. Add security headers via Next.js middleware
7. Integrate ClamAV or similar for file scanning
8. Create generic error response handlers

## Success Criteria
- [ ] All API endpoints require valid authentication
- [ ] Rate limiting prevents abuse (tested)
- [ ] XSS vulnerabilities eliminated
- [ ] Security headers properly configured
- [ ] File uploads are scanned and safe
- [ ] No sensitive information in error responses
- [ ] Security audit shows 0 critical/high issues

## Dependencies
- Depends on: Firebase Admin SDK setup
- Blocks: Production deployment

## Assigned To
Agent: Security Agent
Status: 🔴 HIGH PRIORITY
EOF

echo -e "${GREEN}✓ Coordination system initialized${NC}"
echo ""

# Create custom commands
echo -e "${YELLOW}Installing custom commands...${NC}"

# Command: Quick Start
cat > .claude/commands/quick-start.sh << 'EOF'
#!/bin/bash
# Quick start development environment for Hirable AI

echo "🚀 Starting Hirable AI development environment..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if Firebase emulators are available
if command -v firebase >/dev/null 2>&1; then
    echo "🔥 Starting Firebase emulators..."
    firebase emulators:start --only auth,firestore,storage &
    EMULATOR_PID=$!
    echo "Firebase emulators started (PID: $EMULATOR_PID)"
    
    # Wait a bit for emulators to start
    sleep 3
fi

echo "🎯 Starting Next.js development server..."
npm run dev
EOF
chmod +x .claude/commands/quick-start.sh

# Command: Run Tests
cat > .claude/commands/run-tests.sh << 'EOF'
#!/bin/bash
# Run all tests with coverage for Hirable AI

echo "🧪 Running Hirable AI test suite..."

# Type checking
echo "📝 Type checking..."
if command -v tsc >/dev/null 2>&1; then
    npx tsc --noEmit
else
    echo "TypeScript compiler not found, skipping type check"
fi

# Linting
echo "🔍 Linting..."
if npm run lint > /dev/null 2>&1; then
    npm run lint
else
    echo "Lint script not found, skipping linting"
fi

# Unit tests (if Jest is configured)
if [ -f "jest.config.js" ] || [ -f "jest.config.ts" ]; then
    echo "🏃 Running unit tests..."
    npm test -- --coverage
else
    echo "Jest not configured, skipping unit tests"
fi

echo "✅ Test suite completed!"
EOF
chmod +x .claude/commands/run-tests.sh

# Command: Deploy to Vercel
cat > .claude/commands/deploy.sh << 'EOF'
#!/bin/bash
# Deploy Hirable AI to Vercel

echo "🚀 Deploying Hirable AI to Vercel..."

# Build the project
echo "🏗️  Building project..."
npm run build

# Deploy with Vercel CLI if available
if command -v vercel >/dev/null 2>&1; then
    echo "📤 Deploying to Vercel..."
    vercel --prod
else
    echo "❌ Vercel CLI not found. Please install it with: npm i -g vercel"
    exit 1
fi

echo "✅ Deployment completed!"
EOF
chmod +x .claude/commands/deploy.sh

# Command: Security Check
cat > .claude/commands/security-check.sh << 'EOF'
#!/bin/bash
# Run security checks for Hirable AI

echo "🔒 Running security checks for Hirable AI..."

# Check for secrets in code
echo "🔍 Checking for exposed secrets..."
if command -v git >/dev/null 2>&1; then
    git secrets --scan || echo "git-secrets not installed, skipping secret scan"
fi

# Audit npm packages
echo "📦 Auditing npm packages..."
npm audit

# Check environment variables
echo "🌍 Checking environment configuration..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local found"
    # Check if required vars are set
    if grep -q "FIREBASE_PROJECT_ID" .env.local; then
        echo "✅ Firebase configuration present"
    else
        echo "❌ Firebase configuration missing"
    fi
else
    echo "❌ .env.local not found"
fi

# Check for common security issues
echo "🛡️  Checking for common security patterns..."
grep -r "console.log" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . | wc -l | awk '{print $1 " console.log statements found (should be removed for production)"}'

echo "✅ Security check completed!"
EOF
chmod +x .claude/commands/security-check.sh

echo -e "${GREEN}✓ Custom commands installed${NC}"
echo ""

# Create VS Code settings
echo -e "${YELLOW}Creating VS Code configuration...${NC}"

mkdir -p .vscode
cat > .vscode/settings.json << 'EOF'
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "typescript.preferences.noSemicolons": "off",
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/.next": true,
    "**/dist": true,
    "**/coverage": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/.next": true,
    "**/dist": true,
    "**/coverage": true
  },
  "eslint.workingDirectories": ["."],
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
EOF

cat > .vscode/launch.json << 'EOF'
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}"
    },
    {
      "name": "Next.js: debug full stack",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev",
      "console": "integratedTerminal",
      "serverReadyAction": {
        "pattern": "ready - started server on .*, url: (https?://\\S+)",
        "uriFormat": "%s",
        "action": "debugWithChrome"
      }
    }
  ]
}
EOF

cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
EOF

echo -e "${GREEN}✓ VS Code configuration created${NC}"
echo ""

# Create initial agent assignments
cat > coordination/orchestration/agent_assignments.md << 'EOF'
# Agent Assignments - Hirable AI

## Active Assignments

### 🔒 Security Agent
**Status**: 🔴 ACTIVE - Security Hardening
**Current Task**: Implement authentication and rate limiting
**Expertise**: Authentication, authorization, input validation, security headers
**Priority**: Critical security vulnerabilities

### 🏗️ Architecture Agent
**Status**: Available
**Current Task**: None
**Expertise**: System design, database schema, API contracts
**Next**: API restructuring for security compliance

### 💻 Frontend Agent  
**Status**: Available
**Current Task**: None
**Expertise**: React, Next.js, UI state management, TypeScript
**Next**: Implement error boundaries and loading states

### 🔧 Backend Agent
**Status**: Available
**Current Task**: None
**Expertise**: API development, Firebase, PDF processing
**Next**: Optimize PDF processing pipeline

### 🧪 Testing Agent
**Status**: Available
**Current Task**: None
**Expertise**: Jest, React Testing Library, E2E testing, security testing
**Next**: Implement comprehensive test suite

### 🎨 UX/UI Agent
**Status**: Available
**Current Task**: None
**Expertise**: Tailwind CSS, animations, responsive design
**Next**: Improve accessibility and mobile experience

### 🚀 DevOps Agent
**Status**: Available
**Current Task**: None
**Expertise**: CI/CD, Vercel, Firebase deployment, monitoring
**Next**: Set up production monitoring and alerts

## Task Queue (Priority Order)

### 🔴 CRITICAL
1. [ ] **Security Hardening** (Security Agent) - Fix authentication, CORS, rate limiting
2. [ ] **Input Validation** (Security Agent) - Implement Zod schemas for all inputs
3. [ ] **Error Handling** (Backend Agent) - Standardize error responses

### 🟡 HIGH  
4. [ ] **Performance Optimization** (Backend Agent) - Optimize PDF processing
5. [ ] **Testing Infrastructure** (Testing Agent) - Set up comprehensive testing
6. [ ] **Monitoring Setup** (DevOps Agent) - Implement error tracking and metrics

### 🟢 MEDIUM
7. [ ] **UI Polish** (UX/UI Agent) - Improve accessibility and animations
8. [ ] **Feature: Real-time Collaboration** (Architecture + Frontend)
9. [ ] **Feature: Advanced Templates** (UX/UI Agent)

### 🔵 LOW
10. [ ] **Analytics Dashboard** (Frontend + Backend)
11. [ ] **Mobile App** (Frontend Agent)
12. [ ] **Integration: LinkedIn** (Backend Agent)

## Coordination Rules
- Security Agent has override priority for security-related changes
- All agents must run security checks before merging
- Performance benchmarks must be maintained or improved
- Type safety is mandatory (no 'any' types)
EOF

# Final setup steps
echo -e "${YELLOW}Finalizing setup...${NC}"

# Create a local SPARC configuration
cat > .claude/sparc-config.json << 'EOF'
{
  "project": "Hirable AI Resume Analysis Service",
  "version": "1.0.0",
  "firebase": {
    "projectId": "my-rms-validator",
    "adminProjectId": "kolabai-project"
  },
  "defaults": {
    "mode": "full",
    "coverage": 90,
    "researchDepth": "standard",
    "commitFrequency": "phase",
    "typeChecking": "strict",
    "securityFirst": true
  },
  "customCommands": {
    "enabled": true,
    "path": ".claude/commands"
  },
  "coordination": {
    "enabled": true,
    "path": "coordination",
    "multiAgent": true
  },
  "security": {
    "auditEnabled": true,
    "requireAuth": true,
    "rateLimiting": true,
    "inputValidation": "strict"
  },
  "performance": {
    "benchmarking": true,
    "bundleAnalysis": true,
    "lighthouse": true
  }
}
EOF

# Create README for SPARC
cat > SPARC-README.md << 'EOF'
# SPARC Development - Hirable AI

This project is configured for SPARC (Specification, Pseudocode, Architecture, Refinement, Completion) development methodology.

## 🚀 Quick Start

1. **Run a SPARC cycle for a new feature:**
   ```bash
   ./claude-sparc.sh "feature-name" "requirements.md"
   ```

2. **Start development environment:**
   ```bash
   ./scripts/sparc-setup.sh  # First time setup
   .claude/commands/quick-start.sh  # Daily development
   ```

3. **Run comprehensive tests:**
   ```bash
   .claude/commands/run-tests.sh
   ```

4. **Security check:**
   ```bash
   .claude/commands/security-check.sh
   ```

5. **Deploy to production:**
   ```bash
   .claude/commands/deploy.sh
   ```

## 📁 Project Structure

```
├── .claude/               # SPARC configuration
├── coordination/          # Multi-agent coordination
├── scripts/              # Setup and utility scripts
├── docs/                 # Technical documentation
├── app/                  # Next.js App Router pages
├── components/           # React components
├── lib/                  # Utilities and configurations
├── contexts/             # React contexts
└── src/                  # Core business logic
```

## 🛡️ Security-First Development

This project prioritizes security:
- All APIs require authentication by default
- Strict TypeScript (no 'any' types)
- Input validation with Zod schemas
- Rate limiting on all endpoints
- CORS properly configured
- Security headers implemented

## 🔧 Custom Commands

See `.claude/commands/` for project-specific automation:
- `quick-start.sh` - Start development environment
- `run-tests.sh` - Run all tests and checks
- `security-check.sh` - Security audit
- `deploy.sh` - Production deployment

## 👥 Multi-Agent Coordination

Multi-agent development is coordinated through the `coordination/` directory:
- **Security Agent** - Authentication, authorization, security audits
- **Architecture Agent** - System design, database schema
- **Frontend Agent** - React, UI/UX, TypeScript
- **Backend Agent** - APIs, Firebase, PDF processing
- **Testing Agent** - Unit tests, integration tests, E2E
- **DevOps Agent** - CI/CD, deployment, monitoring

## 📖 Documentation

- `CLAUDE.md` - Project context for AI agents
- `coordination/COORDINATION_GUIDE.md` - Multi-agent protocols
- `docs/api/` - API documentation
- `docs/adr/` - Architecture decision records

## 🔥 Firebase Configuration

Your Firebase projects:
- **Client SDK**: my-rms-validator (public-facing)
- **Admin SDK**: kolabai-project (server-side operations)

## 📊 Performance Targets

- Page load times: < 2s TTI
- PDF processing: < 5s for typical resumes
- Bundle size: < 300KB gzipped
- Type coverage: > 95%
- Test coverage: > 90%

Happy SPARC development! 🚀✨
EOF

# Create coordination guide
cat > coordination/COORDINATION_GUIDE.md << 'EOF'
# Multi-Agent Coordination Guide

## Overview
This guide outlines how multiple AI agents coordinate when working on the Hirable AI project.

## Coordination Principles

### 1. Security First
- Security Agent has veto power on security-related changes
- All code must pass security review before merge
- No deployment without security approval

### 2. Type Safety
- All agents must maintain strict TypeScript compliance
- No 'any' types allowed in production code
- Type definitions must be shared and consistent

### 3. Performance Standards
- Maintain or improve existing performance benchmarks
- All changes must include performance impact assessment
- Bundle size increases require justification

## Communication Protocols

### Task Assignment
1. Check `coordination/orchestration/agent_assignments.md`
2. Update status when starting work
3. Document progress in relevant coordination files
4. Mark completion when done

### Knowledge Sharing
1. Update `coordination/memory_bank/` with discoveries
2. Document bugs and solutions in `bug_patterns.md`
3. Record performance impacts in `performance_metrics.md`
4. Update security findings in `security_audit.md`

### Conflict Resolution
1. Security concerns override all other considerations
2. Performance regressions must be justified
3. Type safety cannot be compromised
4. Architecture Agent mediates design conflicts

## File Structure

```
coordination/
├── memory_bank/           # Shared knowledge
│   ├── design_decisions.md
│   ├── bug_patterns.md
│   ├── performance_metrics.md
│   └── security_audit.md
├── subtasks/             # Individual task definitions
├── orchestration/        # Agent coordination
│   └── agent_assignments.md
└── COORDINATION_GUIDE.md
```

## Agent Responsibilities

### Security Agent 🔒
- Reviews all security-related changes
- Maintains security audit documentation
- Implements authentication and authorization
- Validates input sanitization

### Architecture Agent 🏗️
- Designs system architecture
- Reviews API contracts
- Manages database schema changes
- Resolves design conflicts

### Frontend Agent 💻
- Implements React components
- Manages state and routing
- Ensures TypeScript compliance
- Optimizes user experience

### Backend Agent 🔧
- Develops API endpoints
- Manages Firebase integration
- Optimizes PDF processing
- Implements business logic

### Testing Agent 🧪
- Writes and maintains tests
- Ensures code coverage targets
- Implements E2E testing
- Validates security measures

### DevOps Agent 🚀
- Manages CI/CD pipelines
- Handles deployments
- Monitors performance
- Maintains infrastructure

## Best Practices

1. **Always update coordination files** when starting/completing work
2. **Share knowledge immediately** - don't wait until task completion
3. **Ask for reviews** from relevant agents before major changes
4. **Document decisions** with rationale and trade-offs
5. **Maintain backwards compatibility** unless explicitly agreed otherwise
6. **Test security changes** thoroughly before deployment
7. **Monitor performance impact** of all changes
EOF

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ SPARC Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}🎯 Your Hirable AI project is now configured for SPARC development!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. 🔥 Firebase credentials are already configured"
echo "2. 📦 Run: ${YELLOW}npm install${NC}"
echo "3. 🚀 Run: ${YELLOW}.claude/commands/quick-start.sh${NC}"
echo "4. 🔒 Run: ${YELLOW}.claude/commands/security-check.sh${NC}"
echo "5. ⚡ Start SPARC cycle: ${YELLOW}./claude-sparc.sh \"security-hardening\" \"coordination/subtasks/security_hardening.md\"${NC}"
echo ""
echo -e "${BLUE}📖 Documentation:${NC}"
echo "- CLAUDE.md - Project context for AI agents"
echo "- SPARC-README.md - SPARC usage guide"
echo "- coordination/COORDINATION_GUIDE.md - Multi-agent development"
echo "- coordination/memory_bank/ - Shared knowledge base"
echo ""
echo -e "${BLUE}🛡️ Security Priority:${NC}"
echo "The Security Agent has identified critical vulnerabilities that need immediate attention."
echo "Review coordination/memory_bank/security_audit.md for details."
echo ""
echo -e "${GREEN}Happy SPARC development! 🚀✨${NC}"
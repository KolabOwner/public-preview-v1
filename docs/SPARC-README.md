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

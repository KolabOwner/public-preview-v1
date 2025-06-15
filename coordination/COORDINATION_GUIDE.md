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

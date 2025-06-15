import { BaseAgent } from './base-agent';
import { AgentTaskResult, Decision } from '../types';

export class ArchitectureAgent extends BaseAgent {
  role = 'architecture';
  priority = 'high' as const;
  vetoRights = false;
  responsibilities = [
    'system-design',
    'api-contracts',
    'database-schema',
    'integration-patterns',
    'scalability',
    'architectural-decisions',
    'design-patterns',
    'microservices',
    'component-design',
    'technical-debt'
  ];

  protected buildSystemPrompt(): string {
    return `You are a Software Architecture Expert Agent in the SPARC development framework.

Your primary responsibilities include:
- Designing scalable and maintainable system architectures
- Defining API contracts and integration patterns
- Creating efficient database schemas and data models
- Selecting appropriate design patterns and architectural styles
- Ensuring system scalability and performance
- Managing technical debt and architectural decisions

Key architectural principles to follow:
1. SOLID principles (Single Responsibility, Open/Closed, etc.)
2. DRY (Don't Repeat Yourself)
3. KISS (Keep It Simple, Stupid)
4. YAGNI (You Aren't Gonna Need It)
5. Separation of Concerns
6. High Cohesion, Low Coupling
7. Domain-Driven Design where appropriate

Architecture priorities:
- Scalability: Design for growth
- Maintainability: Easy to understand and modify
- Testability: Components should be easily testable
- Performance: Optimize critical paths
- Security: Security by design
- Flexibility: Accommodate future changes

Always document architectural decisions and trade-offs.`;
  }

  protected parseTaskResponse(content: string, task: any): AgentTaskResult {
    const baseResult = super.parseTaskResponse(content, task);
    const decisions: Decision[] = baseResult.decisions || [];

    // Architecture-specific parsing
    if (content.toLowerCase().includes('pattern')) {
      const patternMatch = content.match(/(?:using|implement|apply)\s+(\w+\s+pattern)/i);
      if (patternMatch) {
        decisions.push({
          type: 'design-pattern',
          description: `Apply ${patternMatch[1]}`,
          rationale: 'Established pattern for this use case',
          impact: 'medium'
        });
      }
    }

    // Check for scalability decisions
    if (content.toLowerCase().includes('scalab')) {
      decisions.push({
        type: 'scalability',
        description: 'Scalability considerations applied',
        rationale: 'System must handle growth',
        impact: 'high'
      });
    }

    // Check for API design decisions
    if (content.toLowerCase().includes('api') || content.toLowerCase().includes('endpoint')) {
      decisions.push({
        type: 'api-design',
        description: 'API contract defined',
        rationale: 'Clear interface contracts improve integration',
        impact: 'medium'
      });
    }

    return {
      ...baseResult,
      decisions: decisions.length > 0 ? decisions : baseResult.decisions
    };
  }
}
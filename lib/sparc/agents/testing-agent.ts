import { BaseAgent } from './base-agent';
import { AgentTaskResult, Decision } from '../types';

export class TestingAgent extends BaseAgent {
  role = 'testing';
  priority = 'high' as const;
  vetoRights = false;
  responsibilities = [
    'test-strategy',
    'test-implementation',
    'coverage-monitoring',
    'performance-testing',
    'security-testing',
    'unit-testing',
    'integration-testing',
    'e2e-testing',
    'test-automation',
    'quality-assurance'
  ];

  protected buildSystemPrompt(): string {
    return `You are a Testing and QA Expert Agent in the SPARC development framework.

Your primary responsibilities include:
- Developing comprehensive test strategies
- Writing unit, integration, and e2e tests
- Monitoring test coverage (target: ${this.config.sparc?.testDrivenDevelopment?.coverage?.target || 90}%)
- Implementing performance and security tests
- Ensuring code quality through automated testing

Testing principles (TDD London School):
1. Test First - Write tests before implementation
2. Red-Green-Refactor cycle
3. Test behavior, not implementation
4. Use mocks and stubs appropriately
5. Maintain high test coverage
6. Fast, Isolated, Repeatable, Self-validating, Timely (FIRST)

Testing stack expertise:
- Jest for unit testing
- React Testing Library for component tests
- Playwright/Cypress for E2E tests
- K6/Artillery for performance testing
- OWASP ZAP for security testing
- Mock Service Worker (MSW) for API mocking

Coverage targets:
- Lines: ${this.config.sparc?.testDrivenDevelopment?.coverage?.lines || 90}%
- Branches: ${this.config.sparc?.testDrivenDevelopment?.coverage?.branches || 85}%
- Functions: ${this.config.sparc?.testDrivenDevelopment?.coverage?.functions || 90}%
- Statements: ${this.config.sparc?.testDrivenDevelopment?.coverage?.statements || 90}%

Focus on writing meaningful tests that catch real bugs.`;
  }

  protected parseTaskResponse(content: string, task: any): AgentTaskResult {
    const baseResult = super.parseTaskResponse(content, task);
    const decisions: Decision[] = baseResult.decisions || [];

    // Testing-specific parsing
    if (content.toLowerCase().includes('unit test')) {
      decisions.push({
        type: 'testing',
        description: 'Unit tests implemented',
        rationale: 'Ensure individual components work correctly',
        impact: 'high'
      });
    }

    // Check for coverage decisions
    if (content.toLowerCase().includes('coverage')) {
      const coverageMatch = content.match(/(\d+)%\s*coverage/i);
      const coverage = coverageMatch ? parseInt(coverageMatch[1]) : 0;
      decisions.push({
        type: 'test-coverage',
        description: `Test coverage target: ${coverage}%`,
        rationale: 'High coverage reduces bug risk',
        impact: coverage >= 90 ? 'high' : 'medium'
      });
    }

    // Check for test strategy
    if (content.toLowerCase().includes('test strategy') ||
        content.toLowerCase().includes('testing approach')) {
      decisions.push({
        type: 'test-strategy',
        description: 'Comprehensive test strategy defined',
        rationale: 'Structured approach to quality assurance',
        impact: 'high'
      });
    }

    // Check for TDD mentions
    if (content.toLowerCase().includes('tdd') ||
        content.toLowerCase().includes('test-driven') ||
        content.toLowerCase().includes('red-green-refactor')) {
      decisions.push({
        type: 'methodology',
        description: 'TDD approach implemented',
        rationale: 'Test-first development improves design',
        impact: 'high'
      });
    }

    return {
      ...baseResult,
      decisions: decisions.length > 0 ? decisions : baseResult.decisions
    };
  }
}
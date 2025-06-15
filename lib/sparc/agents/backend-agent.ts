import { BaseAgent } from './base-agent';
import { AgentTaskResult, Decision } from '../types';

export class BackendAgent extends BaseAgent {
  role = 'backend';
  priority = 'high' as const;
  vetoRights = false;
  responsibilities = [
    'api-endpoints',
    'business-logic',
    'data-processing',
    'pdf-parsing',
    'ai-integration',
    'database-operations',
    'authentication-flow',
    'file-handling',
    'third-party-integration',
    'background-jobs'
  ];

  protected buildSystemPrompt(): string {
    return `You are a Backend Development Expert Agent in the SPARC development framework.

Your primary responsibilities include:
- Developing RESTful API endpoints with Next.js API routes
- Implementing complex business logic
- Processing and parsing PDF files
- Integrating AI services (Gemini, Claude, etc.)
- Managing database operations with Firestore
- Handling authentication and authorization flows
- Integrating third-party services

Backend development principles:
1. Clean Architecture - Separation of concerns
2. Error Handling - Comprehensive error handling and logging
3. Data Validation - Validate all inputs
4. Performance - Optimize database queries and API responses
5. Security - Implement security best practices
6. Scalability - Design for horizontal scaling
7. Testing - Unit and integration tests

Technology stack expertise:
- Node.js with TypeScript
- Next.js API Routes
- Firebase (Firestore, Auth, Storage)
- PDF parsing libraries (pdf-parse, pdfjs)
- AI integrations (Gemini, Anthropic)
- Redis for caching/queuing
- ExifTool for metadata

Focus on reliability, performance, and maintainability.`;
  }

  protected parseTaskResponse(content: string, task: any): AgentTaskResult {
    const baseResult = super.parseTaskResponse(content, task);
    const decisions: Decision[] = baseResult.decisions || [];

    // Backend-specific parsing
    if (content.toLowerCase().includes('api')) {
      decisions.push({
        type: 'api-design',
        description: 'API endpoint structure defined',
        rationale: 'RESTful design principles applied',
        impact: 'medium'
      });
    }

    // Check for data processing decisions
    if (content.toLowerCase().includes('data processing') ||
        content.toLowerCase().includes('pdf')) {
      decisions.push({
        type: 'data-processing',
        description: 'Data processing pipeline designed',
        rationale: 'Efficient data handling improves performance',
        impact: 'high'
      });
    }

    // Check for caching decisions
    if (content.toLowerCase().includes('cache') ||
        content.toLowerCase().includes('redis')) {
      decisions.push({
        type: 'caching',
        description: 'Caching strategy implemented',
        rationale: 'Reduce database load and improve response times',
        impact: 'medium'
      });
    }

    // Check for error handling
    if (content.toLowerCase().includes('error handling') ||
        content.toLowerCase().includes('exception')) {
      decisions.push({
        type: 'error-handling',
        description: 'Comprehensive error handling implemented',
        rationale: 'Improve reliability and debugging',
        impact: 'medium'
      });
    }

    return {
      ...baseResult,
      decisions: decisions.length > 0 ? decisions : baseResult.decisions
    };
  }
}
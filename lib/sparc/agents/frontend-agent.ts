import { BaseAgent } from './base-agent';
import { AgentTaskResult, Decision } from '../types';

export class FrontendAgent extends BaseAgent {
  role = 'frontend';
  priority = 'high' as const;
  vetoRights = false;
  responsibilities = [
    'react-components',
    'state-management',
    'ui-ux',
    'accessibility',
    'responsive-design',
    'user-interaction',
    'frontend-architecture',
    'performance-optimization',
    'css-styling',
    'component-testing'
  ];

  protected buildSystemPrompt(): string {
    return `You are a Frontend Development Expert Agent in the SPARC development framework.

Your primary responsibilities include:
- Building React components with TypeScript
- Implementing state management solutions
- Creating intuitive and accessible user interfaces
- Ensuring responsive design across devices
- Optimizing frontend performance
- Writing component tests

Frontend development principles:
1. Component Reusability - Create modular, reusable components
2. Accessibility (WCAG 2.1) - Ensure UI is accessible to all users
3. Performance - Optimize bundle size, lazy loading, code splitting
4. Responsive Design - Mobile-first approach
5. State Management - Use appropriate patterns (Context, Redux, Zustand)
6. Testing - Unit and integration tests for components
7. User Experience - Intuitive, consistent interactions

Technology stack expertise:
- React 18+ with TypeScript
- Next.js 14 App Router
- Tailwind CSS for styling
- React Hook Form for forms
- React Query/SWR for data fetching
- Jest/React Testing Library for testing

Always prioritize user experience and accessibility.`;
  }

  protected parseTaskResponse(content: string, task: any): AgentTaskResult {
    const baseResult = super.parseTaskResponse(content, task);
    const decisions: Decision[] = baseResult.decisions || [];

    // Frontend-specific parsing
    if (content.toLowerCase().includes('component')) {
      decisions.push({
        type: 'component-design',
        description: 'React component architecture defined',
        rationale: 'Modular component design improves reusability',
        impact: 'medium'
      });
    }

    // Check for accessibility decisions
    if (content.toLowerCase().includes('accessib') || 
        content.toLowerCase().includes('wcag') ||
        content.toLowerCase().includes('aria')) {
      decisions.push({
        type: 'accessibility',
        description: 'Accessibility standards implemented',
        rationale: 'WCAG 2.1 compliance ensures inclusive design',
        impact: 'high'
      });
    }

    // Check for performance optimizations
    if (content.toLowerCase().includes('performance') ||
        content.toLowerCase().includes('optimiz')) {
      decisions.push({
        type: 'performance',
        description: 'Frontend performance optimizations applied',
        rationale: 'Better performance improves user experience',
        impact: 'medium'
      });
    }

    // Check for responsive design
    if (content.toLowerCase().includes('responsive') ||
        content.toLowerCase().includes('mobile')) {
      decisions.push({
        type: 'responsive-design',
        description: 'Responsive design implemented',
        rationale: 'Multi-device support is essential',
        impact: 'medium'
      });
    }

    return {
      ...baseResult,
      decisions: decisions.length > 0 ? decisions : baseResult.decisions
    };
  }
}
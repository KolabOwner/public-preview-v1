import { BaseAgent } from './base-agent';
import { AgentTaskResult, Decision } from '../types';

export class SecurityAgent extends BaseAgent {
  role = 'security';
  priority = 'critical' as const;
  vetoRights = true;
  responsibilities = [
    'authentication',
    'authorization', 
    'encryption',
    'vulnerability-scanning',
    'compliance',
    'security-review',
    'threat-modeling',
    'access-control',
    'data-protection',
    'audit-logging'
  ];

  protected buildSystemPrompt(): string {
    return `You are a Security Expert Agent in the SPARC development framework.

Your primary responsibilities include:
- Ensuring all authentication and authorization mechanisms are secure
- Implementing proper encryption for data at rest and in transit
- Identifying and mitigating security vulnerabilities
- Ensuring compliance with security standards (OWASP, GDPR, etc.)
- Conducting security reviews and threat modeling
- Implementing secure coding practices

You have VETO rights on any decision that could compromise security.

Security priorities:
1. Prevent injection attacks (SQL, XSS, etc.)
2. Ensure proper authentication and session management
3. Protect sensitive data exposure
4. Implement proper access controls
5. Ensure security logging and monitoring
6. Validate all inputs and outputs
7. Use secure communication protocols
8. Implement proper error handling without information leakage

Always prioritize security over convenience. When in doubt, choose the more secure option.`;
  }

  protected parseTaskResponse(content: string, task: any): AgentTaskResult {
    const baseResult = super.parseTaskResponse(content, task);
    
    // Add security-specific parsing
    const decisions: Decision[] = baseResult.decisions || [];
    
    // Check for security vulnerabilities mentioned
    if (content.toLowerCase().includes('vulnerability') || 
        content.toLowerCase().includes('security risk')) {
      decisions.push({
        type: 'security',
        description: 'Security vulnerabilities identified',
        rationale: 'Must address security concerns before proceeding',
        impact: 'high'
      });
    }

    // Check for compliance requirements
    if (content.toLowerCase().includes('compliance') ||
        content.toLowerCase().includes('gdpr') ||
        content.toLowerCase().includes('owasp')) {
      decisions.push({
        type: 'compliance',
        description: 'Compliance requirements identified',
        rationale: 'Legal and regulatory compliance is mandatory',
        impact: 'high'
      });
    }

    return {
      ...baseResult,
      decisions: decisions.length > 0 ? decisions : baseResult.decisions
    };
  }
}
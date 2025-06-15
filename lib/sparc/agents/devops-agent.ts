import { BaseAgent } from './base-agent';
import { AgentTaskResult, Decision } from '../types';

export class DevOpsAgent extends BaseAgent {
  role = 'devops';
  priority = 'medium' as const;
  vetoRights = false;
  responsibilities = [
    'ci-cd',
    'deployment',
    'monitoring',
    'infrastructure',
    'performance-optimization',
    'containerization',
    'orchestration',
    'logging',
    'alerting',
    'disaster-recovery'
  ];

  protected buildSystemPrompt(): string {
    return `You are a DevOps Expert Agent in the SPARC development framework.

Your primary responsibilities include:
- Setting up CI/CD pipelines
- Managing deployments across environments
- Implementing monitoring and alerting
- Infrastructure as Code (IaC)
- Performance optimization and scaling
- Container orchestration
- Disaster recovery planning

DevOps principles:
1. Automation - Automate everything possible
2. Monitoring - You can't improve what you don't measure
3. Continuous Integration/Deployment
4. Infrastructure as Code
5. Security integration (DevSecOps)
6. Reliability and resilience
7. Cost optimization

Technology stack expertise:
- Vercel for Next.js deployment
- GitHub Actions for CI/CD
- Docker for containerization
- Terraform/Pulumi for IaC
- Prometheus/Grafana for monitoring
- ELK stack for logging
- Redis for caching/queuing
- Cloud platforms (GCP, AWS, Firebase)

Deployment environments:
- Development: Local/Firebase emulators
- Staging: Pre-production testing
- Production: High availability setup

Focus on reliability, scalability, and automated operations.`;
  }

  protected parseTaskResponse(content: string, task: any): AgentTaskResult {
    const baseResult = super.parseTaskResponse(content, task);
    const decisions: Decision[] = baseResult.decisions || [];

    // DevOps-specific parsing
    if (content.toLowerCase().includes('ci/cd') || 
        content.toLowerCase().includes('pipeline')) {
      decisions.push({
        type: 'ci-cd',
        description: 'CI/CD pipeline configured',
        rationale: 'Automated deployment reduces errors',
        impact: 'high'
      });
    }

    // Check for monitoring decisions
    if (content.toLowerCase().includes('monitoring') ||
        content.toLowerCase().includes('observability')) {
      decisions.push({
        type: 'monitoring',
        description: 'Monitoring and alerting implemented',
        rationale: 'Proactive issue detection',
        impact: 'high'
      });
    }

    // Check for infrastructure decisions
    if (content.toLowerCase().includes('infrastructure') ||
        content.toLowerCase().includes('iac')) {
      decisions.push({
        type: 'infrastructure',
        description: 'Infrastructure as Code implemented',
        rationale: 'Reproducible and version-controlled infrastructure',
        impact: 'high'
      });
    }

    // Check for performance/scaling
    if (content.toLowerCase().includes('scaling') ||
        content.toLowerCase().includes('performance')) {
      decisions.push({
        type: 'scalability',
        description: 'Auto-scaling configured',
        rationale: 'Handle traffic spikes efficiently',
        impact: 'medium'
      });
    }

    return {
      ...baseResult,
      decisions: decisions.length > 0 ? decisions : baseResult.decisions
    };
  }
}
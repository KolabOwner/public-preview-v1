import { BaseAgent } from './base-agent';
import { AgentTaskResult, Decision } from '../types';

export class GCPAgent extends BaseAgent {
  role = 'gcp';
  priority = 'high' as const;
  vetoRights = false;
  responsibilities = [
    'cloud-architecture',
    'gcp-services',
    'cloud-security',
    'cost-optimization',
    'cloud-functions',
    'cloud-storage',
    'bigquery',
    'cloud-run',
    'firestore',
    'identity-management',
    'api-gateway',
    'load-balancing'
  ];

  protected buildSystemPrompt(): string {
    return `You are a Google Cloud Platform Expert Agent in the SPARC development framework.

Your primary responsibilities include:
- Designing cloud-native architectures on GCP
- Implementing GCP services (Cloud Run, Functions, Storage, etc.)
- Ensuring cloud security best practices
- Optimizing cloud costs and resource usage
- Managing identity and access management (IAM)
- Implementing serverless solutions
- Designing data pipelines with BigQuery

GCP services expertise:
1. Compute: Cloud Run, Cloud Functions, GKE, Compute Engine
2. Storage: Cloud Storage, Firestore, Cloud SQL, BigQuery
3. Networking: Load Balancing, Cloud CDN, VPC
4. Security: IAM, Cloud KMS, Security Command Center
5. AI/ML: Vertex AI, Document AI, Vision API
6. Operations: Cloud Logging, Monitoring, Trace

Cloud architecture principles:
- Serverless first approach
- Multi-region high availability
- Security in depth
- Cost optimization
- Performance at scale
- Disaster recovery planning
- Zero-trust security model

Best practices:
- Use managed services when possible
- Implement proper IAM policies
- Enable audit logging
- Use VPC Service Controls
- Implement encryption at rest and in transit
- Monitor and alert on key metrics
- Optimize for cost and performance

Focus on scalable, secure, and cost-effective cloud solutions.`;
  }

  protected parseTaskResponse(content: string, task: any): AgentTaskResult {
    const baseResult = super.parseTaskResponse(content, task);
    const decisions: Decision[] = baseResult.decisions || [];

    // GCP-specific parsing
    if (content.toLowerCase().includes('cloud run') ||
        content.toLowerCase().includes('cloud functions')) {
      decisions.push({
        type: 'gcp-compute',
        description: 'Serverless compute solution selected',
        rationale: 'Scalable and cost-effective for variable workloads',
        impact: 'high'
      });
    }

    // Check for storage decisions
    if (content.toLowerCase().includes('firestore') ||
        content.toLowerCase().includes('cloud storage') ||
        content.toLowerCase().includes('bigquery')) {
      decisions.push({
        type: 'gcp-storage',
        description: 'GCP storage solution implemented',
        rationale: 'Managed storage with high availability',
        impact: 'high'
      });
    }

    // Check for security decisions
    if (content.toLowerCase().includes('iam') ||
        content.toLowerCase().includes('security') ||
        content.toLowerCase().includes('encryption')) {
      decisions.push({
        type: 'cloud-security',
        description: 'Cloud security measures implemented',
        rationale: 'Defense in depth for cloud resources',
        impact: 'high'
      });
    }

    // Check for cost optimization
    if (content.toLowerCase().includes('cost') ||
        content.toLowerCase().includes('budget')) {
      decisions.push({
        type: 'cost-optimization',
        description: 'Cost optimization strategies applied',
        rationale: 'Minimize cloud spending while maintaining performance',
        impact: 'medium'
      });
    }

    return {
      ...baseResult,
      decisions: decisions.length > 0 ? decisions : baseResult.decisions
    };
  }
}
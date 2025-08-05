export interface Job {
  id: string;
  type: 'pdf-parse' | 'resume-analysis';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  data: any;
  result?: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

class JobQueue {
  private jobs = new Map<string, Job>();
  private processing = new Set<string>();

  async enqueue(type: Job['type'], data: any): Promise<string> {
    const id = crypto.randomUUID();
    const job: Job = {
      id,
      type,
      status: 'pending',
      data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.jobs.set(id, job);
    this.processJob(id);
    return id;
  }

  async getJob(id: string): Promise<Job | null> {
    return this.jobs.get(id) || null;
  }

  private async processJob(id: string) {
    if (this.processing.has(id)) return;
    
    this.processing.add(id);
    const job = this.jobs.get(id);
    if (!job) return;

    try {
      job.status = 'processing';
      job.updatedAt = new Date();
      
      let result;
      switch (job.type) {
        case 'pdf-parse':
          const { PDFProcessor } = await import('@/lib/server/services/resume/pdf-generator');
          result = await PDFProcessor.processPDF(job.data.file, job.data.resumeId, job.data.options);
          break;
      }
      
      job.status = 'completed';
      job.result = result;
    } catch (error: any) {
      job.status = 'failed';
      job.error = error.message;
    } finally {
      job.updatedAt = new Date();
      this.processing.delete(id);
    }
  }
}

export const jobQueue = new JobQueue();
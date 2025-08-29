import { EventEmitter } from 'events';
import { Queue, Job } from 'bull';
import { PrintJob, PrintJobStatus, PrinterInfo } from '../types.js';
import { logger } from '../../utils/logger.js';

interface QueuedPrintJob extends PrintJob {
  attempts?: number;
  maxAttempts?: number;
  delay?: number;
  backoff?: 'fixed' | 'exponential';
}

export class PrintQueueManager extends EventEmitter {
  private printQueue: Queue<QueuedPrintJob>;
  private jobs = new Map<string, QueuedPrintJob>();
  private printerQueues = new Map<string, string[]>(); // printerId -> jobIds
  private currentJobs = new Map<string, string>(); // printerId -> current jobId
  private queuePaused = false;
  private maxConcurrentJobs = 10;
  private retryAttempts = 3;

  constructor(redisConfig?: any) {
    super();
    
    this.printQueue = new Queue<QueuedPrintJob>('print-jobs', {
      redis: redisConfig || {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379')
      },
      defaultJobOptions: {
        attempts: this.retryAttempts,
        backoff: {
          type: 'exponential',
          delay: 30000
        },
        removeOnComplete: 100,
        removeOnFail: 50
      }
    });

    this.setupQueueHandlers();
  }

  public async addJob(job: PrintJob, priority: number = 0): Promise<string> {
    try {
      const queuedJob: QueuedPrintJob = {
        ...job,
        status: PrintJobStatus.QUEUED,
        priority: priority,
        maxAttempts: this.retryAttempts
      };

      // Validate job
      this.validateJob(queuedJob);

      // Add to Bull queue
      const bullJob = await this.printQueue.add(queuedJob, {
        priority: priority,
        delay: queuedJob.delay || 0,
        attempts: queuedJob.maxAttempts || this.retryAttempts,
        backoff: queuedJob.backoff || 'exponential'
      });

      // Update local state
      this.jobs.set(job.id, queuedJob);
      
      if (!this.printerQueues.has(job.printerId)) {
        this.printerQueues.set(job.printerId, []);
      }
      this.printerQueues.get(job.printerId)!.push(job.id);

      logger.info(`Added print job ${job.id} to queue for printer ${job.printerId}`);
      this.emit('jobAdded', queuedJob);
      this.emit('queueUpdated');

      return job.id;
    } catch (error) {
      logger.error(`Failed to add job ${job.id} to queue:`, error);
      throw error;
    }
  }

  public async removeJob(jobId: string): Promise<void> {
    try {
      const job = this.jobs.get(jobId);
      if (!job) {
        throw new Error(`Job ${jobId} not found`);
      }

      // Find and remove from Bull queue
      const bullJobs = await this.printQueue.getJobs(['waiting', 'active', 'delayed']);
      const bullJob = bullJobs.find(bj => bj.data.id === jobId);
      
      if (bullJob) {
        await bullJob.remove();
      }

      // Update local state
      this.jobs.delete(jobId);
      
      const printerQueue = this.printerQueues.get(job.printerId);
      if (printerQueue) {
        const index = printerQueue.indexOf(jobId);
        if (index > -1) {
          printerQueue.splice(index, 1);
        }
      }

      // If this was the current job, clear it
      if (this.currentJobs.get(job.printerId) === jobId) {
        this.currentJobs.delete(job.printerId);
      }

      logger.info(`Removed job ${jobId} from queue`);
      this.emit('jobRemoved', job);
      this.emit('queueUpdated');
    } catch (error) {
      logger.error(`Failed to remove job ${jobId}:`, error);
      throw error;
    }
  }

  public async pauseJob(jobId: string): Promise<void> {
    try {
      const job = this.jobs.get(jobId);
      if (!job) {
        throw new Error(`Job ${jobId} not found`);
      }

      if (job.status !== PrintJobStatus.PRINTING && job.status !== PrintJobStatus.PREPARING) {
        throw new Error(`Cannot pause job ${jobId} in status ${job.status}`);
      }

      job.status = PrintJobStatus.PAUSED;
      this.jobs.set(jobId, job);

      logger.info(`Paused job ${jobId}`);
      this.emit('jobPaused', job);
      this.emit('queueUpdated');
    } catch (error) {
      logger.error(`Failed to pause job ${jobId}:`, error);
      throw error;
    }
  }

  public async resumeJob(jobId: string): Promise<void> {
    try {
      const job = this.jobs.get(jobId);
      if (!job) {
        throw new Error(`Job ${jobId} not found`);
      }

      if (job.status !== PrintJobStatus.PAUSED) {
        throw new Error(`Cannot resume job ${jobId} in status ${job.status}`);
      }

      job.status = PrintJobStatus.PRINTING;
      this.jobs.set(jobId, job);

      logger.info(`Resumed job ${jobId}`);
      this.emit('jobResumed', job);
      this.emit('queueUpdated');
    } catch (error) {
      logger.error(`Failed to resume job ${jobId}:`, error);
      throw error;
    }
  }

  public async cancelJob(jobId: string): Promise<void> {
    try {
      const job = this.jobs.get(jobId);
      if (!job) {
        throw new Error(`Job ${jobId} not found`);
      }

      job.status = PrintJobStatus.CANCELLED;
      job.endTime = new Date();
      this.jobs.set(jobId, job);

      // Remove from Bull queue
      const bullJobs = await this.printQueue.getJobs(['waiting', 'active', 'delayed']);
      const bullJob = bullJobs.find(bj => bj.data.id === jobId);
      
      if (bullJob) {
        await bullJob.remove();
      }

      logger.info(`Cancelled job ${jobId}`);
      this.emit('jobCancelled', job);
      this.emit('queueUpdated');
    } catch (error) {
      logger.error(`Failed to cancel job ${jobId}:`, error);
      throw error;
    }
  }

  public async reorderJob(jobId: string, newPosition: number): Promise<void> {
    try {
      const job = this.jobs.get(jobId);
      if (!job) {
        throw new Error(`Job ${jobId} not found`);
      }

      if (job.status !== PrintJobStatus.QUEUED) {
        throw new Error(`Cannot reorder job ${jobId} in status ${job.status}`);
      }

      const printerQueue = this.printerQueues.get(job.printerId);
      if (!printerQueue) {
        throw new Error(`No queue found for printer ${job.printerId}`);
      }

      // Remove from current position
      const currentIndex = printerQueue.indexOf(jobId);
      if (currentIndex > -1) {
        printerQueue.splice(currentIndex, 1);
      }

      // Insert at new position
      const insertIndex = Math.min(newPosition, printerQueue.length);
      printerQueue.splice(insertIndex, 0, jobId);

      // Update priority in Bull queue
      const bullJobs = await this.printQueue.getJobs(['waiting', 'delayed']);
      const bullJob = bullJobs.find(bj => bj.data.id === jobId);
      
      if (bullJob) {
        const newPriority = printerQueue.length - insertIndex;
        await bullJob.changePriority(newPriority);
      }

      logger.info(`Reordered job ${jobId} to position ${newPosition}`);
      this.emit('jobReordered', { jobId, oldPosition: currentIndex, newPosition: insertIndex });
      this.emit('queueUpdated');
    } catch (error) {
      logger.error(`Failed to reorder job ${jobId}:`, error);
      throw error;
    }
  }

  public updateJobProgress(jobId: string, progress: number, remainingTime?: number): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.progress = progress;
      if (remainingTime !== undefined) {
        job.remainingTime = remainingTime;
      }
      
      this.jobs.set(jobId, job);
      this.emit('jobProgress', job);
    }
  }

  public markJobCompleted(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = PrintJobStatus.COMPLETED;
      job.progress = 100;
      job.endTime = new Date();
      
      this.jobs.set(jobId, job);
      this.currentJobs.delete(job.printerId);
      
      logger.info(`Job ${jobId} completed`);
      this.emit('jobCompleted', job);
      this.emit('queueUpdated');
    }
  }

  public markJobFailed(jobId: string, error: string): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = PrintJobStatus.FAILED;
      job.endTime = new Date();
      
      this.jobs.set(jobId, job);
      this.currentJobs.delete(job.printerId);
      
      logger.error(`Job ${jobId} failed: ${error}`);
      this.emit('jobFailed', { job, error });
      this.emit('queueUpdated');
    }
  }

  public async pauseQueue(): Promise<void> {
    await this.printQueue.pause();
    this.queuePaused = true;
    logger.info('Print queue paused');
    this.emit('queuePaused');
  }

  public async resumeQueue(): Promise<void> {
    await this.printQueue.resume();
    this.queuePaused = false;
    logger.info('Print queue resumed');
    this.emit('queueResumed');
  }

  public getQueue(): PrintJob[] {
    return Array.from(this.jobs.values()).sort((a, b) => {
      // Sort by priority (higher first), then by creation time
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return (a.startTime?.getTime() || 0) - (b.startTime?.getTime() || 0);
    });
  }

  public getPrinterQueue(printerId: string): PrintJob[] {
    const jobIds = this.printerQueues.get(printerId) || [];
    return jobIds.map(id => this.jobs.get(id)).filter(Boolean) as PrintJob[];
  }

  public getJob(jobId: string): PrintJob | undefined {
    return this.jobs.get(jobId);
  }

  public getCurrentJob(printerId: string): PrintJob | undefined {
    const jobId = this.currentJobs.get(printerId);
    return jobId ? this.jobs.get(jobId) : undefined;
  }

  public getQueueStats(): any {
    const stats = {
      total: this.jobs.size,
      queued: 0,
      printing: 0,
      paused: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
      byPrinter: {} as Record<string, number>
    };

    this.jobs.forEach(job => {
      stats[job.status as keyof typeof stats]++;
      
      if (!stats.byPrinter[job.printerId]) {
        stats.byPrinter[job.printerId] = 0;
      }
      stats.byPrinter[job.printerId]++;
    });

    return stats;
  }

  private setupQueueHandlers(): void {
    // Handle job processing
    this.printQueue.process(async (bullJob: Job<QueuedPrintJob>) => {
      const job = bullJob.data;
      logger.info(`Processing job ${job.id} for printer ${job.printerId}`);

      try {
        // Mark as current job
        this.currentJobs.set(job.printerId, job.id);
        
        // Update job status
        job.status = PrintJobStatus.PREPARING;
        job.startTime = new Date();
        this.jobs.set(job.id, job);
        
        this.emit('jobStarted', job);
        this.emit('queueUpdated');

        // This would be handled by the printer manager
        return job;
      } catch (error) {
        logger.error(`Failed to process job ${job.id}:`, error);
        throw error;
      }
    });

    // Handle completed jobs
    this.printQueue.on('completed', (bullJob: Job<QueuedPrintJob>) => {
      const job = bullJob.data;
      logger.info(`Job ${job.id} completed by Bull queue`);
      // The actual completion is handled by markJobCompleted
    });

    // Handle failed jobs
    this.printQueue.on('failed', (bullJob: Job<QueuedPrintJob>, error: Error) => {
      const job = bullJob.data;
      logger.error(`Job ${job.id} failed in Bull queue:`, error);
      this.markJobFailed(job.id, error.message);
    });

    // Handle stalled jobs
    this.printQueue.on('stalled', (bullJob: Job<QueuedPrintJob>) => {
      const job = bullJob.data;
      logger.warn(`Job ${job.id} stalled`);
      this.emit('jobStalled', job);
    });

    // Handle queue errors
    this.printQueue.on('error', (error: Error) => {
      logger.error('Print queue error:', error);
      this.emit('queueError', error);
    });
  }

  private validateJob(job: QueuedPrintJob): void {
    if (!job.id) {
      throw new Error('Job ID is required');
    }
    
    if (!job.printerId) {
      throw new Error('Printer ID is required');
    }
    
    if (!job.fileName) {
      throw new Error('File name is required');
    }
    
    if (!job.filePath && !job.gcode) {
      throw new Error('Either file path or G-code content is required');
    }

    if (job.priority < 0 || job.priority > 10) {
      throw new Error('Priority must be between 0 and 10');
    }
  }

  public async cleanup(): Promise<void> {
    try {
      await this.printQueue.close();
      this.jobs.clear();
      this.printerQueues.clear();
      this.currentJobs.clear();
      logger.info('Print queue manager cleaned up');
    } catch (error) {
      logger.error('Error during queue cleanup:', error);
      throw error;
    }
  }
}
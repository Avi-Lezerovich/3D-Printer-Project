import { Queue, Job, Worker } from 'bullmq';
import { EventEmitter } from 'events';
import { PrintJob, PrintJobStatus, PrinterStatus } from '../printer/types.js';
import { logger } from '../utils/logger.js';

export interface SchedulingJob {
  id: string;
  type: 'schedule' | 'optimize' | 'reschedule' | 'cleanup';
  priority: number;
  data: {
    printJobs?: PrintJob[];
    printerIds?: string[];
    constraints?: SchedulingConstraints;
    reschedulingReason?: string;
  };
  scheduledFor?: Date;
}

export interface SchedulingConstraints {
  maxPrintTime?: number;
  requiredPrinterTypes?: string[];
  preferredPrinters?: string[];
  excludedPrinters?: string[];
  powerConsumptionLimit?: number;
  workingHours?: {
    start: string; // HH:mm format
    end: string;   // HH:mm format
    timezone: string;
  };
  maintenanceWindows?: Array<{
    start: Date;
    end: Date;
    affectedPrinters: string[];
  }>;
}

export interface OptimizedSchedule {
  scheduleId: string;
  generatedAt: Date;
  assignments: Array<{
    jobId: string;
    printerId: string;
    estimatedStartTime: Date;
    estimatedEndTime: Date;
    priority: number;
    confidence: number;
  }>;
  metrics: {
    totalJobs: number;
    averageWaitTime: number;
    printerUtilization: Record<string, number>;
    estimatedCompletionTime: Date;
    powerConsumption: number;
  };
  alternatives?: OptimizedSchedule[];
}

export class PrintScheduler extends EventEmitter {
  private queue: Queue<SchedulingJob>;
  private worker: Worker<SchedulingJob, OptimizedSchedule>;
  private activeSchedules = new Map<string, OptimizedSchedule>();
  private printerCapabilities = new Map<string, any>();
  private schedulingConstraints: SchedulingConstraints = {};
  private optimizationEnabled = true;

  constructor(redisConfig?: any) {
    super();

    this.queue = new Queue<SchedulingJob>('print-scheduling', {
      connection: redisConfig || {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379')
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        },
        removeOnComplete: 100,
        removeOnFail: 50
      }
    });

    this.worker = new Worker<SchedulingJob, OptimizedSchedule>(
      'print-scheduling',
      this.processSchedulingJob.bind(this),
      {
        connection: redisConfig || {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379')
        },
        concurrency: 1 // Scheduling should be sequential to avoid conflicts
      }
    );

    this.setupWorkerHandlers();
    this.startPeriodicOptimization();
  }

  public async scheduleJobs(jobs: PrintJob[], constraints?: SchedulingConstraints): Promise<string> {
    try {
      const schedulingJob: SchedulingJob = {
        id: `schedule_${Date.now()}`,
        type: 'schedule',
        priority: 10,
        data: {
          printJobs: jobs,
          constraints: { ...this.schedulingConstraints, ...constraints }
        }
      };

      const bullJob = await this.queue.add('schedule', schedulingJob, {
        priority: schedulingJob.priority
      });

      logger.info(`Added ${jobs.length} jobs to scheduling queue`);
      return bullJob.id!;
    } catch (error) {
      logger.error('Failed to schedule jobs:', error);
      throw error;
    }
  }

  public async optimizeSchedule(printerIds?: string[]): Promise<string> {
    try {
      const schedulingJob: SchedulingJob = {
        id: `optimize_${Date.now()}`,
        type: 'optimize',
        priority: 5,
        data: {
          printerIds,
          constraints: this.schedulingConstraints
        }
      };

      const bullJob = await this.queue.add('optimize', schedulingJob);
      logger.info('Added schedule optimization to queue');
      return bullJob.id!;
    } catch (error) {
      logger.error('Failed to optimize schedule:', error);
      throw error;
    }
  }

  public async rescheduleJobs(reason: string, affectedJobs?: string[]): Promise<string> {
    try {
      const schedulingJob: SchedulingJob = {
        id: `reschedule_${Date.now()}`,
        type: 'reschedule',
        priority: 8,
        data: {
          reschedulingReason: reason,
          printJobs: affectedJobs ? await this.getJobsByIds(affectedJobs) : undefined,
          constraints: this.schedulingConstraints
        }
      };

      const bullJob = await this.queue.add('reschedule', schedulingJob);
      logger.info(`Rescheduling jobs due to: ${reason}`);
      return bullJob.id!;
    } catch (error) {
      logger.error('Failed to reschedule jobs:', error);
      throw error;
    }
  }

  public updatePrinterCapabilities(printerId: string, capabilities: any): void {
    this.printerCapabilities.set(printerId, capabilities);
    logger.debug(`Updated capabilities for printer ${printerId}`);
  }

  public updateSchedulingConstraints(constraints: Partial<SchedulingConstraints>): void {
    this.schedulingConstraints = { ...this.schedulingConstraints, ...constraints };
    logger.info('Updated scheduling constraints');
  }

  public getActiveSchedule(scheduleId: string): OptimizedSchedule | undefined {
    return this.activeSchedules.get(scheduleId);
  }

  public getAllActiveSchedules(): OptimizedSchedule[] {
    return Array.from(this.activeSchedules.values());
  }

  private async processSchedulingJob(job: Job<SchedulingJob>): Promise<OptimizedSchedule> {
    const { data } = job;
    const startTime = Date.now();

    try {
      logger.info(`Processing ${data.type} job: ${data.id}`);

      let result: OptimizedSchedule;

      switch (data.type) {
        case 'schedule':
          result = await this.createOptimizedSchedule(data.printJobs || [], data.constraints);
          break;
        case 'optimize':
          result = await this.optimizeExistingSchedule(data.printerIds, data.constraints);
          break;
        case 'reschedule':
          result = await this.rescheduleExistingJobs(data.printJobs || [], data.reschedulingReason);
          break;
        case 'cleanup':
          result = await this.cleanupSchedules();
          break;
        default:
          throw new Error(`Unknown scheduling job type: ${data.type}`);
      }

      const processingTime = Date.now() - startTime;
      logger.info(`Completed ${data.type} job in ${processingTime}ms`);

      this.activeSchedules.set(result.scheduleId, result);
      this.emit('scheduleGenerated', result);

      return result;
    } catch (error) {
      logger.error(`Failed to process ${data.type} job:`, error);
      throw error;
    }
  }

  private async createOptimizedSchedule(jobs: PrintJob[], constraints?: SchedulingConstraints): Promise<OptimizedSchedule> {
    const scheduleId = `schedule_${Date.now()}`;
    const availablePrinters = await this.getAvailablePrinters();
    const assignments: OptimizedSchedule['assignments'] = [];

    // Sort jobs by priority and estimated print time
    const sortedJobs = this.sortJobsByPriority(jobs);

    // Get current time for scheduling
    const now = new Date();
    let printerSchedules = new Map<string, Date>(); // printerId -> next available time

    // Initialize printer schedules
    availablePrinters.forEach(printerId => {
      printerSchedules.set(printerId, now);
    });

    for (const job of sortedJobs) {
      const assignment = await this.assignJobToPrinter(
        job,
        printerSchedules,
        constraints
      );

      if (assignment) {
        assignments.push(assignment);
        
        // Update printer schedule
        const currentEndTime = printerSchedules.get(assignment.printerId) || now;
        const newEndTime = new Date(Math.max(
          currentEndTime.getTime(),
          assignment.estimatedEndTime.getTime()
        ));
        printerSchedules.set(assignment.printerId, newEndTime);
      }
    }

    // Calculate metrics
    const metrics = this.calculateScheduleMetrics(assignments, printerSchedules);

    const optimizedSchedule: OptimizedSchedule = {
      scheduleId,
      generatedAt: new Date(),
      assignments,
      metrics
    };

    // Generate alternatives if optimization is enabled
    if (this.optimizationEnabled) {
      optimizedSchedule.alternatives = await this.generateAlternativeSchedules(
        jobs,
        constraints,
        optimizedSchedule
      );
    }

    return optimizedSchedule;
  }

  private async assignJobToPrinter(
    job: PrintJob,
    printerSchedules: Map<string, Date>,
    constraints?: SchedulingConstraints
  ): Promise<OptimizedSchedule['assignments'][0] | null> {
    const availablePrinters = this.filterPrintersForJob(job, constraints);
    let bestAssignment: OptimizedSchedule['assignments'][0] | null = null;
    let earliestStartTime = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now

    for (const printerId of availablePrinters) {
      const printerCapability = this.printerCapabilities.get(printerId);
      const nextAvailable = printerSchedules.get(printerId) || new Date();

      // Check if job fits within constraints
      if (!this.jobFitsConstraints(job, printerId, nextAvailable, constraints)) {
        continue;
      }

      const estimatedStartTime = this.calculateStartTime(nextAvailable, constraints);
      const estimatedEndTime = new Date(
        estimatedStartTime.getTime() + (job.estimatedTime || 3600) * 1000
      );

      // Calculate confidence score based on printer suitability
      const confidence = this.calculateAssignmentConfidence(job, printerId, printerCapability);

      if (estimatedStartTime < earliestStartTime) {
        earliestStartTime = estimatedStartTime;
        bestAssignment = {
          jobId: job.id,
          printerId,
          estimatedStartTime,
          estimatedEndTime,
          priority: job.priority,
          confidence
        };
      }
    }

    return bestAssignment;
  }

  private filterPrintersForJob(job: PrintJob, constraints?: SchedulingConstraints): string[] {
    const allPrinters = Array.from(this.printerCapabilities.keys());

    return allPrinters.filter(printerId => {
      const capability = this.printerCapabilities.get(printerId);

      // Check excluded printers
      if (constraints?.excludedPrinters?.includes(printerId)) {
        return false;
      }

      // Check preferred printers (if specified, only use those)
      if (constraints?.preferredPrinters?.length && 
          !constraints.preferredPrinters.includes(printerId)) {
        return false;
      }

      // Check required printer types
      if (constraints?.requiredPrinterTypes?.length &&
          !constraints.requiredPrinterTypes.includes(capability?.type)) {
        return false;
      }

      // Check if printer can handle the job requirements
      if (job.temperatureHotend && capability?.maxTempHotend < job.temperatureHotend) {
        return false;
      }

      if (job.temperatureBed && capability?.maxTempBed < job.temperatureBed) {
        return false;
      }

      return true;
    });
  }

  private jobFitsConstraints(
    job: PrintJob,
    printerId: string,
    startTime: Date,
    constraints?: SchedulingConstraints
  ): boolean {
    // Check maximum print time
    if (constraints?.maxPrintTime && (job.estimatedTime || 0) > constraints.maxPrintTime) {
      return false;
    }

    // Check working hours
    if (constraints?.workingHours) {
      const jobEndTime = new Date(startTime.getTime() + (job.estimatedTime || 3600) * 1000);
      if (!this.isWithinWorkingHours(startTime, jobEndTime, constraints.workingHours)) {
        return false;
      }
    }

    // Check maintenance windows
    if (constraints?.maintenanceWindows) {
      const jobEndTime = new Date(startTime.getTime() + (job.estimatedTime || 3600) * 1000);
      for (const window of constraints.maintenanceWindows) {
        if (window.affectedPrinters.includes(printerId) &&
            this.overlapsTimeWindow(startTime, jobEndTime, window.start, window.end)) {
          return false;
        }
      }
    }

    return true;
  }

  private calculateStartTime(nextAvailable: Date, constraints?: SchedulingConstraints): Date {
    let startTime = new Date(Math.max(nextAvailable.getTime(), Date.now()));

    // Adjust for working hours if specified
    if (constraints?.workingHours) {
      startTime = this.adjustToWorkingHours(startTime, constraints.workingHours);
    }

    return startTime;
  }

  private calculateAssignmentConfidence(job: PrintJob, printerId: string, capability: any): number {
    let confidence = 0.5; // Base confidence

    // Boost confidence for compatible printer types
    if (capability?.type === job.settings?.quality) {
      confidence += 0.2;
    }

    // Boost confidence for printers with better capabilities
    if (capability?.maxTempHotend >= (job.temperatureHotend || 0)) {
      confidence += 0.1;
    }

    if (capability?.maxTempBed >= (job.temperatureBed || 0)) {
      confidence += 0.1;
    }

    // Reduce confidence for overloaded printers
    // This would require checking current printer workload
    
    return Math.min(1.0, Math.max(0.0, confidence));
  }

  private sortJobsByPriority(jobs: PrintJob[]): PrintJob[] {
    return jobs.sort((a, b) => {
      // Sort by priority first (higher priority first)
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      
      // Then by queued time (older first)
      return a.queuedAt.getTime() - b.queuedAt.getTime();
    });
  }

  private calculateScheduleMetrics(
    assignments: OptimizedSchedule['assignments'],
    printerSchedules: Map<string, Date>
  ): OptimizedSchedule['metrics'] {
    const totalJobs = assignments.length;
    const now = new Date();

    // Calculate average wait time
    const totalWaitTime = assignments.reduce((sum, assignment) => {
      return sum + (assignment.estimatedStartTime.getTime() - now.getTime());
    }, 0);
    const averageWaitTime = totalJobs > 0 ? totalWaitTime / totalJobs / 1000 / 60 : 0; // in minutes

    // Calculate printer utilization
    const printerUtilization: Record<string, number> = {};
    printerSchedules.forEach((endTime, printerId) => {
      const totalTime = endTime.getTime() - now.getTime();
      const utilizationHours = Math.max(0, totalTime / 1000 / 60 / 60);
      printerUtilization[printerId] = Math.min(100, (utilizationHours / 24) * 100); // 24h window
    });

    // Find estimated completion time
    const estimatedCompletionTime = new Date(Math.max(...Array.from(printerSchedules.values()).map(d => d.getTime())));

    // Estimate power consumption (placeholder calculation)
    const powerConsumption = assignments.length * 0.2; // kWh per job

    return {
      totalJobs,
      averageWaitTime,
      printerUtilization,
      estimatedCompletionTime,
      powerConsumption
    };
  }

  private async optimizeExistingSchedule(printerIds?: string[], constraints?: SchedulingConstraints): Promise<OptimizedSchedule> {
    // Get current pending jobs
    const pendingJobs = await this.getPendingJobs(printerIds);
    return this.createOptimizedSchedule(pendingJobs, constraints);
  }

  private async rescheduleExistingJobs(jobs: PrintJob[], reason?: string): Promise<OptimizedSchedule> {
    logger.info(`Rescheduling ${jobs.length} jobs due to: ${reason}`);
    return this.createOptimizedSchedule(jobs, this.schedulingConstraints);
  }

  private async cleanupSchedules(): Promise<OptimizedSchedule> {
    // Remove old schedules
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago
    
    for (const [scheduleId, schedule] of this.activeSchedules) {
      if (schedule.generatedAt.getTime() < cutoffTime) {
        this.activeSchedules.delete(scheduleId);
      }
    }

    // Return empty schedule as cleanup result
    return {
      scheduleId: 'cleanup_result',
      generatedAt: new Date(),
      assignments: [],
      metrics: {
        totalJobs: 0,
        averageWaitTime: 0,
        printerUtilization: {},
        estimatedCompletionTime: new Date(),
        powerConsumption: 0
      }
    };
  }

  private async generateAlternativeSchedules(
    jobs: PrintJob[],
    constraints?: SchedulingConstraints,
    baseSchedule?: OptimizedSchedule
  ): Promise<OptimizedSchedule[]> {
    const alternatives: OptimizedSchedule[] = [];

    // Generate alternative with different priorities
    const alternativeJobs = jobs.map(job => ({
      ...job,
      priority: Math.random() * 10
    }));

    const alternative = await this.createOptimizedSchedule(alternativeJobs, constraints);
    alternatives.push(alternative);

    return alternatives;
  }

  private isWithinWorkingHours(
    startTime: Date,
    endTime: Date,
    workingHours: SchedulingConstraints['workingHours']
  ): boolean {
    if (!workingHours) return true;

    // Simplified check - would need proper timezone handling in production
    const startHour = startTime.getHours();
    const endHour = endTime.getHours();
    const workStart = parseInt(workingHours.start.split(':')[0]);
    const workEnd = parseInt(workingHours.end.split(':')[0]);

    return startHour >= workStart && endHour <= workEnd;
  }

  private overlapsTimeWindow(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
    return start1 < end2 && end1 > start2;
  }

  private adjustToWorkingHours(
    time: Date,
    workingHours: SchedulingConstraints['workingHours']
  ): Date {
    // Simplified adjustment - move to next working day if outside hours
    const hour = time.getHours();
    const workStart = parseInt(workingHours.start.split(':')[0]);
    const workEnd = parseInt(workingHours.end.split(':')[0]);

    if (hour < workStart) {
      const adjusted = new Date(time);
      adjusted.setHours(workStart, 0, 0, 0);
      return adjusted;
    } else if (hour >= workEnd) {
      const adjusted = new Date(time);
      adjusted.setDate(adjusted.getDate() + 1);
      adjusted.setHours(workStart, 0, 0, 0);
      return adjusted;
    }

    return time;
  }

  private async getAvailablePrinters(): Promise<string[]> {
    // This would integrate with printer manager to get available printers
    return Array.from(this.printerCapabilities.keys());
  }

  private async getJobsByIds(jobIds: string[]): Promise<PrintJob[]> {
    // This would integrate with job manager to fetch jobs
    return [];
  }

  private async getPendingJobs(printerIds?: string[]): Promise<PrintJob[]> {
    // This would integrate with job manager to get pending jobs
    return [];
  }

  private setupWorkerHandlers(): void {
    this.worker.on('completed', (job, result) => {
      logger.info(`Scheduling job completed: ${job.data.id}`);
      this.emit('schedulingCompleted', { job: job.data, result });
    });

    this.worker.on('failed', (job, error) => {
      logger.error(`Scheduling job failed: ${job?.data?.id}`, error);
      this.emit('schedulingFailed', { job: job?.data, error: error.message });
    });

    this.worker.on('error', (error) => {
      logger.error('Print scheduler worker error:', error);
      this.emit('workerError', error);
    });
  }

  private startPeriodicOptimization(): void {
    // Run optimization every 15 minutes
    setInterval(() => {
      this.optimizeSchedule().catch(error => {
        logger.error('Periodic optimization failed:', error);
      });
    }, 15 * 60 * 1000);
  }

  public async getQueueStats(): Promise<any> {
    const waiting = await this.queue.getWaiting();
    const active = await this.queue.getActive();
    const completed = await this.queue.getCompleted();
    const failed = await this.queue.getFailed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      activeSchedules: this.activeSchedules.size
    };
  }

  public async cleanup(): Promise<void> {
    await this.worker.close();
    await this.queue.close();
    this.activeSchedules.clear();
    logger.info('Print scheduler cleaned up');
  }
}
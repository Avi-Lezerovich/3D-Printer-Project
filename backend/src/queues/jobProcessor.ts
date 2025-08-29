import Bull, { Job } from 'bull'
import { logger } from '../utils/logger.js'
import { Repositories } from '../repositories/types.js'

export enum JobType {
  CLEANUP_TOKENS = 'cleanup-tokens',
  EMAIL_NOTIFICATION = 'email-notification',
  DATA_EXPORT = 'data-export',
  METRICS_AGGREGATION = 'metrics-aggregation',
  CACHE_WARMUP = 'cache-warmup',
  USER_ANALYTICS = 'user-analytics'
}

export interface JobData {
  [JobType.CLEANUP_TOKENS]: {
    repositoriesFactory: () => Promise<Repositories>
  }
  [JobType.EMAIL_NOTIFICATION]: {
    to: string
    subject: string
    template: string
    data: Record<string, any>
  }
  [JobType.DATA_EXPORT]: {
    userId: string
    exportType: 'projects' | 'analytics' | 'full'
    format: 'json' | 'csv'
  }
  [JobType.METRICS_AGGREGATION]: {
    timeRange: string
    metrics: string[]
  }
  [JobType.CACHE_WARMUP]: {
    cacheKeys: string[]
    dataSource: string
  }
  [JobType.USER_ANALYTICS]: {
    userId: string
    event: string
    metadata: Record<string, any>
  }
}

export class JobProcessor {
  private queues = new Map<JobType, Bull.Queue>()
  private repositories: Repositories | null = null
  private isInitialized = false

  constructor() {
    this.setupQueues()
    this.setupWorkers()
    this.setupEventListeners()
  }

  setRepositories(repos: Repositories): void {
    this.repositories = repos
  }

  private getRedisConfig() {
    const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379'
    const url = new URL(redisUrl)
    
    return {
      host: url.hostname,
      port: parseInt(url.port) || 6379,
      password: url.password || undefined,
      db: 1, // Use different database for jobs
    }
  }

  private setupQueues(): void {
    const redisConfig = this.getRedisConfig()
    
    Object.values(JobType).forEach(jobType => {
      const queue = new Bull(jobType, {
        redis: redisConfig,
        defaultJobOptions: {
          removeOnComplete: 50,
          removeOnFail: 100,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000
          },
          timeout: 30000 // 30 seconds timeout
        },
        settings: {
          stalledInterval: 30 * 1000,
          maxStalledCount: 1
        }
      })
      
      this.queues.set(jobType, queue)
      logger.info({ jobType }, 'Job queue initialized')
    })
  }

  private setupWorkers(): void {
    // Token cleanup worker
    this.queues.get(JobType.CLEANUP_TOKENS)?.process(async (job: Job) => {
      const { repositoriesFactory } = job.data
      const repos = await repositoriesFactory()
      const removed = await repos.users.cleanupExpiredRefreshTokens()
      
      logger.info({ removed, jobId: job.id }, 'Token cleanup completed')
      return { removed, timestamp: new Date().toISOString() }
    })

    // Email notification worker
    this.queues.get(JobType.EMAIL_NOTIFICATION)?.process(5, async (job: Job) => {
      const { to, subject, template, data } = job.data
      
      // Simulate email sending (replace with actual email service)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000))
      
      logger.info({ to, subject, template, jobId: job.id }, 'Email notification sent')
      return { sent: true, timestamp: new Date().toISOString() }
    })

    // Data export worker
    this.queues.get(JobType.DATA_EXPORT)?.process(2, async (job: Job) => {
      const { userId, exportType, format } = job.data
      
      if (!this.repositories) {
        throw new Error('Repositories not initialized')
      }

      const exportData = await this.generateExportData(userId, exportType, format)
      
      logger.info({ userId, exportType, format, size: exportData.length, jobId: job.id }, 'Data export completed')
      return { 
        exportUrl: `/exports/${job.id}.${format}`,
        size: exportData.length,
        timestamp: new Date().toISOString()
      }
    })

    // Metrics aggregation worker
    this.queues.get(JobType.METRICS_AGGREGATION)?.process(3, async (job: Job) => {
      const { timeRange, metrics } = job.data
      
      const aggregated = await this.aggregateMetrics(timeRange, metrics)
      await this.storeAggregatedMetrics(aggregated)
      
      logger.info({ timeRange, metricsCount: metrics.length, jobId: job.id }, 'Metrics aggregation completed')
      return aggregated
    })

    // Cache warmup worker
    this.queues.get(JobType.CACHE_WARMUP)?.process(async (job: Job) => {
      const { cacheKeys, dataSource } = job.data
      
      const warmedUp = await this.warmupCache(cacheKeys, dataSource)
      
      logger.info({ cacheKeys: cacheKeys.length, warmedUp, jobId: job.id }, 'Cache warmup completed')
      return { warmedUp, timestamp: new Date().toISOString() }
    })

    // User analytics worker  
    this.queues.get(JobType.USER_ANALYTICS)?.process(10, async (job: Job) => {
      const { userId, event, metadata } = job.data
      
      await this.processUserAnalytics(userId, event, metadata)
      
      logger.debug({ userId, event, jobId: job.id }, 'User analytics processed')
      return { processed: true, timestamp: new Date().toISOString() }
    })

    logger.info('All job workers initialized')
  }

  private setupEventListeners(): void {
    this.queues.forEach((queue, jobType) => {
      queue.on('completed', (job: Job, result: any) => {
        logger.debug({ jobType, jobId: job.id, result }, 'Job completed')
      })

      queue.on('failed', (job: Job, err: Error) => {
        logger.error({ jobType, jobId: job.id, error: err.message }, 'Job failed')
      })

      queue.on('stalled', (job: Job) => {
        logger.warn({ jobType, jobId: job.id }, 'Job stalled')
      })

      queue.on('error', (error: Error) => {
        logger.error({ jobType, error: error.message }, 'Queue error')
      })
    })
  }

  async addJob<T extends JobType>(
    type: T, 
    data: JobData[T], 
    options?: Bull.JobOptions
  ): Promise<Bull.Job<JobData[T]>> {
    const queue = this.queues.get(type)
    if (!queue) {
      throw new Error(`Queue ${type} not found`)
    }
    
    const job = await queue.add(data, {
      priority: options?.priority || 0,
      delay: options?.delay || 0,
      attempts: options?.attempts || 3,
      ...options
    })
    
    logger.debug({ jobType: type, jobId: job.id, delay: options?.delay }, 'Job added to queue')
    return job
  }

  async scheduleRecurringJobs(): Promise<void> {
    if (!this.repositories) {
      logger.warn('Cannot schedule recurring jobs: repositories not set')
      return
    }

    const repositoriesFactory = () => Promise.resolve(this.repositories!)

    // Schedule cleanup every hour
    await this.addJob(JobType.CLEANUP_TOKENS, { repositoriesFactory }, {
      repeat: { cron: '0 * * * *' }, // Every hour
      jobId: 'cleanup-tokens-hourly'
    })
    
    // Schedule metrics aggregation every 5 minutes
    await this.addJob(JobType.METRICS_AGGREGATION, {
      timeRange: '5m',
      metrics: ['http_requests', 'auth_attempts', 'database_queries']
    }, {
      repeat: { cron: '*/5 * * * *' }, // Every 5 minutes
      jobId: 'metrics-aggregation-5min'
    })

    // Schedule daily cache warmup
    await this.addJob(JobType.CACHE_WARMUP, {
      cacheKeys: ['projects:list', 'users:active'],
      dataSource: 'database'
    }, {
      repeat: { cron: '0 6 * * *' }, // Daily at 6 AM
      jobId: 'cache-warmup-daily'
    })

    logger.info('Recurring jobs scheduled')
  }

  async getQueueStats(): Promise<Record<JobType, any>> {
    const stats: Record<string, any> = {}
    
    for (const [jobType, queue] of this.queues) {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        queue.getWaiting(),
        queue.getActive(),
        queue.getCompleted(),
        queue.getFailed(),
        queue.getDelayed()
      ])

      stats[jobType] = {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length
      }
    }
    
    return stats
  }

  async cleanupCompletedJobs(): Promise<void> {
    for (const [jobType, queue] of this.queues) {
      try {
        await queue.clean(24 * 60 * 60 * 1000, 'completed') // Clean jobs older than 24 hours
        await queue.clean(7 * 24 * 60 * 60 * 1000, 'failed') // Clean failed jobs older than 7 days
        logger.debug({ jobType }, 'Queue cleaned')
      } catch (error) {
        logger.error({ jobType, error }, 'Queue cleanup failed')
      }
    }
  }

  private async generateExportData(userId: string, exportType: string, format: string): Promise<string> {
    // Simulate data export generation
    const data = {
      userId,
      exportType,
      timestamp: new Date().toISOString(),
      data: `Simulated ${exportType} data for user ${userId}`
    }
    
    return format === 'json' ? JSON.stringify(data, null, 2) : 'csv,data,here'
  }

  private async aggregateMetrics(timeRange: string, metrics: string[]): Promise<any> {
    // Simulate metrics aggregation
    return {
      timeRange,
      metrics: metrics.reduce((acc, metric) => {
        acc[metric] = {
          count: Math.floor(Math.random() * 1000),
          average: Math.random() * 100,
          timestamp: new Date().toISOString()
        }
        return acc
      }, {} as Record<string, any>)
    }
  }

  private async storeAggregatedMetrics(data: any): Promise<void> {
    // Store aggregated metrics (implement based on your storage solution)
    logger.debug({ metrics: Object.keys(data.metrics) }, 'Storing aggregated metrics')
  }

  private async warmupCache(cacheKeys: string[], dataSource: string): Promise<number> {
    // Simulate cache warmup
    return cacheKeys.length
  }

  private async processUserAnalytics(userId: string, event: string, metadata: any): Promise<void> {
    // Process user analytics data
    logger.debug({ userId, event, metadata }, 'Processing user analytics')
  }

  async gracefulShutdown(): Promise<void> {
    logger.info('Gracefully shutting down job processor')
    
    const shutdownPromises = Array.from(this.queues.values()).map(queue => 
      queue.close()
    )
    
    await Promise.all(shutdownPromises)
    logger.info('Job processor shutdown complete')
  }
}

export const jobProcessor = new JobProcessor()
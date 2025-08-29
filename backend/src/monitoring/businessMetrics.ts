import client from 'prom-client'
import { Request, Response, NextFunction } from 'express'
import { registry } from '../telemetry/metrics.js'
import { logger } from '../utils/logger.js'

// Business-specific metrics
export const businessMetrics = {
  // User metrics
  activeUsers: new client.Gauge({
    name: 'active_users_total',
    help: 'Number of active users in the system',
    registers: [registry]
  }),

  userSessions: new client.Gauge({
    name: 'user_sessions_active',
    help: 'Number of active user sessions',
    registers: [registry]
  }),

  // API usage metrics
  apiCallsPerEndpoint: new client.Counter({
    name: 'api_calls_per_endpoint_total',
    help: 'Total API calls per endpoint',
    labelNames: ['endpoint', 'method', 'status_code'],
    registers: [registry]
  }),

  responseTimePercentiles: new client.Summary({
    name: 'response_time_percentiles',
    help: 'Response time percentiles',
    labelNames: ['endpoint', 'method'],
    percentiles: [0.5, 0.9, 0.95, 0.99],
    registers: [registry]
  }),

  // Database metrics
  dbConnectionPool: new client.Gauge({
    name: 'db_connections_active',
    help: 'Active database connections',
    labelNames: ['pool_type'],
    registers: [registry]
  }),

  dbQueryDuration: new client.Histogram({
    name: 'db_query_duration_seconds',
    help: 'Database query execution time',
    labelNames: ['operation', 'table'],
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
    registers: [registry]
  }),

  dbQueryCount: new client.Counter({
    name: 'db_queries_total',
    help: 'Total database queries executed',
    labelNames: ['operation', 'table', 'status'],
    registers: [registry]
  }),

  // Cache metrics
  cacheHitRatio: new client.Gauge({
    name: 'cache_hit_ratio',
    help: 'Cache hit ratio percentage',
    labelNames: ['cache_type'],
    registers: [registry]
  }),

  cacheOperations: new client.Counter({
    name: 'cache_operations_total',
    help: 'Total cache operations',
    labelNames: ['operation', 'cache_type', 'result'],
    registers: [registry]
  }),

  cacheSize: new client.Gauge({
    name: 'cache_size_bytes',
    help: 'Cache size in bytes',
    labelNames: ['cache_type'],
    registers: [registry]
  }),

  // Queue metrics
  queueJobsProcessed: new client.Counter({
    name: 'queue_jobs_processed_total',
    help: 'Total jobs processed by queue',
    labelNames: ['queue_name', 'status'],
    registers: [registry]
  }),

  queueJobDuration: new client.Histogram({
    name: 'queue_job_duration_seconds',
    help: 'Job processing duration',
    labelNames: ['queue_name', 'job_type'],
    buckets: [0.1, 0.5, 1, 5, 10, 30, 60, 300],
    registers: [registry]
  }),

  queueSize: new client.Gauge({
    name: 'queue_size',
    help: 'Number of jobs in queue',
    labelNames: ['queue_name', 'status'],
    registers: [registry]
  }),

  // Error tracking
  errorsByType: new client.Counter({
    name: 'errors_by_type_total',
    help: 'Total errors by type and endpoint',
    labelNames: ['error_type', 'endpoint', 'status_code'],
    registers: [registry]
  }),

  // Business-specific metrics
  projectsCreated: new client.Counter({
    name: 'projects_created_total',
    help: 'Total projects created',
    registers: [registry]
  }),

  authenticationEvents: new client.Counter({
    name: 'auth_events_total',
    help: 'Authentication events',
    labelNames: ['event_type', 'status'],
    registers: [registry]
  }),

  // Resource utilization
  memoryUsage: new client.Gauge({
    name: 'process_memory_usage_bytes',
    help: 'Process memory usage',
    labelNames: ['type'],
    registers: [registry]
  }),

  eventLoopLag: new client.Histogram({
    name: 'nodejs_eventloop_lag_seconds',
    help: 'Event loop lag in seconds',
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
    registers: [registry]
  })
}

// Middleware to track business metrics
export function businessMetricsMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = process.hrtime.bigint()
    const startEventLoop = process.hrtime()

    // Track request
    const endpoint = req.route?.path || req.path
    const method = req.method

    res.on('finish', () => {
      const durationNs = Number(process.hrtime.bigint() - startTime)
      const durationSeconds = durationNs / 1e9
      const statusCode = res.statusCode.toString()

      // Record metrics
      businessMetrics.apiCallsPerEndpoint.labels(endpoint, method, statusCode).inc()
      businessMetrics.responseTimePercentiles.labels(endpoint, method).observe(durationSeconds)

      // Error tracking
      if (res.statusCode >= 400) {
        const errorType = res.statusCode >= 500 ? 'server_error' : 'client_error'
        businessMetrics.errorsByType.labels(errorType, endpoint, statusCode).inc()
      }

      // Track user activity
      if ((req as any).user) {
        businessMetrics.activeUsers.inc()
      }
    })

    // Measure event loop lag
    const eventLoopLag = process.hrtime(startEventLoop)
    const lagSeconds = eventLoopLag[0] + eventLoopLag[1] / 1e9
    businessMetrics.eventLoopLag.observe(lagSeconds)

    next()
  }
}

// System metrics collector
class SystemMetricsCollector {
  private intervalId: NodeJS.Timeout | null = null

  start(): void {
    if (this.intervalId) return

    // Collect system metrics every 30 seconds
    this.intervalId = setInterval(() => {
      this.collectMemoryMetrics()
      this.collectCacheMetrics()
      this.collectDbMetrics()
    }, 30000)

    logger.info('System metrics collector started')
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      logger.info('System metrics collector stopped')
    }
  }

  private collectMemoryMetrics(): void {
    const memUsage = process.memoryUsage()
    businessMetrics.memoryUsage.labels('rss').set(memUsage.rss)
    businessMetrics.memoryUsage.labels('heapTotal').set(memUsage.heapTotal)
    businessMetrics.memoryUsage.labels('heapUsed').set(memUsage.heapUsed)
    businessMetrics.memoryUsage.labels('external').set(memUsage.external)
  }

  private collectCacheMetrics(): void {
    // This would integrate with your actual cache service
    // For now, we'll simulate some metrics
    businessMetrics.cacheHitRatio.labels('redis').set(85) // 85% hit ratio
    businessMetrics.cacheHitRatio.labels('memory').set(92) // 92% hit ratio
  }

  private collectDbMetrics(): void {
    // This would integrate with your database pool
    businessMetrics.dbConnectionPool.labels('read').set(5)
    businessMetrics.dbConnectionPool.labels('write').set(3)
  }
}

// Authentication metrics helper
export function trackAuthEvent(eventType: 'login' | 'logout' | 'refresh' | 'failed_login', status: 'success' | 'failure'): void {
  businessMetrics.authenticationEvents.labels(eventType, status).inc()
}

// Database query metrics helper
export function trackDbQuery(
  operation: 'select' | 'insert' | 'update' | 'delete',
  table: string,
  duration: number,
  status: 'success' | 'error'
): void {
  businessMetrics.dbQueryDuration.labels(operation, table).observe(duration)
  businessMetrics.dbQueryCount.labels(operation, table, status).inc()
}

// Cache metrics helper
export function trackCacheOperation(
  operation: 'get' | 'set' | 'del',
  cacheType: 'redis' | 'memory',
  result: 'hit' | 'miss' | 'success' | 'error'
): void {
  businessMetrics.cacheOperations.labels(operation, cacheType, result).inc()
}

// Queue metrics helper
export function trackQueueJob(
  queueName: string,
  jobType: string,
  duration: number,
  status: 'completed' | 'failed'
): void {
  businessMetrics.queueJobsProcessed.labels(queueName, status).inc()
  businessMetrics.queueJobDuration.labels(queueName, jobType).observe(duration)
}

// Project creation tracker
export function trackProjectCreation(): void {
  businessMetrics.projectsCreated.inc()
}

// Custom metrics dashboard endpoint
export function metricsHandler() {
  return async (_req: Request, res: Response) => {
    try {
      res.set('Content-Type', registry.contentType)
      const metrics = await registry.metrics()
      res.send(metrics)
    } catch (error) {
      logger.error({ error }, 'Failed to generate metrics')
      res.status(500).json({ error: 'Failed to generate metrics' })
    }
  }
}

// Alerts configuration
export interface AlertRule {
  name: string
  condition: string
  threshold: number
  duration: string
  severity: 'warning' | 'critical'
}

export const alertRules: AlertRule[] = [
  {
    name: 'HighErrorRate',
    condition: 'errors_by_type_total:rate5m > 0.1',
    threshold: 0.1,
    duration: '5m',
    severity: 'warning'
  },
  {
    name: 'HighResponseTime',
    condition: 'response_time_percentiles{quantile="0.95"} > 2',
    threshold: 2,
    duration: '5m',
    severity: 'warning'
  },
  {
    name: 'DatabaseConnectionsHigh',
    condition: 'db_connections_active > 50',
    threshold: 50,
    duration: '2m',
    severity: 'critical'
  },
  {
    name: 'QueueBacklog',
    condition: 'queue_size{status="waiting"} > 100',
    threshold: 100,
    duration: '10m',
    severity: 'warning'
  },
  {
    name: 'MemoryUsageHigh',
    condition: 'process_memory_usage_bytes{type="rss"} > 500MB',
    threshold: 500 * 1024 * 1024,
    duration: '5m',
    severity: 'critical'
  }
]

export const systemMetricsCollector = new SystemMetricsCollector()
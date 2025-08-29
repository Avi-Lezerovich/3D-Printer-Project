import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { advancedCache } from '../cache/advancedCacheService.js'
import { registry } from '../telemetry/metrics.js'
import { logger } from '../utils/logger.js'
import { jobProcessor } from '../queues/jobProcessor.js'
import { dbPool } from '../repositories/optimizedPrismaRepositories.js'
import os from 'os'
import { promisify } from 'util'

export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  responseTime: number
  error?: string
  details?: any
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  version: string
  environment: string
  services: Record<string, ServiceHealth>
  system: {
    memory: {
      used: number
      total: number
      percentage: number
      heap: NodeJS.MemoryUsage
    }
    cpu: {
      usage: number[]
      loadAverage: number[]
    }
    disk?: {
      usage: number
      available: number
    }
  }
  dependencies: {
    redis: ServiceHealth
    database: ServiceHealth
    queues: ServiceHealth
  }
  metrics: {
    totalRequests: number
    errorRate: number
    averageResponseTime: number
  }
}

class HealthCheckService {
  private prisma: PrismaClient | null = null
  private healthHistory: Array<{ timestamp: number; status: string }> = []
  private readonly MAX_HISTORY = 100

  constructor() {
    // Initialize Prisma client for health checks
    this.prisma = new PrismaClient()
    this.setupHealthHistory()
  }

  private setupHealthHistory(): void {
    // Clean up old health check history every hour
    setInterval(() => {
      const cutoff = Date.now() - (24 * 60 * 60 * 1000) // 24 hours ago
      this.healthHistory = this.healthHistory.filter(h => h.timestamp > cutoff)
    }, 60 * 60 * 1000)
  }

  async performHealthCheck(): Promise<HealthStatus> {
    const startTime = Date.now()
    logger.debug('Starting comprehensive health check')

    // Perform all health checks in parallel
    const [
      databaseHealth,
      redisHealth,
      queueHealth,
      systemMetrics,
      businessMetrics
    ] = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkQueues(),
      this.getSystemMetrics(),
      this.getBusinessMetrics()
    ])

    // Process results
    const services: Record<string, ServiceHealth> = {}
    const dependencies: HealthStatus['dependencies'] = {
      redis: this.extractResult(redisHealth, 'Redis'),
      database: this.extractResult(databaseHealth, 'Database'),
      queues: this.extractResult(queueHealth, 'Queues')
    }

    // Determine overall status
    const criticalServices = [dependencies.database, dependencies.redis]
    const unhealthyCount = criticalServices.filter(s => s.status === 'unhealthy').length
    const degradedCount = criticalServices.filter(s => s.status === 'degraded').length

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy'
    if (unhealthyCount > 0) {
      overallStatus = 'unhealthy'
    } else if (degradedCount > 0 || dependencies.queues.status === 'unhealthy') {
      overallStatus = 'degraded'
    } else {
      overallStatus = 'healthy'
    }

    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services,
      system: this.extractResult(systemMetrics, 'System') as any || this.getDefaultSystemMetrics(),
      dependencies,
      metrics: this.extractResult(businessMetrics, 'BusinessMetrics') as any || this.getDefaultBusinessMetrics()
    }

    // Record health status
    this.healthHistory.push({
      timestamp: Date.now(),
      status: overallStatus
    })

    if (this.healthHistory.length > this.MAX_HISTORY) {
      this.healthHistory.shift()
    }

    const duration = Date.now() - startTime
    logger.info({ 
      status: overallStatus, 
      duration,
      services: Object.keys(dependencies).length
    }, 'Health check completed')

    return healthStatus
  }

  private extractResult<T>(result: PromiseSettledResult<T>, serviceName: string): ServiceHealth | T {
    if (result.status === 'fulfilled') {
      return result.value as T
    } else {
      logger.warn({ error: result.reason, service: serviceName }, 'Health check failed')
      return {
        status: 'unhealthy' as const,
        responseTime: 0,
        error: result.reason?.message || 'Unknown error'
      }
    }
  }

  private async checkDatabase(): Promise<ServiceHealth> {
    if (!this.prisma) {
      return {
        status: 'unhealthy',
        responseTime: 0,
        error: 'Prisma client not initialized'
      }
    }

    const start = Date.now()
    try {
      // Use the optimized database pool
      const poolHealth = await dbPool.healthCheck()
      const responseTime = Date.now() - start

      return {
        status: poolHealth.status,
        responseTime,
        details: poolHealth.details
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - start,
        error: (error as Error).message
      }
    }
  }

  private async checkRedis(): Promise<ServiceHealth> {
    const start = Date.now()
    try {
      // Test both basic connectivity and advanced cache functionality
      await advancedCache.connect()
      
      // Test basic operations
      const testKey = `health:${Date.now()}`
      await advancedCache.set(testKey, { test: true }, { ttl: 10 })
      const retrieved = await advancedCache.get(testKey)
      await advancedCache.del(testKey)

      const responseTime = Date.now() - start
      const cacheStats = advancedCache.getStats()

      if (!retrieved) {
        return {
          status: 'degraded',
          responseTime,
          error: 'Cache read/write test failed',
          details: cacheStats
        }
      }

      return {
        status: cacheStats.connected ? 'healthy' : 'degraded',
        responseTime,
        details: cacheStats
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - start,
        error: (error as Error).message
      }
    }
  }

  private async checkQueues(): Promise<ServiceHealth> {
    const start = Date.now()
    try {
      const queueStats = await jobProcessor.getQueueStats()
      const responseTime = Date.now() - start

      // Check if any queues have too many failed jobs
      const totalFailed = Object.values(queueStats).reduce((sum: number, stats: any) => sum + (stats.failed || 0), 0)
      const totalActive = Object.values(queueStats).reduce((sum: number, stats: any) => sum + (stats.active || 0), 0)

      let status: ServiceHealth['status'] = 'healthy'
      let error: string | undefined

      if (totalFailed > 50) {
        status = 'degraded'
        error = `High number of failed jobs: ${totalFailed}`
      }

      if (totalFailed > 200) {
        status = 'unhealthy'
        error = `Critical number of failed jobs: ${totalFailed}`
      }

      return {
        status,
        responseTime,
        error,
        details: {
          ...queueStats,
          totals: {
            failed: totalFailed,
            active: totalActive
          }
        }
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - start,
        error: (error as Error).message
      }
    }
  }

  private async getSystemMetrics(): Promise<HealthStatus['system']> {
    const memUsage = process.memoryUsage()
    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMem = totalMem - freeMem

    return {
      memory: {
        used: usedMem,
        total: totalMem,
        percentage: Math.round((usedMem / totalMem) * 100),
        heap: memUsage
      },
      cpu: {
        usage: process.cpuUsage ? [process.cpuUsage().system, process.cpuUsage().user] : [0],
        loadAverage: os.loadavg()
      }
    }
  }

  private async getBusinessMetrics(): Promise<HealthStatus['metrics']> {
    try {
      // Get metrics from Prometheus registry
      const metrics = await registry.metrics()
      
      // Parse basic metrics (simplified parsing)
      const lines = metrics.split('\n')
      let totalRequests = 0
      let errorCount = 0
      let totalResponseTime = 0

      for (const line of lines) {
        if (line.includes('http_request_duration_seconds_count')) {
          const match = line.match(/(\d+)$/)
          if (match) totalRequests += parseInt(match[1])
        }
        if (line.includes('http_request_duration_seconds_sum')) {
          const match = line.match(/(\d+\.?\d*)$/)
          if (match) totalResponseTime += parseFloat(match[1])
        }
      }

      return {
        totalRequests,
        errorRate: totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0,
        averageResponseTime: totalRequests > 0 ? totalResponseTime / totalRequests : 0
      }
    } catch (error) {
      logger.warn({ error }, 'Failed to get business metrics')
      return this.getDefaultBusinessMetrics()
    }
  }

  private getDefaultSystemMetrics(): HealthStatus['system'] {
    const memUsage = process.memoryUsage()
    return {
      memory: {
        used: memUsage.rss,
        total: memUsage.rss + memUsage.external,
        percentage: 0,
        heap: memUsage
      },
      cpu: {
        usage: [0],
        loadAverage: [0, 0, 0]
      }
    }
  }

  private getDefaultBusinessMetrics(): HealthStatus['metrics'] {
    return {
      totalRequests: 0,
      errorRate: 0,
      averageResponseTime: 0
    }
  }

  getHealthHistory(): Array<{ timestamp: number; status: string }> {
    return [...this.healthHistory]
  }

  async getDetailedStatus(): Promise<any> {
    const basic = await this.performHealthCheck()
    return {
      ...basic,
      history: this.getHealthHistory().slice(-20), // Last 20 checks
      buildInfo: {
        nodeVersion: process.version,
        platform: os.platform(),
        arch: os.arch(),
        uptime: os.uptime()
      }
    }
  }
}

// Singleton instance
const healthCheckService = new HealthCheckService()

// Express middleware
export function healthCheckHandler() {
  return async (req: Request, res: Response) => {
    try {
      const detailed = req.query.detailed === 'true'
      const health = detailed 
        ? await healthCheckService.getDetailedStatus()
        : await healthCheckService.performHealthCheck()
      
      const statusCode = health.status === 'healthy' ? 200 
        : health.status === 'degraded' ? 200 
        : 503

      // Set appropriate headers
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
      res.setHeader('Content-Type', 'application/json')

      res.status(statusCode).json(health)
    } catch (error) {
      logger.error({ error }, 'Health check handler failed')
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        details: (error as Error).message
      })
    }
  }
}

// Readiness probe (for Kubernetes)
export function readinessHandler() {
  return async (_req: Request, res: Response) => {
    try {
      const health = await healthCheckService.performHealthCheck()
      const ready = health.dependencies.database.status !== 'unhealthy' &&
                   health.dependencies.redis.status !== 'unhealthy'

      res.status(ready ? 200 : 503).json({
        ready,
        timestamp: new Date().toISOString(),
        services: {
          database: health.dependencies.database.status,
          redis: health.dependencies.redis.status
        }
      })
    } catch (error) {
      res.status(503).json({
        ready: false,
        timestamp: new Date().toISOString(),
        error: (error as Error).message
      })
    }
  }
}

// Liveness probe (for Kubernetes)
export function livenessHandler() {
  return (_req: Request, res: Response) => {
    // Simple liveness check - if we can respond, we're alive
    res.status(200).json({
      alive: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    })
  }
}

export { healthCheckService }
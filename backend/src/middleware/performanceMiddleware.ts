import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger.js'

export interface PerformanceMetrics {
  requestDuration: number
  memoryUsage: NodeJS.MemoryUsage
  cpuUsage: NodeJS.CpuUsage
  activeRequests: number
}

let activeRequests = 0
let totalRequests = 0
let totalDuration = 0

/**
 * Enhanced performance monitoring middleware
 * Tracks request duration, memory usage, CPU usage, and active requests
 */
export function performanceMonitoringMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = process.hrtime.bigint()
  const startCpuUsage = process.cpuUsage()
  const requestId = (req as any).requestId

  activeRequests++
  totalRequests++

  // Store performance context
  const performanceContext = {
    startTime,
    startCpuUsage,
    requestId,
  }

  // Enhanced response handler
  const originalJson = res.json.bind(res)
  res.json = function(body: any) {
    trackRequestCompletion(performanceContext, req, res)
    return originalJson(body)
  }

  res.on('finish', () => {
    trackRequestCompletion(performanceContext, req, res)
  })

  next()
}

function trackRequestCompletion(
  context: { startTime: bigint; startCpuUsage: NodeJS.CpuUsage; requestId: string },
  req: Request,
  res: Response
) {
  const endTime = process.hrtime.bigint()
  const duration = Number(endTime - context.startTime) / 1e6 // Convert to milliseconds
  const cpuUsage = process.cpuUsage(context.startCpuUsage)
  const memoryUsage = process.memoryUsage()

  activeRequests--
  totalDuration += duration

  // Log performance metrics for slow requests (>1s) or errors
  if (duration > 1000 || res.statusCode >= 400) {
    logger.warn({
      requestId: context.requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      memoryUsage: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
      },
      cpuUsage: {
        user: Math.round(cpuUsage.user / 1000), // Convert to milliseconds
        system: Math.round(cpuUsage.system / 1000), // Convert to milliseconds
      },
      activeRequests,
    }, duration > 1000 ? 'slow request detected' : 'error request performance')
  }

  // Store in response locals for potential use by other middleware
  ;(res as any).locals = {
    ...(res as any).locals,
    performanceMetrics: {
      requestDuration: duration,
      memoryUsage,
      cpuUsage,
      activeRequests,
    } as PerformanceMetrics
  }
}

/**
 * Get current performance stats
 */
export function getPerformanceStats() {
  const memoryUsage = process.memoryUsage()
  return {
    activeRequests,
    totalRequests,
    averageRequestDuration: totalRequests > 0 ? totalDuration / totalRequests : 0,
    memoryUsage: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
      external: Math.round(memoryUsage.external / 1024 / 1024), // MB
    },
    uptime: Math.round(process.uptime()),
  }
}
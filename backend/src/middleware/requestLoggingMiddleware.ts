import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger.js'

/**
 * Comprehensive request/response logging middleware
 * Logs requests with method, URL, query params, and response details
 */
export function requestLoggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now()
  const requestId = (req as any).requestId

  // Log incoming request
  const logData = {
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent']?.slice(0, 100),
    ip: req.ip || req.connection.remoteAddress,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
  }

  logger.info(logData, 'incoming request')

  // Capture original res.json to log response
  const originalJson = res.json.bind(res)
  res.json = function(body: any) {
    const duration = Date.now() - startTime
    
    // Log response (only log response body for errors or if explicitly enabled)
    const shouldLogBody = res.statusCode >= 400 || process.env.LOG_RESPONSE_BODY === 'true'
    
    logger.info({
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      responseBody: shouldLogBody ? body : undefined,
    }, 'request completed')

    return originalJson(body)
  }

  // Handle cases where response doesn't use json()
  res.on('finish', () => {
    if (!res.headersSent || res.writableEnded) return
    
    const duration = Date.now() - startTime
    logger.info({
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
    }, 'request completed (non-json)')
  })

  next()
}
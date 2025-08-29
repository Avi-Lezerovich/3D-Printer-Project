import { Request, Response, NextFunction } from 'express'
import { AppError } from '../errors/AppError.js'
import { logger } from '../utils/logger.js'

export interface ErrorContext {
  requestId: string
  userId?: string
  userAgent?: string
  ip: string
  url: string
  method: string
  timestamp: string
  userRole?: string
  sessionId?: string
}

export class EnhancedAppError extends AppError {
  context?: ErrorContext
  cause?: Error
  correlationId?: string
  
  constructor(
    message: string, 
    status = 500, 
    code?: string, 
    details?: unknown,
    context?: ErrorContext,
    cause?: Error
  ) {
    super(message, status, code, details)
    this.context = context
    this.cause = cause
    this.correlationId = context?.requestId
    
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EnhancedAppError)
    }
    
    // Chain stack traces for better debugging
    if (cause?.stack) {
      this.stack = `${this.stack}\nCaused by: ${cause.stack}`
    }
  }

  toJSON() {
    return {
      name: this.constructor.name,
      message: this.message,
      status: this.status,
      code: this.code,
      details: this.details,
      context: this.context,
      correlationId: this.correlationId,
      timestamp: new Date().toISOString()
    }
  }
}

interface ErrorReportingService {
  report(error: Error, context: ErrorContext): Promise<void>
}

class MockErrorReportingService implements ErrorReportingService {
  async report(error: Error, context: ErrorContext): Promise<void> {
    // Mock implementation - in production, integrate with Sentry, DataDog, etc.
    logger.error({
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context,
      service: 'error-reporting'
    }, 'Error reported to monitoring service')
  }
}

const errorReportingService = new MockErrorReportingService()

export function enhancedErrorHandler(
  err: unknown, 
  req: Request, 
  res: Response, 
  _next: NextFunction
): void {
  const startTime = (req as any).startTime || Date.now()
  const context: ErrorContext = {
    requestId: (req as any).id || (req as any).requestId || 'unknown',
    userId: (req as any).user?.email || (req as any).user?.id,
    userRole: (req as any).user?.role,
    sessionId: (req as any).sessionID,
    userAgent: req.get('User-Agent') || 'unknown',
    ip: req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown',
    url: req.originalUrl || req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  }

  // Extract error details
  const error = err as any
  const status = error?.status || 500
  const code = error?.code || (status >= 500 ? 'INTERNAL_ERROR' : 'CLIENT_ERROR')
  const message = error?.message || 'An error occurred'
  const isOperationalError = error instanceof AppError || error instanceof EnhancedAppError

  // Performance metrics
  const responseTime = Date.now() - startTime
  const performanceData = {
    responseTime,
    slowRequest: responseTime > 1000,
    verySlowRequest: responseTime > 5000
  }

  // Determine log level based on error type and status
  const logLevel = status >= 500 ? 'error' : 
                   status >= 400 ? 'warn' : 
                   'info'

  // Enhanced logging with structured data
  const logData = {
    error: {
      name: error?.name || 'UnknownError',
      message,
      code,
      status,
      stack: error?.stack,
      cause: error?.cause?.message,
      operational: isOperationalError,
      details: error?.details
    },
    context,
    performance: performanceData,
    request: {
      body: req.method !== 'GET' ? this.sanitizeRequestBody(req.body) : undefined,
      query: Object.keys(req.query).length > 0 ? req.query : undefined,
      params: Object.keys(req.params).length > 0 ? req.params : undefined,
      headers: this.sanitizeHeaders(req.headers)
    }
  }

  // Log the error with appropriate level
  logger[logLevel](logData, `Request failed: ${message}`)

  // Report to external monitoring for server errors
  if (status >= 500 && !isOperationalError) {
    errorReportingService.report(error, context).catch(reportingError => {
      logger.error({ reportingError }, 'Failed to report error to monitoring service')
    })
  }

  // Prepare response
  const errorResponse = {
    success: false,
    error: {
      code,
      message: status >= 500 && process.env.NODE_ENV === 'production' 
        ? 'Internal Server Error' 
        : message,
      status,
      requestId: context.requestId,
      timestamp: context.timestamp
    } as any
  }

  // Add debug information in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = error?.stack
    errorResponse.error.details = error?.details
    errorResponse.error.context = context
    errorResponse.error.performance = performanceData
  }

  // Add retry information for specific error types
  if (status >= 500 && status !== 501) {
    errorResponse.error.retryable = true
    errorResponse.error.retryAfter = this.calculateRetryAfter(status)
  }

  // Send response
  res.status(status).json({
    ...errorResponse,
    message // Backwards compatibility
  })
}

function sanitizeRequestBody(body: any): any {
  if (!body || typeof body !== 'object') return body
  
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth', 'authorization']
  const sanitized = { ...body }
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]'
    }
  }
  
  return sanitized
}

function sanitizeHeaders(headers: any): any {
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token']
  const sanitized = { ...headers }
  
  for (const header of sensitiveHeaders) {
    if (sanitized[header]) {
      sanitized[header] = '[REDACTED]'
    }
  }
  
  return sanitized
}

function calculateRetryAfter(status: number): number {
  switch (status) {
    case 429: return 60 // Rate limit - retry after 1 minute
    case 502:
    case 503: return 30 // Service unavailable - retry after 30 seconds
    case 504: return 10 // Gateway timeout - retry after 10 seconds
    default: return 60
  }
}

// Request context middleware to capture timing and metadata
export function requestContextMiddleware(
  req: Request, 
  _res: Response, 
  next: NextFunction
): void {
  // Add start time for performance tracking
  (req as any).startTime = Date.now()
  
  // Generate correlation ID if not present
  if (!(req as any).id && !(req as any).requestId) {
    (req as any).id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  next()
}

// Async error handler wrapper
export function asyncErrorHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// Validation error handler
export function validationErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err.name === 'ValidationError' || err.type === 'entity.parse.failed') {
    const context: ErrorContext = {
      requestId: (req as any).id || 'unknown',
      userId: (req as any).user?.email,
      userAgent: req.get('User-Agent') || 'unknown',
      ip: req.ip || 'unknown',
      url: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    }

    const enhancedError = new EnhancedAppError(
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      err.details || err.message,
      context,
      err
    )

    return enhancedErrorHandler(enhancedError, req, res, next)
  }
  
  next(err)
}

// Rate limiting error handler
export function rateLimitErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err.statusCode === 429 || err.status === 429) {
    const context: ErrorContext = {
      requestId: (req as any).id || 'unknown',
      userId: (req as any).user?.email,
      userAgent: req.get('User-Agent') || 'unknown',
      ip: req.ip || 'unknown',
      url: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    }

    const enhancedError = new EnhancedAppError(
      'Rate limit exceeded',
      429,
      'RATE_LIMIT_EXCEEDED',
      { limit: err.limit, remaining: err.remaining, resetTime: err.resetTime },
      context,
      err
    )

    return enhancedErrorHandler(enhancedError, req, res, next)
  }
  
  next(err)
}

// Export error factory functions
export function createOperationalError(
  message: string,
  status: number,
  code: string,
  context?: Partial<ErrorContext>
): EnhancedAppError {
  const fullContext: ErrorContext = {
    requestId: context?.requestId || `op_${Date.now()}`,
    ip: context?.ip || 'internal',
    url: context?.url || 'internal',
    method: context?.method || 'internal',
    timestamp: new Date().toISOString(),
    ...context
  }

  return new EnhancedAppError(message, status, code, undefined, fullContext)
}

export { errorReportingService }
import { Request, Response, NextFunction } from 'express'
import { AppError } from '../errors/AppError.js'
import { logger } from '../utils/logger.js'

// 404 handler
export function notFoundHandler(req: Request, res: Response) {
	const requestId = (req as any).requestId
	res.status(404).json({ 
		success: false,
		error: {
			code: 'NOT_FOUND',
			message: 'Not Found',
			status: 404,
			requestId,
			timestamp: new Date().toISOString(),
		},
		message: 'Not Found' // Backwards compatibility
	})
}

// Central error handler
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
	const status = (err as any)?.status || 500
	const isProd = process.env.NODE_ENV === 'production'
	const code = (err as any)?.code || (status === 500 ? 'INTERNAL_ERROR' : undefined)
	const message = status === 500 ? 'Internal Server Error' : (err as any)?.message || 'Error'
	const requestId = (req as any).requestId || (req as any).id || (req as any).reqId

	const isVitest = !!process.env.VITEST_WORKER_ID
	const shouldLog = status >= 500 || (!isVitest && status >= 400)
	if (shouldLog) {
		logger[status >= 500 ? 'error' : 'warn']({ err, status, code, requestId }, 'request failed')
	}

	// Standardized error response format
	const errorResponse = {
		success: false,
		error: {
			code: code || 'UNKNOWN_ERROR',
			message,
			status,
			requestId,
			timestamp: new Date().toISOString(),
		} as any
	}

	// Add debug info in non-production
	if (!isProd) {
		if ((err as any)?.stack) errorResponse.error.stack = (err as any).stack
		if ((err as AppError).details) errorResponse.error.details = (err as AppError).details
	}

	// Response format with backwards compatibility
	res.status(status).json({ 
		...errorResponse,
		message, // Backwards compatibility
	})
}

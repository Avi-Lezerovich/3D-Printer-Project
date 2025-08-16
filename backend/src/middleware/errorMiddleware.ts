import { Request, Response, NextFunction } from 'express'
import { AppError } from '../errors/AppError.js'
import { logger } from '../utils/logger.js'

// 404 handler
export function notFoundHandler(_req: Request, res: Response) {
	res.status(404).json({ message: 'Not Found' })
}

// Central error handler
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
	const status = (err as any)?.status || 500
	const isProd = process.env.NODE_ENV === 'production'
	const code = (err as any)?.code || (status === 500 ? 'INTERNAL_ERROR' : undefined)
	const message = status === 500 ? 'Internal Server Error' : (err as any)?.message || 'Error'
	const requestId = (req as any).id || (req as any).reqId

		const isVitest = !!process.env.VITEST_WORKER_ID
		const shouldLog = status >= 500 || (!isVitest && status >= 400)
		if (shouldLog) {
			logger[status >= 500 ? 'error' : 'warn']({ err, status, code, requestId }, 'request failed')
		}

	const errorBody: Record<string, unknown> = { code, message }
	if (!isProd && (err as any)?.stack) errorBody.stack = (err as any).stack
	if ((err as AppError).details && !isProd) errorBody.details = (err as AppError).details
	if (requestId) errorBody.requestId = requestId

		// Backwards compatibility: also surface top-level message until tests updated
		res.status(status).json({ message, error: errorBody })
}

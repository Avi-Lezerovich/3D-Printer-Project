import { Request, Response, NextFunction } from 'express'

// 404 handler
export function notFoundHandler(_req: Request, res: Response) {
	res.status(404).json({ message: 'Not Found' })
}

// Central error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
	const status = (err as any)?.status || 500
	const isProd = process.env.NODE_ENV === 'production'

	// Basic logging to console; in prod use proper logger
	if (!isProd) {
		console.error(err)
	}

		const message =
			status === 500
				? 'Internal Server Error'
				: typeof err === 'object' && err && 'message' in err
				? String((err as any).message)
				: 'Error'
		const payload: Record<string, unknown> = { message }
		if (!isProd && (err as any)?.stack) payload.stack = (err as any).stack

	res.status(status).json(payload)
}

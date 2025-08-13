import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

export interface AuthPayload {
	sub: string
	email?: string
	role?: 'user' | 'admin'
}

declare module 'express-serve-static-core' {
	interface Request {
		user?: AuthPayload
	}
}

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
	try {
		const authHeader = req.headers.authorization
		const token = authHeader?.startsWith('Bearer ')
			? authHeader.slice(7)
	: (req.cookies?.token || req.cookies?.['__Host-token'])

		if (!token) {
			res.setHeader('WWW-Authenticate', 'Bearer')
			return res.status(401).json({ message: 'Unauthorized: missing token' })
		}

		const secret =
			process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'replace_me_dev_only' : '')
		if (!secret) throw new Error('JWT_SECRET not configured')

		const decoded = jwt.verify(token, secret) as AuthPayload
		req.user = decoded
		return next()
	} catch (err: any) {
		const code = err?.name === 'TokenExpiredError' ? 401 : 401
		const reason = err?.message || 'invalid token'
		res.setHeader('WWW-Authenticate', 'Bearer error="invalid_token"')
		return res.status(code).json({ message: 'Unauthorized', reason })
	}
}

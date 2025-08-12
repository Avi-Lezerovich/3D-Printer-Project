import 'dotenv/config'
import express, { Request, Response, NextFunction } from 'express'
import http from 'http'
import helmet from 'helmet'
import morgan from 'morgan'
import cors from 'cors'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import csrf from 'csurf'
import rateLimit from 'express-rate-limit'

import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js'
import { authenticateJWT } from './middleware/authMiddleware.js'
import authRouter from './routes/auth.js'
import projectsRouter from './routes/projects.js'
import { setCache } from './middleware/cacheMiddleware.js'

const app = express()
const server = http.createServer(app)

// Config
const PORT = Number(process.env.PORT || 8080)
const HOST = process.env.HOST || '0.0.0.0'
const NODE_ENV = process.env.NODE_ENV || 'development'
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'
const LOG_LEVEL = process.env.LOG_LEVEL || 'dev'
const TRUST_PROXY = Number(process.env.TRUST_PROXY || '1')

app.set('trust proxy', TRUST_PROXY)

// Socket.IO is optional; guard require to avoid top-level import side effects in tests
let io: any | undefined
;(async () => {
	try {
		const { Server } = await import('socket.io') as any
		io = new Server(server, { cors: { origin: CLIENT_URL, credentials: true } })
		io.on('connection', (socket: any) => {
			if (NODE_ENV !== 'production') console.info('Socket client connected')
			const interval = setInterval(() => {
				socket.emit('heartbeat', { t: Date.now() })
			}, 5000)
			socket.on('disconnect', () => clearInterval(interval))
		})
	} catch {}
})()

// Security headers
app.use(
	helmet({
		contentSecurityPolicy: NODE_ENV === 'production' ? {
			useDefaults: true,
			directives: {
				"default-src": ["'self'"],
				"connect-src": ["'self'", CLIENT_URL],
				"img-src": ["'self'", 'data:', 'blob:'],
				"script-src": ["'self'", "'unsafe-inline'"],
				"style-src": ["'self'", "'unsafe-inline'"],
				"font-src": ["'self'", 'data:'],
				"object-src": ["'none'"],
				"frame-ancestors": ["'self'"],
			},
		} : false,
		crossOriginEmbedderPolicy: false,
		crossOriginResourcePolicy: { policy: 'cross-origin' },
		referrerPolicy: { policy: 'no-referrer' },
		frameguard: { action: 'sameorigin' },
		hsts: NODE_ENV === 'production' ? { maxAge: 15552000, includeSubDomains: true, preload: true } : false,
	})
)

// Logging
if (NODE_ENV !== 'test') {
	app.use(morgan(LOG_LEVEL as any))
}

// CORS
app.use(
	cors({
		origin: function (origin, callback) {
			if (!origin) return callback(null, true)
			const allowed = [CLIENT_URL]
			if (allowed.includes(origin)) return callback(null, true)
			return callback(new Error('Not allowed by CORS'))
		},
		credentials: true,
	})
)

// Parsers
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Compression
app.use(compression())

// Rate limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	standardHeaders: 'draft-7',
	legacyHeaders: false,
})
app.use('/api/', limiter)

// CSRF setup (cookie-based)
const CSRF_COOKIE_NAME = process.env.CSRF_COOKIE_NAME || 'csrf_token'
const SESSION_SECURE = String(process.env.SESSION_SECURE) === 'true'
const csrfProtection = csrf({ cookie: { key: CSRF_COOKIE_NAME, httpOnly: true, sameSite: 'lax', secure: SESSION_SECURE } })

// CSRF token route for clients to fetch token from cookie and echo header back
app.get('/api/csrf-token', csrfProtection, (req: Request, res: Response) => {
	// csurf will set the cookie; we also send the token for convenience
	const token = (req as any).csrfToken?.() as string | undefined
	res.json({ csrfToken: token })
})

// Apply CSRF to state-changing requests, with whitelist for auth endpoints
app.use((req: Request, res: Response, next: NextFunction) => {
	const method = req.method
	if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return next()
	const path = req.path
	if (path.startsWith('/api/auth/login') || path.startsWith('/api/auth/logout')) return next()
	return (csrfProtection as any)(req, res, next)
})

// Healthcheck
app.get('/api/health', setCache(5), (_req, res) => {
	res.json({ status: 'ok', env: NODE_ENV, uptime: process.uptime() })
})

// Routes (versioned)
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/projects', authenticateJWT, projectsRouter)
// Back-compat temporary mounts (to be removed after clients migrate)
app.use('/api/auth', authRouter)
app.use('/api/projects', authenticateJWT, projectsRouter)

// 404 + error handlers
app.use(notFoundHandler)
app.use(errorHandler)

// Start server if run directly
if (process.argv[1] && process.argv[1].includes('server/index.ts')) {
	server.listen(PORT, HOST, () => {
		console.info(`API listening on http://${HOST}:${PORT}`)
	})
}

export default app

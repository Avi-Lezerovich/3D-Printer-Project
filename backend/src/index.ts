import 'dotenv/config'
import express, { Request, Response, NextFunction } from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import http from 'http'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import csrf from 'csurf'
import rateLimit from 'express-rate-limit'
import { randomUUID } from 'crypto'

import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js'
import { setupGracefulShutdown } from './serverLifecycle.js'
import { authenticateJWT } from './middleware/authMiddleware.js'
import authRouter from './routes/auth.js'
import projectsRouter from './routes/projects.js'
import projectManagementRouter from './routes/project-management.js'
import { setCache } from './middleware/cacheMiddleware.js'
import { env, allowedOrigins, serverConfig, isProd } from './config/index.js'
import { httpLogger, logger } from './utils/logger.js'
import client from 'prom-client'
import { openapiSpec } from './openapi.js'
import swaggerUi from 'swagger-ui-express'
import { setRepositories as setAuthRepos } from './services/authService.js'
import { setRepositories as setProjectRepos } from './services/projectService.js'
import { initializeRepositories } from './repositories/factory.js'
import { initCache, cacheStats } from './cache/cacheService.js'
import { redisSlidingWindowLimiter } from './middleware/rateLimiter.js'
import { listFlags, flagEnabled } from './config/flags.js'
import jwt from 'jsonwebtoken'
import { securityConfig } from './config/index.js'
// @ts-ignore - TypeScript will resolve to .ts source; runtime uses .js
import { eventBus } from './realtime/eventBus.js'
import { startBackgroundJobs, setBackgroundRepositories, getCleanupStats } from './background/jobs.js'
// Simple in-memory metrics (initialized after app instantiation below)
const metrics = { reqTotal: 0, reqActive: 0 }

const app = express()
const server = http.createServer(app)

// Resolve dirname for ESM (needed for static file serving)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Config
const PORT = serverConfig.port
const HOST = serverConfig.host
const NODE_ENV = env.NODE_ENV
const CLIENT_URL = env.CLIENT_URL

app.set('trust proxy', serverConfig.trustProxy)
app.disable('x-powered-by')

// Fail-fast checks for critical production configuration
// env validation already performed in config/index.ts

// Socket.IO is optional; guard require to avoid top-level import side effects in tests
let io: any | undefined
;(async () => {
	if (!flagEnabled('REALTIME')) return
	try {
		const { Server } = await import('socket.io') as any
		io = new Server(server, { cors: { origin: NODE_ENV === 'production' ? CLIENT_URL : true, credentials: true } })
		if (flagEnabled('REALTIME_CLUSTER') && process.env.REDIS_URL) {
			try {
				const { createAdapter } = await import('@socket.io/redis-adapter') as any
				const { createClient } = await import('redis') as any
				const pub = createClient({ url: process.env.REDIS_URL }); const sub = pub.duplicate()
				await pub.connect(); await sub.connect()
				io.adapter(createAdapter(pub, sub))
				logger.info('Socket.IO Redis adapter enabled')
			} catch (e) { logger.warn({ err: e }, 'Redis adapter setup failed') }
		}
		// Auth middleware for sockets
		io.use((socket: any, next: any) => {
			try {
				const token = socket.handshake?.auth?.token || socket.handshake?.query?.token
				if (!token) return next(new Error('unauthorized'))
				const payload = jwt.verify(token, securityConfig.jwt.secret)
				;(socket as any).user = payload
				next()
			} catch (e) {
				next(new Error('unauthorized'))
			}
		})
		io.on('connection', (socket: any) => {
			if (NODE_ENV !== 'production') logger.debug({ sid: socket.id }, 'socket connected')
			const hb = setInterval(() => { socket.emit('heartbeat', { t: Date.now() }) }, 5000)
			socket.on('disconnect', () => clearInterval(hb))
		})
		// Project domain event forwarding (versioned payloads)
		eventBus.on('project.created', (payload: any) => io?.emit('project.created', payload))
		eventBus.on('project.updated', (payload: any) => io?.emit('project.updated', payload))
		eventBus.on('project.deleted', (payload: any) => io?.emit('project.deleted', payload))
		// Security events (optional subscribers)
		eventBus.on('security.auth.login', (payload: any) => io?.emit('security.auth.login', payload))
		eventBus.on('security.auth.logout', (payload: any) => io?.emit('security.auth.logout', payload))
		eventBus.on('security.auth.refresh', (payload: any) => io?.emit('security.auth.refresh', payload))
	} catch (e) {
		logger.warn({ err: e }, 'Socket.IO initialization failed')
	}
})()

// Initialize repositories (memory or prisma based on REPO_DRIVER)
;(async () => {
	try {
		const { repos, driver } = await initializeRepositories()
		setAuthRepos(repos)
		setProjectRepos(repos)
		setBackgroundRepositories(repos)
		if (env.NODE_ENV !== 'test') logger.info({ msg: 'Repositories initialized', driver })
		startBackgroundJobs()
	} catch (e) {
		logger.error({ err: e }, 'Repository initialization failed; memory fallback already applied')
	}
})()

// Initialize cache (Redis or memory fallback)
;(async () => { await initCache() })()

// Prometheus metrics setup
const promRegistry = new client.Registry()
client.collectDefaultMetrics({ register: promRegistry })
const httpLatency = new client.Histogram({
	name: 'http_request_duration_seconds',
	help: 'Request latency in seconds',
	labelNames: ['method','route','status'],
	buckets: [0.01,0.05,0.1,0.25,0.5,1,2,5]
})
promRegistry.registerMetric(httpLatency)

// Request ID then metrics middleware (after app created)
app.use((req, res, next) => {
	const incoming = (req.headers['x-request-id'] as string | undefined)?.slice(0, 100)
	const id = incoming || randomUUID()
	;(req as any).requestId = id
	res.setHeader('X-Request-Id', id)
	next()
})
app.use((req, res, next) => {
	metrics.reqTotal++
	metrics.reqActive++
	const start = process.hrtime.bigint()
	res.on('finish', () => {
		metrics.reqActive--
		const durNs = Number(process.hrtime.bigint() - start)
		;(res as any).locals = { ...(res as any).locals, durationNs: durNs }
		const route = (req as any).route?.path || req.path
		httpLatency.labels(req.method, route, String(res.statusCode)).observe(durNs / 1e9)
	})
	next()
})

// Security headers
app.use(
	helmet({
		contentSecurityPolicy: NODE_ENV === 'production' ? {
			useDefaults: true,
			directives: {
				"default-src": ["'self'"],
				"connect-src": ["'self'", ...allowedOrigins],
				"img-src": ["'self'", 'data:', 'blob:'],
				"script-src": ["'self'"],
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

// Add explicit Permissions-Policy restrictions
app.use((_req, res, next) => {
	res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
	next()
})

// Structured HTTP logging (skipped in tests)
if (NODE_ENV !== 'test') {
	app.use(httpLogger)
}

// CORS
app.use(
	cors({
		origin: function (origin, callback) {
			if (!origin) return callback(null, true)
			if (allowedOrigins.includes(origin)) return callback(null, true)
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

// Additional rate limit for auth to mitigate brute-force/credential stuffing
const authLimiter = rateLimit({
	windowMs: 10 * 60 * 1000,
	max: 20,
	message: { message: 'Too many attempts, please try again later.' },
	standardHeaders: 'draft-7',
	legacyHeaders: false,
})
app.use('/api/auth/login', authLimiter)
// Distributed limiter (best-effort) for login if Redis available
app.use('/api/v1/auth/login', redisSlidingWindowLimiter({ windowMs: 10*60*1000, max: 50 }))

// CSRF setup (cookie-based)
const SESSION_SECURE = String(process.env.SESSION_SECURE) === 'true'
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN
const CSRF_COOKIE_NAME = SESSION_SECURE && !COOKIE_DOMAIN ? '__Host-csrf' : (process.env.CSRF_COOKIE_NAME || 'csrf_token')
const csrfProtection = csrf({ cookie: { key: CSRF_COOKIE_NAME, httpOnly: true, sameSite: 'lax', secure: SESSION_SECURE, path: '/' } })

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
	if (
		path.startsWith('/api/auth/login') || path.startsWith('/api/auth/logout') ||
		path.startsWith('/api/v1/auth/login') || path.startsWith('/api/v1/auth/logout') ||
		path.includes('/auth/refresh') || path.includes('/auth/register')
	) return next()
	return (csrfProtection as any)(req, res, next)
})

// Healthcheck
app.get('/api/health', setCache(5), (_req, res) => {
	res.json({
		status: 'ok',
		env: NODE_ENV,
		uptime: process.uptime(),
		memory: process.memoryUsage().rss,
		commit: process.env.COMMIT_SHA || null,
		version: process.env.npm_package_version || null,
	})
})

// Liveness probe (fast, dependency-agnostic)
app.get('/healthz', (_req, res) => res.json({ ok: true }))

// Readiness probe (extend with DB/Redis checks when present)
app.get('/ready', async (_req, res) => {
  const cache = cacheStats()
  res.json({ ready: true, cache })
})

// API discovery root
app.get('/api', (_req, res) => {
	res.json({ versions: ['v1'], docs: '/api/v1/spec', health: '/api/health' })
})

// Expose OpenAPI spec (dev only for now)
if (NODE_ENV !== 'production') {
	app.get('/api/v1/spec', (_req, res) => res.json(openapiSpec))
	app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec))
}

app.get('/api/metrics', (_req, res) => {
	res.json({ ...metrics, memoryRss: process.memoryUsage().rss, cache: cacheStats(), cleanup: getCleanupStats() })
})

app.get('/metrics', async (_req, res) => {
	res.setHeader('Content-Type', promRegistry.contentType)
	res.end(await promRegistry.metrics())
})

// Helpful root route (avoids 404 when opening backend port in browser)
app.get('/', (_req, res) => {
	res.json({
		message: 'Backend running',
		api: '/api',
		docs: '/api/v1/docs',
		health: '/api/health',
		note: 'Frontend dev server runs separately on Vite (default http://localhost:5173). In production set SERVE_FRONTEND=true to serve built assets.'
	})
})

// Optional static frontend serving (production) when env SERVE_FRONTEND=true
if (process.env.SERVE_FRONTEND === 'true') {
	const distDir = path.resolve(__dirname, '../../frontend/dist')
	app.use(express.static(distDir))
	// SPA fallback
	app.get('*', (req, res, next) => {
		if (req.path.startsWith('/api/')) return next()
		res.sendFile(path.join(distDir, 'index.html'), err => { if (err) next(err) })
	})
}

// Routes (versioned)
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/projects', authenticateJWT, (req, res, next) => {
  // Wrap res.json to add weak ETag for project list responses
  const originalJson = res.json.bind(res)
  res.json = (body: any) => {
    if (req.method === 'GET' && req.path === '/' && body && body.projects) {
      const etag = 'W/"' + Buffer.from(JSON.stringify(body.projects)).toString('base64url').slice(0,32) + '"'
      res.setHeader('ETag', etag)
      res.setHeader('Last-Modified', new Date().toUTCString())
      const ifNoneMatch = req.headers['if-none-match']
      if (ifNoneMatch && ifNoneMatch === etag) return res.status(304).end()
    }
    return originalJson(body)
  }
  next()
}, projectsRouter)
app.use('/api/v1/project-management', authenticateJWT, projectManagementRouter)
// Back-compat temporary mounts (to be removed after clients migrate)
app.use('/api/auth', authRouter)
app.use('/api/projects', authenticateJWT, projectsRouter)
app.get('/api/v1/flags', (_req, res) => { res.json({ flags: listFlags() }) })

// 404 + error handlers
app.use(notFoundHandler)
app.use(errorHandler)

// Start server (skip only in test or when explicitly disabled)
if (env.NODE_ENV !== 'test' && !process.env.NO_LISTEN) {
	server.listen(PORT, HOST, () => {
		logger.info({ msg: 'API listening', url: `http://${HOST}:${PORT}`, env: NODE_ENV })
		if (!isProd) logger.debug({ allowedOrigins })
	})
	setupGracefulShutdown(server, [])
}

export { server }
export default app

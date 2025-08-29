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

// Enhanced imports for performance optimizations
import { 
  enhancedErrorHandler, 
  requestContextMiddleware, 
  validationErrorHandler,
  rateLimitErrorHandler,
  asyncErrorHandler 
} from './middleware/enhancedErrorHandler.js'
import { setupGracefulShutdown } from './serverLifecycle.js'
import { authenticateJWT } from './middleware/authMiddleware.js'
import authRouter from './routes/auth.js'
import projectsRouter from './routes/projects.js'
import { setCache } from './middleware/cacheMiddleware.js'
import { env, allowedOrigins, serverConfig, isProd, featureFlags } from './config/index.js'
import { httpLogger, logger } from './utils/logger.js'

// Enhanced monitoring and metrics
import { httpLatency, exposePrometheus } from './telemetry/metrics.js'
import { businessMetricsMiddleware, systemMetricsCollector, metricsHandler } from './monitoring/businessMetrics.js'
import { healthCheckHandler, readinessHandler, livenessHandler } from './monitoring/healthCheck.js'

import { openapiSpec } from './openapi.js'
import swaggerUi from 'swagger-ui-express'
import { setRepositories as setAuthRepos } from './services/authService.js'
import { setRepositories as setProjectRepos } from './services/projectService.js'

// Use optimized repositories
import { createOptimizedPrismaRepositories } from './repositories/optimizedPrismaRepositories.js'
import { advancedCache } from './cache/advancedCacheService.js'

// Enhanced queue processing
import { jobProcessor, JobType } from './queues/jobProcessor.js'

import { deepSanitize } from './security/sanitization/sanitize.js'
import { redisSlidingWindowLimiter } from './middleware/rateLimiter.js'
import { listFlags, flagEnabled } from './config/flags.js'
import { requestLoggingMiddleware } from './middleware/requestLoggingMiddleware.js'
import { performanceMonitoringMiddleware, getPerformanceStats } from './middleware/performanceMiddleware.js'
import jwt from 'jsonwebtoken'
import { securityConfig } from './config/index.js'
import { eventBus } from './realtime/eventBus.js'
import v2ProjectsRouter from './api/v2/projects.js'
import v2AuthRouter from './api/v2/auth.js'
import { getSpans } from './telemetry/tracing/tracer.js'

// Performance metrics
const metrics = { reqTotal: 0, reqActive: 0, startTime: Date.now() }

const app = express()
const server = http.createServer(app)

// Resolve dirname for ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Config
const PORT = serverConfig.port
const HOST = serverConfig.host
const NODE_ENV = env.NODE_ENV
const CLIENT_URL = env.CLIENT_URL

app.set('trust proxy', serverConfig.trustProxy)
app.disable('x-powered-by')

// Enhanced initialization with performance optimizations
async function initializeApplication() {
  try {
    logger.info('Starting application initialization...')

    // 1. Initialize advanced cache first
    logger.info('Initializing advanced cache system...')
    await advancedCache.connect()
    
    // 2. Initialize optimized repositories
    logger.info('Initializing optimized database repositories...')
    const repos = await createOptimizedPrismaRepositories()
    setAuthRepos(repos)
    setProjectRepos(repos)
    
    // 3. Initialize job processor
    logger.info('Initializing background job processor...')
    jobProcessor.setRepositories(repos)
    await jobProcessor.scheduleRecurringJobs()
    
    // 4. Start system metrics collection
    logger.info('Starting system metrics collector...')
    systemMetricsCollector.start()
    
    logger.info('Application initialization completed successfully')
  } catch (error) {
    logger.error({ error }, 'Application initialization failed')
    process.exit(1)
  }
}

// Socket.IO with optimizations
let io: any | undefined
async function initializeSocketIO() {
  if (!flagEnabled('REALTIME')) return
  
  try {
    const { Server } = await import('socket.io') as any
    io = new Server(server, { 
      cors: { 
        origin: NODE_ENV === 'production' ? CLIENT_URL : true, 
        credentials: true 
      },
      // Performance optimizations
      pingTimeout: 60000,
      pingInterval: 25000,
      transports: ['websocket', 'polling']
    })
    
    if (flagEnabled('REALTIME_CLUSTER') && process.env.REDIS_URL) {
      try {
        const { createAdapter } = await import('@socket.io/redis-adapter') as any
        const { createClient } = await import('redis') as any
        const pub = createClient({ url: process.env.REDIS_URL })
        const sub = pub.duplicate()
        await pub.connect()
        await sub.connect()
        io.adapter(createAdapter(pub, sub))
        logger.info('Socket.IO Redis adapter enabled')
      } catch (e) { 
        logger.warn({ err: e }, 'Redis adapter setup failed') 
      }
    }
    
    // Enhanced auth middleware with rate limiting
    io.use(asyncErrorHandler(async (socket: any, next: any) => {
      try {
        const token = socket.handshake?.auth?.token || socket.handshake?.query?.token
        if (!token) return next(new Error('unauthorized'))
        
        const payload = jwt.verify(token, securityConfig.jwt.secret)
        socket.user = payload
        
        // Track socket connections
        logger.debug({ userId: (payload as any).email }, 'Socket authenticated')
        next()
      } catch {
        next(new Error('unauthorized'))
      }
    }))
    
    io.on('connection', (socket: any) => {
      if (NODE_ENV !== 'production') {
        logger.debug({ sid: socket.id, userId: socket.user?.email }, 'Socket connected')
      }
      
      // Enhanced heartbeat with performance metrics
      const hb = setInterval(() => { 
        socket.emit('heartbeat', { 
          t: Date.now(),
          server: {
            uptime: process.uptime(),
            memory: process.memoryUsage().rss
          }
        }) 
      }, 10000) // Reduced frequency for performance
      
      socket.on('disconnect', (reason: string) => {
        clearInterval(hb)
        logger.debug({ sid: socket.id, reason }, 'Socket disconnected')
      })
      
      // Error handling
      socket.on('error', (error: Error) => {
        logger.warn({ sid: socket.id, error }, 'Socket error')
      })
    })
    
    // Expose on app
    app.set('io', io)
    
    // Enhanced event forwarding with error handling
    const forwardEvent = (eventName: string, payload: any) => {
      try {
        io?.emit(eventName, {
          ...payload,
          timestamp: new Date().toISOString(),
          serverId: process.env.SERVER_ID || 'default'
        })
      } catch (error) {
        logger.error({ error, eventName }, 'Failed to forward event')
      }
    }
    
    eventBus.on('project.created', (payload: any) => forwardEvent('project.created', payload))
    eventBus.on('project.updated', (payload: any) => forwardEvent('project.updated', payload))
    eventBus.on('project.deleted', (payload: any) => forwardEvent('project.deleted', payload))
    eventBus.on('security.auth.login', (payload: any) => forwardEvent('security.auth.login', payload))
    eventBus.on('security.auth.logout', (payload: any) => forwardEvent('security.auth.logout', payload))
    eventBus.on('security.auth.refresh', (payload: any) => forwardEvent('security.auth.refresh', payload))
    
  } catch (err) {
    logger.warn({ err }, 'Socket.IO initialization failed')
  }
}

// Initialize application
initializeApplication()
initializeSocketIO()

// Enhanced middleware stack with performance optimizations

// Request context and correlation ID
app.use(requestContextMiddleware)
app.use((req, res, next) => {
  const incoming = (req.headers['x-request-id'] as string | undefined)?.slice(0, 100)
  const id = incoming || randomUUID()
  ;(req as any).requestId = id
  res.setHeader('X-Request-Id', id)
  next()
})

// Request logging with performance tracking
if (NODE_ENV !== 'test') {
  app.use(httpLogger)
}
app.use(requestLoggingMiddleware)

// Performance monitoring and business metrics
app.use(performanceMonitoringMiddleware)
app.use(businessMetricsMiddleware())

// Enhanced metrics tracking
app.use((req, res, next) => {
  metrics.reqTotal++
  metrics.reqActive++
  const start = process.hrtime.bigint()
  
  res.on('finish', () => {
    metrics.reqActive--
    const durNs = Number(process.hrtime.bigint() - start)
    const route = (req as any).route?.path || req.path
    httpLatency.labels(req.method, route, String(res.statusCode)).observe(durNs / 1e9)
  })
  
  next()
})

// Security headers with enhanced CSP
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
    hsts: NODE_ENV === 'production' ? { 
      maxAge: 31536000, // 1 year
      includeSubDomains: true, 
      preload: true 
    } : false,
  })
)

// Enhanced permissions policy
app.use((_req, res, next) => {
  res.setHeader('Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()')
  next()
})

// CORS with enhanced configuration
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) return callback(null, true)
      return callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
    maxAge: 86400, // 24 hours
    optionsSuccessStatus: 200,
  })
)

// Enhanced parsers with better limits
app.use(express.json({ 
  limit: '2mb',
  verify: (req: any, res, buf) => {
    // Store raw body for signature verification if needed
    req.rawBody = buf
  }
}))
app.use(express.urlencoded({ extended: true, limit: '2mb' }))
app.use(cookieParser())

// Enhanced sanitization
app.use((req, _res, next) => {
  if (req.body && typeof req.body === 'object') {
    (req as any).sanitizedBody = deepSanitize(req.body)
  }
  next()
})

// Compression with better settings
app.use(compression({
  threshold: 1024,
  level: 6,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false
    return compression.filter(req, res)
  }
}))

// Enhanced rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increased for better UX
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP',
    retryAfter: '15 minutes'
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path.startsWith('/health') || req.path === '/ready'
  }
})
app.use('/api/', limiter)

// Enhanced auth rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Stricter for auth
  message: { 
    error: 'Too many authentication attempts', 
    retryAfter: '15 minutes' 
  },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
})
app.use('/api/auth/login', authLimiter)
app.use('/api/v2/auth/login', authLimiter)

// Distributed Redis-based rate limiting for critical endpoints
app.use('/api/v2/auth/login', redisSlidingWindowLimiter({ 
  windowMs: 15 * 60 * 1000, 
  max: 50 
}))

// CSRF setup with enhanced security
const SESSION_SECURE = String(process.env.SESSION_SECURE) === 'true'
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN
const CSRF_COOKIE_NAME = SESSION_SECURE && !COOKIE_DOMAIN ? 
  '__Host-csrf' : 
  (process.env.CSRF_COOKIE_NAME || 'csrf_token')

const csrfProtection = csrf({ 
  cookie: { 
    key: CSRF_COOKIE_NAME, 
    httpOnly: true, 
    sameSite: 'lax', 
    secure: SESSION_SECURE, 
    path: '/'
  } 
})

// Enhanced health check endpoints
app.get('/health', healthCheckHandler())
app.get('/health/detailed', healthCheckHandler())
app.get('/ready', readinessHandler())
app.get('/healthz', livenessHandler())

// Legacy health endpoint
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

// Enhanced metrics endpoints
app.get('/metrics', metricsHandler())
exposePrometheus(app)

// Queue management endpoints
app.get('/api/admin/queues', asyncErrorHandler(async (_req, res) => {
  const stats = await jobProcessor.getQueueStats()
  res.json({ success: true, data: stats })
}))

app.post('/api/admin/queues/cleanup', asyncErrorHandler(async (_req, res) => {
  await jobProcessor.cleanupCompletedJobs()
  res.json({ success: true, message: 'Queue cleanup completed' })
}))

// CSRF token endpoint
app.get('/api/csrf-token', csrfProtection, (req: Request, res: Response) => {
  const token = (req as any).csrfToken?.() as string | undefined
  res.json({ csrfToken: token })
})

// Apply CSRF protection selectively
app.use((req: Request, res: Response, next: NextFunction) => {
  const method = req.method
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return next()
  
  const path = req.path
  if (
    path.startsWith('/api/auth/') || 
    path.startsWith('/api/v2/auth/') ||
    path.includes('/health') ||
    path === '/metrics' ||
    path === '/ready'
  ) return next()
  
  return (csrfProtection as any)(req, res, next)
})

// API discovery
app.get('/api', (_req, res) => {
  res.json({ 
    versions: ['v2', 'v1'], 
    docs: ['/api/v1/docs', '/api/v2/spec'], 
    health: ['/health', '/ready', '/api/health'],
    metrics: '/metrics'
  })
})

// API specifications
app.get('/api/v2/spec', (_req, res) => {
  res.json({ 
    openapi: '3.0.3', 
    info: { 
      title: '3D Printer Project API', 
      version: '2.0.0',
      description: 'Optimized API with enhanced performance and monitoring'
    },
    servers: [
      { url: '/api/v2', description: 'Version 2.0 (Current)' }
    ]
  })
})

// Documentation
if (NODE_ENV !== 'production') {
  app.get('/api/v1/spec', (_req, res) => res.json(openapiSpec))
  app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec))
}

// Enhanced metrics endpoint
app.get('/api/metrics', asyncErrorHandler(async (_req, res) => {
  const performanceStats = getPerformanceStats()
  const cacheStats = advancedCache.getStats()
  
  res.json({
    ...metrics,
    uptime: process.uptime(),
    startTime: metrics.startTime,
    memoryRss: process.memoryUsage().rss,
    performance: performanceStats,
    cache: cacheStats,
    spans: getSpans()
  })
}))

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    message: 'High-Performance 3D Printer Backend',
    version: process.env.npm_package_version || '0.2.0',
    api: '/api',
    docs: '/api/v1/docs',
    health: '/health',
    metrics: '/metrics',
    features: [
      'Advanced Redis caching with compression',
      'Optimized database connection pooling',
      'Background job processing with Bull',
      'Enhanced error handling and monitoring',
      'Comprehensive health checks and metrics'
    ]
  })
})

// Optional static frontend serving
if (process.env.SERVE_FRONTEND === 'true') {
  const distDir = path.resolve(__dirname, '../../frontend/dist')
  app.use(express.static(distDir, {
    maxAge: NODE_ENV === 'production' ? '1d' : 0,
    etag: true,
    lastModified: true
  }))
  
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/health') || req.path.startsWith('/metrics')) {
      return next()
    }
    res.sendFile(path.join(distDir, 'index.html'), err => { 
      if (err) next(err) 
    })
  })
}

// API routes (v2 preferred)
app.use('/api/v2/auth', v2AuthRouter)
app.use('/api/v2/projects', v2ProjectsRouter)

// V1 routes with deprecation warnings
app.use('/api/v1/auth', (req, res, next) => {
  res.setHeader('X-API-Deprecated', 'true')
  res.setHeader('X-API-Deprecation-Info', 'This API version is deprecated. Please use /api/v2/auth')
  res.setHeader('Sunset', 'Sat, 01 Jan 2025 00:00:00 GMT') // RFC 8594
  next()
}, authRouter)

app.use('/api/v1/projects', authenticateJWT, (req, res, next) => {
  res.setHeader('X-API-Deprecated', 'true')
  res.setHeader('X-API-Deprecation-Info', 'This API version is deprecated. Please use /api/v2/projects')
  res.setHeader('Sunset', 'Sat, 01 Jan 2025 00:00:00 GMT')
  next()
}, projectsRouter)

// Legacy compatibility routes
app.use('/api/auth', (req, res, next) => {
  res.setHeader('X-API-Deprecated', 'true') 
  res.setHeader('X-API-Deprecation-Info', 'This API version is deprecated. Please use /api/v2/auth')
  next()
}, authRouter)

app.use('/api/projects', authenticateJWT, (req, res, next) => {
  res.setHeader('X-API-Deprecated', 'true')
  res.setHeader('X-API-Deprecation-Info', 'This API version is deprecated. Please use /api/v2/projects')
  next()
}, projectsRouter)

// Feature flags endpoint
app.get('/api/v1/flags', (_req, res) => { 
  res.json({ flags: listFlags() }) 
})

// Enhanced error handling middleware chain
app.use(rateLimitErrorHandler)
app.use(validationErrorHandler)

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
      status: 404,
      timestamp: new Date().toISOString()
    }
  })
})

// Enhanced error handler (must be last)
app.use(enhancedErrorHandler)

// Graceful shutdown handling
async function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`)
  
  try {
    // Stop accepting new connections
    server.close(() => {
      logger.info('HTTP server closed')
    })
    
    // Stop system metrics collection
    systemMetricsCollector.stop()
    
    // Shutdown job processor
    await jobProcessor.gracefulShutdown()
    
    // Disconnect from advanced cache
    await advancedCache.disconnect()
    
    logger.info('Graceful shutdown completed')
    process.exit(0)
  } catch (error) {
    logger.error({ error }, 'Error during graceful shutdown')
    process.exit(1)
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.fatal({ error }, 'Uncaught exception')
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.fatal({ reason, promise }, 'Unhandled promise rejection')
  process.exit(1)
})

// Start server
if (env.NODE_ENV !== 'test' && !process.env.NO_LISTEN) {
  server.listen(PORT, HOST, () => {
    logger.info({ 
      msg: 'Optimized API server listening',
      url: `http://${HOST}:${PORT}`, 
      env: NODE_ENV,
      features: [
        'Advanced Redis caching',
        'Database connection pooling',
        'Background job processing',
        'Enhanced monitoring'
      ]
    })
    if (!isProd) logger.debug({ allowedOrigins })
  })
}

export { server, app }
export default app
import 'dotenv/config';
import express from 'express';
import http from 'http';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import rateLimit from 'express-rate-limit';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';
import { authenticateJWT } from './middleware/authMiddleware.js';
import authRouter from './routes/auth.js';
import projectsRouter from './routes/projects.js';
const app = express();
const server = http.createServer(app);
// Config
const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || CLIENT_URL)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
const LOG_LEVEL = process.env.LOG_LEVEL || 'dev';
const TRUST_PROXY = Number(process.env.TRUST_PROXY || '1');
app.set('trust proxy', TRUST_PROXY);
app.disable('x-powered-by');
// Fail-fast checks for critical production configuration
if (process.env.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET) {
        console.error('FATAL: JWT_SECRET is not set in production');
        process.exit(1);
    }
}
// Socket.IO is optional; guard require to avoid top-level import side effects in tests
let io;
(async () => {
    try {
        const { Server } = await import('socket.io');
        io = new Server(server, { cors: { origin: CLIENT_URL, credentials: true } });
        io.on('connection', (socket) => {
            if (NODE_ENV !== 'production')
                console.info('Socket client connected');
            const interval = setInterval(() => {
                socket.emit('heartbeat', { t: Date.now() });
            }, 5000);
            socket.on('disconnect', () => clearInterval(interval));
        });
    }
    catch { }
})();
// Security headers
app.use(helmet({
    contentSecurityPolicy: NODE_ENV === 'production' ? {
        useDefaults: true,
        directives: {
            "default-src": ["'self'"],
            "connect-src": ["'self'", ...ALLOWED_ORIGINS],
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
}));
// Add explicit Permissions-Policy restrictions
app.use((_req, res, next) => {
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
});
// Logging
if (NODE_ENV !== 'test') {
    app.use(morgan(LOG_LEVEL));
}
// CORS
app.use(cors({
    origin: function (origin, callback) {
        if (!origin)
            return callback(null, true);
        if (ALLOWED_ORIGINS.includes(origin))
            return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
// Parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Compression
app.use(compression());
// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});
app.use('/api/', limiter);
// Additional rate limit for auth to mitigate brute-force/credential stuffing
const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 20,
    message: { message: 'Too many attempts, please try again later.' },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});
app.use('/api/auth/login', authLimiter);
// CSRF setup (cookie-based)
const SESSION_SECURE = String(process.env.SESSION_SECURE) === 'true';
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;
const CSRF_COOKIE_NAME = SESSION_SECURE && !COOKIE_DOMAIN ? '__Host-csrf' : (process.env.CSRF_COOKIE_NAME || 'csrf_token');
const csrfProtection = csrf({ cookie: { key: CSRF_COOKIE_NAME, httpOnly: true, sameSite: 'lax', secure: SESSION_SECURE, path: '/' } });
// CSRF token route for clients to fetch token from cookie and echo header back
app.get('/api/csrf-token', csrfProtection, (req, res) => {
    // csurf will set the cookie; we also send the token for convenience
    const token = req.csrfToken?.();
    res.json({ csrfToken: token });
});
// Apply CSRF to state-changing requests, with whitelist for auth endpoints
app.use((req, res, next) => {
    const method = req.method;
    if (['GET', 'HEAD', 'OPTIONS'].includes(method))
        return next();
    const path = req.path;
    if (path.startsWith('/api/auth/login') || path.startsWith('/api/auth/logout'))
        return next();
    return csrfProtection(req, res, next);
});
// Healthcheck
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', env: NODE_ENV, uptime: process.uptime() });
});
// Routes
app.use('/api/auth', authRouter);
app.use('/api/projects', authenticateJWT, projectsRouter);
// 404 + error handlers
app.use(notFoundHandler);
app.use(errorHandler);
// Start server if run directly
if (process.argv[1] && process.argv[1].includes('server/index.ts')) {
    server.listen(PORT, HOST, () => {
        console.info(`API listening on http://${HOST}:${PORT}`);
    });
}
export default app;

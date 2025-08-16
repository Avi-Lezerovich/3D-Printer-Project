import { Router, Request, Response, type CookieOptions } from 'express'
import jwt from 'jsonwebtoken'
import { issueToken, verifyCredentials, issueAuthPair, rotateRefreshToken, revokeRefreshToken, validatePasswordPolicy, getUserByEmail } from '../services/authService.js'
import { register as registerUser } from '../services/authService.js'
import { securityConfig } from '../config/index.js'
import { z } from 'zod'
import { validateBody } from '../middleware/validate.js'
import { authenticateJWT } from '../middleware/authMiddleware.js'
import { requireRole } from '../middleware/roleMiddleware.js'
import { auditSecurity } from '../audit/auditLog.js'
import { eventBus, EVENT_VERSION } from '../realtime/eventBus.js'
import client from 'prom-client'
const loginCounter = client.register.getSingleMetric('auth_logins_total') as any
const refreshHist = client.register.getSingleMetric('auth_refresh_latency_seconds') as any

const router = Router()

const loginSchema = z.object({
	email: z.string().email().transform(v => v.toLowerCase()),
	password: z.string().min(8).max(128)
})

const registerSchema = loginSchema.extend({
	role: z.string().optional().default('user')
})

router.post('/register', validateBody(registerSchema), async (req: Request, res: Response) => {
	const { email, password, role } = (req as any).validatedBody as z.infer<typeof registerSchema>
	if (!validatePasswordPolicy(password)) return res.status(400).json({ message: 'Password does not meet complexity requirements' })
	try {
		const user = await registerUser(email, password, role)
		res.status(201).json({ user })
	} catch (e: any) {
		res.status(e.status || 500).json({ message: e.message || 'Registration failed' })
	}
})

router.post('/login', validateBody(loginSchema), async (req: Request, res: Response) => {
	const { email, password } = (req as any).validatedBody as z.infer<typeof loginSchema>
	const user = await verifyCredentials(email, password) as { email: string; role: string } | null
	if (!user) {
		auditSecurity('auth.login.failure', { userEmail: email, ip: req.ip })
		return res.status(401).json({ message: 'Invalid credentials' })
	}
	const pair = await issueAuthPair(user)
	const SESSION_SECURE = String(process.env.SESSION_SECURE) === 'true'
	const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN
	const cookieOptions: CookieOptions = {
		httpOnly: true,
		sameSite: 'lax',
		secure: SESSION_SECURE,
		maxAge: 7 * 24 * 60 * 60 * 1000,
		path: '/',
	}
	if (COOKIE_DOMAIN) cookieOptions.domain = COOKIE_DOMAIN
	const cookieName = SESSION_SECURE && !COOKIE_DOMAIN ? '__Host-token' : 'token'
	res.cookie(cookieName, pair.access, cookieOptions)
	auditSecurity('auth.login.success', { userEmail: email, ip: req.ip })
	if (loginCounter) loginCounter.inc()
	eventBus.emitEvent({ type: 'security.auth.login', payload: { version: EVENT_VERSION, data: { email } } })
	res.json({ token: pair.access, refreshToken: pair.refresh, user: { email, role: user.role } })
})

router.post('/logout', (req, res) => {
	const userEmail = (req as any).user?.email
	auditSecurity('auth.logout', { userEmail, ip: req.ip })
	eventBus.emitEvent({ type: 'security.auth.logout', payload: { version: EVENT_VERSION, data: { email: userEmail } } })
	res.clearCookie('token', { path: '/' })
	res.clearCookie('__Host-token', { path: '/' })
	res.status(204).end()
})

// Refresh token rotation endpoint
router.post('/refresh', async (req, res) => {
	const { refreshToken } = req.body || {}
	if (!refreshToken || typeof refreshToken !== 'string') return res.status(400).json({ message: 'refreshToken required' })
	const start = process.hrtime.bigint()
	const rotated = await rotateRefreshToken(refreshToken)
	if (!rotated) return res.status(401).json({ message: 'Invalid refresh token' })
	// repository-backed role retrieval
	let role = 'user'
	try {
		const user = await getUserByEmail(rotated.userEmail)
		if (user) role = user.role
	} catch { /* ignore */ }
	const access = issueToken({ email: rotated.userEmail, role })
	auditSecurity('auth.refresh', { userEmail: rotated.userEmail, ip: req.ip })
	if (refreshHist) {
		const dur = Number(process.hrtime.bigint() - start) / 1e9
		refreshHist.observe(dur)
	}
	eventBus.emitEvent({ type: 'security.auth.refresh', payload: { version: EVENT_VERSION, data: { email: rotated.userEmail } } })
	res.json({ token: access, refreshToken: rotated.refresh })
})

router.post('/revoke', async (req, res) => {
	const { refreshToken } = req.body || {}
	if (!refreshToken) return res.status(400).json({ message: 'refreshToken required' })
	await revokeRefreshToken(refreshToken)
	res.status(204).end()
})

router.get('/me', (req, res) => {
	const rawCookie = (req as any).cookies?.['__Host-token'] || (req as any).cookies?.token
	const token = rawCookie as string | undefined
	if (!token) return res.status(200).json({ user: null })
	try {
		const payload = jwt.verify(token, securityConfig.jwt.secret)
		return res.json({ user: payload })
	} catch {
		return res.json({ user: null })
	}
})

// RBAC demo
router.get('/admin/ping', authenticateJWT, requireRole('admin'), (_req, res) => {
	res.json({ ok: true })
})

// Method guards
router.all('/login', (_req, res) => res.status(405).json({ message: 'Method Not Allowed' }))
router.all('/logout', (_req, res) => res.status(405).json({ message: 'Method Not Allowed' }))
router.all('/me', (_req, res) => res.status(405).json({ message: 'Method Not Allowed' }))
router.all('/register', (_req, res) => res.status(405).json({ message: 'Method Not Allowed' }))
router.all('/refresh', (_req, res) => res.status(405).json({ message: 'Method Not Allowed' }))
router.all('/revoke', (_req, res) => res.status(405).json({ message: 'Method Not Allowed' }))

export default router

import { Router, Request, Response, type CookieOptions } from 'express'
import jwt from 'jsonwebtoken'
import { issueToken, verifyCredentials } from '../services/authService.js'
import { z } from 'zod'
import { validateBody } from '../middleware/validate.js'
import { authenticateJWT } from '../middleware/authMiddleware.js'
import { requireRole } from '../middleware/roleMiddleware.js'

const router = Router()

const loginSchema = z.object({
	email: z.string().email().transform(v => v.toLowerCase()),
	password: z.string().min(8).max(128)
})

router.post('/login', validateBody(loginSchema), async (req: Request, res: Response) => {
	const { email, password } = (req as any).validatedBody as z.infer<typeof loginSchema>
	const user = await verifyCredentials(email, password) as { email: string; role: string } | null
	if (!user) return res.status(401).json({ message: 'Invalid credentials' })
	const token = issueToken(user)
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
	res.cookie(cookieName, token, cookieOptions)
	res.json({ token, user: { email, role: user.role } })
})

router.post('/logout', (_req, res) => {
	res.clearCookie('token', { path: '/' })
	res.clearCookie('__Host-token', { path: '/' })
	res.status(204).end()
})

router.get('/me', (req, res) => {
	const token = (req as any).cookies?.token as string | undefined
	if (!token) return res.status(200).json({ user: null })
	try {
		const payload = jwt.decode(token)
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

export default router

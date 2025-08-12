import { Router, Request, Response, type CookieOptions } from 'express'
import { body, validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import jwt, { type SignOptions } from 'jsonwebtoken'

const router = Router()

// In-memory demo user store (replace with DB)
const users = new Map<string, { email: string; passwordHash: string; role: 'user' | 'admin' }>()
const demoEmail = 'demo@example.com'
const demoPassword = 'Password123!'
const demoHash = bcrypt.hashSync(demoPassword, 10)
users.set(demoEmail, { email: demoEmail, passwordHash: demoHash, role: 'user' })

router.post(
	'/login',
	body('email').isEmail().normalizeEmail(),
	body('password').isString().isLength({ min: 8, max: 128 }),
	(req: Request, res: Response) => {
		const errors = validationResult(req)
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

		const { email, password } = req.body as { email: string; password: string }
		const user = users.get(email)
		if (!user) return res.status(401).json({ message: 'Invalid credentials' })
		const ok = bcrypt.compareSync(password, user.passwordHash)
		if (!ok) return res.status(401).json({ message: 'Invalid credentials' })

		const secret = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'replace_me_dev_only' : '')
		if (!secret) return res.status(500).json({ message: 'Server configuration error' })
		const expiresIn = ((process.env.JWT_EXPIRES as any) || '1h') as any
		const opts: SignOptions = { expiresIn: expiresIn as any }
		const token = jwt.sign({ sub: email, email, role: user.role }, secret, opts)

		const SESSION_SECURE = String(process.env.SESSION_SECURE) === 'true'
		const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN
		const cookieOptions: CookieOptions = {
			httpOnly: true,
			sameSite: 'lax',
			secure: SESSION_SECURE,
			maxAge: 7 * 24 * 60 * 60 * 1000,
		}
		if (COOKIE_DOMAIN) cookieOptions.domain = COOKIE_DOMAIN
		res.cookie('token', token, cookieOptions)
		// For SPA convenience we also return token (use cookie by default)
		res.json({ token, user: { email, role: user.role } })
	}
)

router.post('/logout', (_req, res) => {
	res.clearCookie('token')
	res.status(204).end()
})

router.get('/me', (req, res) => {
	// For demo: decode cookie if present
	const token = (req as any).cookies?.token as string | undefined
	if (!token) return res.status(200).json({ user: null })
	try {
		const payload = jwt.decode(token)
		return res.json({ user: payload })
	} catch {
		return res.json({ user: null })
	}
})

// 405 for unsupported methods
router.all('/login', (_req, res) => res.status(405).json({ message: 'Method Not Allowed' }))
router.all('/logout', (_req, res) => res.status(405).json({ message: 'Method Not Allowed' }))
router.all('/me', (_req, res) => res.status(405).json({ message: 'Method Not Allowed' }))

export default router

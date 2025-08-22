import { Router } from 'express'
import { validateBody } from '../../middleware/validate.js'
import { z } from 'zod'
import { 
  register, 
  verifyCredentials, 
  getUserByEmail, 
  issueAuthPair,
  rotateRefreshToken,
  revokeRefreshToken 
} from '../../services/authService.js'
import { authenticateJWT } from '../../middleware/authMiddleware.js'

// V2 Auth Routes - standardized responses, no wrappers, consistent error handling
const router = Router()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'user']).default('user')
})

// Login - returns user and sets httpOnly cookie
router.post('/login', validateBody(loginSchema), async (req, res) => {
  const body = (req as any).validatedBody as z.infer<typeof loginSchema>
  const user = await verifyCredentials(body.email, body.password)
  
  if (!user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
        status: 401,
        timestamp: new Date().toISOString()
      }
    })
  }
  
  const authPair = await issueAuthPair(user)
  
  res.cookie('refreshToken', authPair.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  })
  
  res.status(200).json({
    user,
    accessToken: authPair.accessToken
  })
})

// Register - creates new user
router.post('/register', validateBody(registerSchema), async (req, res) => {
  const body = (req as any).validatedBody as z.infer<typeof registerSchema>
  const user = await register(body.email, body.password, body.role)
  const authPair = await issueAuthPair(user)
  
  res.cookie('refreshToken', authPair.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  })
  
  res.status(201).json({
    user,
    accessToken: authPair.accessToken
  })
})

// Refresh token - returns new access token
router.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies?.refreshToken
  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'NO_REFRESH_TOKEN',
        message: 'Refresh token not provided',
        status: 401,
        timestamp: new Date().toISOString()
      }
    })
  }
  
  try {
    const result = await rotateRefreshToken(refreshToken)
    
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    
    res.json({
      accessToken: result.accessToken
    })
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Invalid or expired refresh token',
        status: 401,
        timestamp: new Date().toISOString()
      }
    })
  }
})

// Logout - clears refresh token
router.post('/logout', async (req, res) => {
  const refreshToken = req.cookies?.refreshToken
  if (refreshToken) {
    await revokeRefreshToken(refreshToken)
  }
  
  res.clearCookie('refreshToken')
  res.status(200).json({
    message: 'Logged out successfully'
  })
})

// Get current user - requires auth
router.get('/me', authenticateJWT, async (req, res) => {
  const user = await getUserByEmail((req as any).user.email)
  if (!user) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        status: 404,
        timestamp: new Date().toISOString()
      }
    })
  }
  
  res.json(user)
})

export default router
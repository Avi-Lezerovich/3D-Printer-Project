import bcrypt from 'bcryptjs'
import jwt, { SignOptions } from 'jsonwebtoken'
import { securityConfig } from '../config/index.js'
import { AppError } from '../errors/AppError.js'
import { Repositories } from '../repositories/types.js'

interface UserPayload { email: string; role: string }

let repositories: Repositories | undefined
export function setRepositories(repos: Repositories) { repositories = repos }

// Provide a fallback single demo user if repositories not yet set (mainly for tests before init)
const fallbackUsers = new Map<string, { email: string; passwordHash: string; role: string }>()
const demoEmail = 'demo@example.com'
if (!fallbackUsers.has(demoEmail)) {
  fallbackUsers.set(demoEmail, { email: demoEmail, passwordHash: bcrypt.hashSync('Password123!', 10), role: 'user' })
}

export async function register(email: string, password: string, role: string = 'user') {
  if (!repositories) throw new Error('Repositories not initialized')
  const existing = await repositories.users.findByEmail(email)
  if (existing) throw new AppError('Email already registered', 400, 'EMAIL_EXISTS')
  const passwordHash = await bcrypt.hash(password, 10)
  await repositories.users.create({ email, passwordHash, role })
  return { email, role }
}

export async function verifyCredentials(email: string, password: string) {
  if (repositories) {
    const user = await repositories.users.findByEmail(email)
    if (!user) return null
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return null
    return { email: user.email, role: user.role }
  } else {
    const u = fallbackUsers.get(email)
    if (!u) return null
    const ok = bcrypt.compareSync(password, u.passwordHash)
    if (!ok) return null
    return { email: u.email, role: u.role }
  }
}

export function issueToken(user: UserPayload) {
  const secret = securityConfig.jwt.secret
  if (!secret) throw new Error('JWT secret misconfigured')
  const token = jwt.sign({ sub: user.email, email: user.email, role: user.role }, secret, { expiresIn: securityConfig.jwt.expiresIn } as SignOptions)
  return token
}

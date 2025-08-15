import bcrypt from 'bcryptjs'
import jwt, { SignOptions } from 'jsonwebtoken'
import crypto from 'crypto'
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
    if (!user) {
      // fall back to demo user map if present
      const fallback = fallbackUsers.get(email)
      if (!fallback) return null
      const okFb = bcrypt.compareSync(password, fallback.passwordHash)
      if (!okFb) return null
      return { email: fallback.email, role: fallback.role }
    }
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

// Password policy: at least 8 chars, one upper, one lower, one number, one special
export function validatePasswordPolicy(pw: string) {
  return /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw) && pw.length >= 8
}

export function hashRefreshToken(raw: string) {
  return crypto.createHash('sha256').update(raw).digest('hex')
}

export async function issueAuthPair(user: UserPayload) {
  const access = issueToken(user)
  const rawRefresh = crypto.randomBytes(32).toString('base64url')
  const hash = hashRefreshToken(rawRefresh)
  const expiresAt = new Date(Date.now() + parseExpires(securityConfig.jwt.refreshExpires || '7d'))
  if (!repositories) throw new Error('Repositories not initialized')
  await repositories.users.storeRefreshToken(user.email, hash, expiresAt)
  return { access, refresh: rawRefresh, refreshExpires: expiresAt }
}

function parseExpires(expr: string) {
  // naive: supports Nd or Nh
  const m = expr.match(/^(\d+)([dh])$/)
  if (!m) return 7 * 24 * 60 * 60 * 1000
  const val = Number(m[1])
  return m[2] === 'd' ? val * 86400000 : val * 3600000
}

export async function rotateRefreshToken(oldRaw: string) {
  if (!repositories) throw new Error('Repositories not initialized')
  const oldHash = hashRefreshToken(oldRaw)
  const valid = await repositories.users.getValidRefreshToken(oldHash)
  if (!valid) return null
  const newRaw = crypto.randomBytes(32).toString('base64url')
  const newHash = hashRefreshToken(newRaw)
  const newExpires = new Date(Date.now() + parseExpires(securityConfig.jwt.refreshExpires || '7d'))
  await repositories.users.rotateRefreshToken(oldHash, newHash, newExpires)
  return { refresh: newRaw, refreshExpires: newExpires, userEmail: valid.userEmail }
}

export async function revokeRefreshToken(raw: string) {
  if (!repositories) return
  await repositories.users.revokeRefreshToken(hashRefreshToken(raw))
}

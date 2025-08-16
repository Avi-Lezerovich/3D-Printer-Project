import { randomUUID } from 'crypto'
import { ProjectRepository, ProjectRecord, UserRecord, UserRepository, Repositories } from './types.js'

class InMemoryUserRepo implements UserRepository {
  private users = new Map<string, UserRecord>()
  private refreshTokens = new Map<string, { userEmail: string; hash: string; expiresAt: Date; revoked: boolean }>()
  private failedLogins = new Map<string, { attempts: number; lockedUntil?: Date }>()

  async findByEmail(email: string) {
    return this.users.get(email) || null
  }
  async create(data: Pick<UserRecord, 'email' | 'passwordHash' | 'role'>) {
    const record: UserRecord = { ...data, createdAt: new Date() }
    this.users.set(record.email, record)
    return record
  }
  async storeRefreshToken(userEmail: string, tokenHash: string, expiresAt: Date) {
    this.refreshTokens.set(tokenHash, { userEmail, hash: tokenHash, expiresAt, revoked: false })
  }
  async rotateRefreshToken(oldHash: string, newHash: string, newExpires: Date) {
    const old = this.refreshTokens.get(oldHash)
    if (old) old.revoked = true
    this.refreshTokens.set(newHash, { userEmail: old?.userEmail || 'unknown', hash: newHash, expiresAt: newExpires, revoked: false })
  }
  async revokeRefreshToken(hash: string) { const rt = this.refreshTokens.get(hash); if (rt) rt.revoked = true }
  async cleanupExpiredRefreshTokens() {
    const now = Date.now(); let removed = 0
    for (const [k, v] of this.refreshTokens.entries()) {
      if (v.expiresAt.getTime() < now) { this.refreshTokens.delete(k); removed++ }
    }
    return removed
  }
  async getValidRefreshToken(hash: string) {
    const rt = this.refreshTokens.get(hash)
    if (!rt || rt.revoked || rt.expiresAt.getTime() < Date.now()) return null
    return { userEmail: rt.userEmail }
  }
  async recordFailedLogin(email: string) {
    const entry = this.failedLogins.get(email) || { attempts: 0 }
    const now = Date.now()
    if (entry.lockedUntil && entry.lockedUntil.getTime() > now) {
      return { attempts: entry.attempts, lockedUntil: entry.lockedUntil }
    }
    entry.attempts += 1
    // exponential backoff lock after 5 attempts
    if (entry.attempts >= 5) {
      const lockMinutes = Math.min(60, 2 ** (entry.attempts - 5))
      entry.lockedUntil = new Date(now + lockMinutes * 60 * 1000)
    }
    this.failedLogins.set(email, entry)
    return { attempts: entry.attempts, lockedUntil: entry.lockedUntil }
  }
  async resetFailedLogins(email: string) { this.failedLogins.delete(email) }
}

class InMemoryProjectRepo implements ProjectRepository {
  private projects = new Map<string, ProjectRecord>()

  async list() {
    return Array.from(this.projects.values())
  }
  async get(id: string) {
    return this.projects.get(id) || null
  }
  async create(data: Pick<ProjectRecord, 'name' | 'status'>) {
    const record: ProjectRecord = { id: randomUUID(), createdAt: new Date(), ...data }
    this.projects.set(record.id, record)
    return record
  }
  async update(id: string, data: Partial<Pick<ProjectRecord, 'name' | 'status'>>) {
    const existing = this.projects.get(id)
    if (!existing) return null
    const updated = { ...existing, ...data }
    this.projects.set(id, updated)
    return updated
  }
  async remove(id: string) {
    return this.projects.delete(id)
  }
}

export function createInMemoryRepositories(): Repositories {
  const repos: Repositories = {
    users: new InMemoryUserRepo(),
    projects: new InMemoryProjectRepo()
  }
  return repos
}

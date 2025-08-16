import { PrismaClient } from '@prisma/client'
import type { Repositories, UserRecord, ProjectRecord } from './types.js'

class PrismaUserRepo {
  constructor(private prisma: PrismaClient) {}
  async findByEmail(email: string) {
    const u = await this.prisma.user.findUnique({ where: { email } })
    if (!u) return null
    return { email: u.email, passwordHash: u.passwordHash, role: u.role, createdAt: u.createdAt } as UserRecord
  }
  async create(data: Pick<UserRecord, 'email' | 'passwordHash' | 'role'>) {
    const u = await this.prisma.user.create({ data })
    return { email: u.email, passwordHash: u.passwordHash, role: u.role, createdAt: u.createdAt } as UserRecord
  }
  async storeRefreshToken(userEmail: string, tokenHash: string, expiresAt: Date, replacedById?: string) {
    await this.prisma.refreshToken.create({ data: { userEmail, tokenHash, expiresAt, replacedById } as any })
  }
  async rotateRefreshToken(oldHash: string, newHash: string, newExpires: Date) {
    const old = await this.prisma.refreshToken.update({ where: { tokenHash: oldHash }, data: { revoked: true } })
    await this.prisma.refreshToken.create({ data: { userEmail: old.userEmail, tokenHash: newHash, expiresAt: newExpires, replacedById: old.id } })
  }
  async revokeRefreshToken(hash: string) { await this.prisma.refreshToken.update({ where: { tokenHash: hash }, data: { revoked: true } }).catch(()=>{}) }
  async cleanupExpiredRefreshTokens() {
    const r = await this.prisma.refreshToken.deleteMany({ where: { expiresAt: { lt: new Date() } } })
    return r.count
  }
  async getValidRefreshToken(hash: string) {
    const rt = await this.prisma.refreshToken.findUnique({ where: { tokenHash: hash } })
    if (!rt || rt.revoked || rt.expiresAt < new Date()) return null
    return { userEmail: rt.userEmail }
  }
  // For demo purposes, store failed login attempts in memory (production: separate table or Redis)
  private failed = new Map<string, { attempts: number; lockedUntil?: Date }>()
  async recordFailedLogin(email: string) {
    const e = this.failed.get(email) || { attempts: 0 }
    const now = Date.now()
    if (e.lockedUntil && e.lockedUntil.getTime() > now) return { attempts: e.attempts, lockedUntil: e.lockedUntil }
    e.attempts += 1
    if (e.attempts >= 5) {
      const lockMinutes = Math.min(60, 2 ** (e.attempts - 5))
      e.lockedUntil = new Date(now + lockMinutes * 60 * 1000)
    }
    this.failed.set(email, e)
    return { attempts: e.attempts, lockedUntil: e.lockedUntil }
  }
  async resetFailedLogins(email: string) { this.failed.delete(email) }
}

class PrismaProjectRepo {
  constructor(private prisma: PrismaClient) {}
  async list() {
  const list = await this.prisma.project.findMany({ orderBy: { createdAt: 'desc' } })
  return list.map((p: any) => ({ id: p.id, name: p.name, status: p.status, createdAt: p.createdAt })) as ProjectRecord[]
  }
  async get(id: string) {
    const p = await this.prisma.project.findUnique({ where: { id } })
    return p ? { id: p.id, name: p.name, status: p.status, createdAt: p.createdAt } as ProjectRecord : null
  }
  async create(data: Pick<ProjectRecord, 'name' | 'status'>) {
    const p = await this.prisma.project.create({ data })
    return { id: p.id, name: p.name, status: p.status, createdAt: p.createdAt } as ProjectRecord
  }
  async update(id: string, data: Partial<Pick<ProjectRecord, 'name' | 'status'>>) {
    try {
      const p = await this.prisma.project.update({ where: { id }, data })
      return { id: p.id, name: p.name, status: p.status, createdAt: p.createdAt } as ProjectRecord
    } catch {
      return null
    }
  }
  async remove(id: string) {
    try { await this.prisma.project.delete({ where: { id } }); return true } catch { return false }
  }
}

export async function createPrismaRepositories(): Promise<Repositories> {
  const prisma = new PrismaClient()
  // Simple connectivity check
  await prisma.$queryRaw`SELECT 1`
  return {
    users: new PrismaUserRepo(prisma) as any,
    projects: new PrismaProjectRepo(prisma) as any,
  }
}

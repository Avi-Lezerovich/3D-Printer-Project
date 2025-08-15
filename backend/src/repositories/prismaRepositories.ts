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

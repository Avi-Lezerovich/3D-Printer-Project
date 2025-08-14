import { randomUUID } from 'crypto'
import { ProjectRepository, ProjectRecord, UserRecord, UserRepository, Repositories } from './types.js'

class InMemoryUserRepo implements UserRepository {
  private users = new Map<string, UserRecord>()

  async findByEmail(email: string) {
    return this.users.get(email) || null
  }
  async create(data: Pick<UserRecord, 'email' | 'passwordHash' | 'role'>) {
    const record: UserRecord = { ...data, createdAt: new Date() }
    this.users.set(record.email, record)
    return record
  }
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

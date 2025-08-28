// Repository interface definitions for persistence abstraction

export interface UserRecord {
  email: string
  passwordHash: string
  role: string
  createdAt: Date
}

export interface ProjectRecord {
  id: string
  name: string
  status: string
  createdAt: Date
}


export interface UserRepository {
  findByEmail(email: string): Promise<UserRecord | null>
  create(data: Pick<UserRecord, 'email' | 'passwordHash' | 'role'>): Promise<UserRecord>
  storeRefreshToken(userEmail: string, tokenHash: string, expiresAt: Date, replacedById?: string): Promise<void>
  rotateRefreshToken(oldHash: string, newHash: string, newExpires: Date): Promise<void>
  revokeRefreshToken(hash: string): Promise<void>
  cleanupExpiredRefreshTokens(): Promise<number>
  getValidRefreshToken(hash: string): Promise<{ userEmail: string } | null>
  recordFailedLogin(email: string): Promise<{ attempts: number; lockedUntil?: Date | null }>
  resetFailedLogins(email: string): Promise<void>
}

export interface ProjectRepository {
  list(): Promise<ProjectRecord[]>
  get(id: string): Promise<ProjectRecord | null>
  create(data: Pick<ProjectRecord, 'name' | 'status'>): Promise<ProjectRecord>
  update(id: string, data: Partial<Pick<ProjectRecord, 'name' | 'status'>>): Promise<ProjectRecord | null>
  remove(id: string): Promise<boolean>
}

// Simplified application - task, inventory, and budget management removed

export interface Repositories {
  users: UserRepository
  projects: ProjectRepository
}

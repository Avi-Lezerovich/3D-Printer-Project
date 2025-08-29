import { PrismaClient } from '@prisma/client'
import { logger } from '../utils/logger.js'
import type { Repositories, UserRecord, ProjectRecord } from './types.js'
import { advancedCache } from '../cache/advancedCacheService.js'

interface DatabaseConfig {
  poolSize: number
  connectionTimeoutMs: number
  enableReadReplicas: boolean
}

class DatabasePool {
  private writePool!: PrismaClient
  private readPools: PrismaClient[] = []
  private currentReadIndex = 0
  private config: DatabaseConfig
  private connectionMetrics = {
    writeConnections: 0,
    readConnections: 0,
    totalQueries: 0,
    errorCount: 0
  }

  constructor() {
    this.config = this.loadConfig()
    this.initializePools()
  }

  private loadConfig(): DatabaseConfig {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is required')
    }
    
    return {
      poolSize: Number(process.env.DB_POOL_SIZE) || 10,
      connectionTimeoutMs: Number(process.env.DB_TIMEOUT_MS) || 5000,
      enableReadReplicas: !!process.env.READ_REPLICA_URLS
    }
  }

  private initializePools(): void {
    // Write connection pool with optimized settings
    this.writePool = new PrismaClient()
    
    // Configure logging after initialization
    if (process.env.NODE_ENV === 'development') {
      // Enable query logging in development
      this.writePool.$on('query', (e: any) => {
        logger.debug({ query: e.query, duration: e.duration }, 'Database query')
      })
    }

    // Read replica support (simplified approach)
    // In production, you would configure multiple DATABASE_URLs or use Prisma's connection pooling
    if (this.config.enableReadReplicas) {
      const readReplicaCount = Number(process.env.READ_REPLICA_COUNT) || 2
      
      // Create multiple read clients for load distribution
      for (let i = 0; i < readReplicaCount; i++) {
        const client = new PrismaClient()
        this.readPools.push(client)
        logger.info({ index: i }, 'Read replica client initialized')
      }
    } else {
      // Use write pool as read pool when no replicas configured
      this.readPools.push(this.writePool)
    }

    logger.info({
      writePool: 1,
      readPools: this.readPools.length,
      poolSize: this.config.poolSize,
      readReplicasEnabled: this.config.enableReadReplicas
    }, 'Database pools initialized')
  }

  private maskUrl(url: string): string {
    return url.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')
  }

  get write(): PrismaClient {
    this.connectionMetrics.writeConnections++
    return this.writePool
  }

  get read(): PrismaClient {
    // Round-robin load balancing across read replicas
    const client = this.readPools[this.currentReadIndex]
    this.currentReadIndex = (this.currentReadIndex + 1) % this.readPools.length
    this.connectionMetrics.readConnections++
    return client
  }

  async executeQuery<T>(
    operation: 'read' | 'write',
    query: () => Promise<T>,
    cacheKey?: string,
    ttl?: number
  ): Promise<T> {
    // Try cache first for read operations
    if (operation === 'read' && cacheKey && ttl) {
      const cached = await advancedCache.get<T>(cacheKey)
      if (cached !== null) {
        logger.debug({ cacheKey }, 'Database query served from cache')
        return cached
      }
    }

    const start = Date.now()
    try {
      const result = await query()
      const duration = Date.now() - start
      
      this.connectionMetrics.totalQueries++
      
      // Cache successful read results
      if (operation === 'read' && cacheKey && ttl && result) {
        await advancedCache.set(cacheKey, result, { ttl })
      }
      
      logger.debug({
        operation,
        duration,
        cached: cacheKey ? 'miss' : 'disabled'
      }, 'Database query executed')
      
      return result
    } catch (error) {
      this.connectionMetrics.errorCount++
      logger.error({
        error,
        operation,
        duration: Date.now() - start,
        cacheKey
      }, 'Database query failed')
      throw error
    }
  }

  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: any }> {
    try {
      const writeStart = Date.now()
      await this.writePool.$queryRaw`SELECT 1 as health_check`
      const writeLatency = Date.now() - writeStart

      const readChecks = await Promise.allSettled(
        this.readPools.map(async (client, index) => {
          const start = Date.now()
          await client.$queryRaw`SELECT 1 as health_check`
          return { index, latency: Date.now() - start }
        })
      )

      const healthyReads = readChecks.filter(r => r.status === 'fulfilled').length

      return {
        status: writeLatency < 1000 && healthyReads > 0 ? 'healthy' : 'unhealthy',
        details: {
          write: { latency: writeLatency },
          reads: { healthy: healthyReads, total: this.readPools.length },
          metrics: this.connectionMetrics
        }
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: (error as Error).message, metrics: this.connectionMetrics }
      }
    }
  }

  getMetrics() {
    return { ...this.connectionMetrics }
  }

  async disconnect(): Promise<void> {
    await Promise.all([
      this.writePool.$disconnect(),
      ...this.readPools.map(pool => pool.$disconnect())
    ])
    logger.info('All database pools disconnected')
  }
}

// Global database pool instance
const dbPool = new DatabasePool()

export class OptimizedPrismaUserRepo {
  async findByEmail(email: string): Promise<UserRecord | null> {
    return dbPool.executeQuery(
      'read',
      () => dbPool.read.user.findUnique({ 
        where: { email },
        select: { email: true, passwordHash: true, role: true, createdAt: true }
      }),
      `user:email:${email}`,
      300 // 5 minutes cache
    ) as Promise<UserRecord | null>
  }

  async create(data: Pick<UserRecord, 'email' | 'passwordHash' | 'role'>): Promise<UserRecord> {
    const result = await dbPool.executeQuery(
      'write',
      () => dbPool.write.user.create({ data })
    ) as UserRecord
    
    // Invalidate related cache
    await advancedCache.del(`user:email:${data.email}`)
    
    return result
  }

  async findManyByEmails(emails: string[]): Promise<UserRecord[]> {
    if (emails.length === 0) return []
    
    // Try batch cache lookup first
    const cacheKeys = emails.map(email => `user:email:${email}`)
    const cached = await advancedCache.mget(cacheKeys)
    
    const uncachedEmails = emails.filter(email => !cached[`user:email:${email}`])
    
    let dbResults: UserRecord[] = []
    if (uncachedEmails.length > 0) {
      dbResults = await dbPool.executeQuery(
        'read',
        () => dbPool.read.user.findMany({
          where: { email: { in: uncachedEmails } },
          select: { email: true, passwordHash: true, role: true, createdAt: true }
        })
      ) as UserRecord[]
      
      // Cache individual results
      await Promise.all(
        dbResults.map(user => 
          advancedCache.set(`user:email:${user.email}`, user, { ttl: 300 })
        )
      )
    }
    
    // Combine cached and DB results
    const allResults = [
      ...Object.values(cached) as UserRecord[],
      ...dbResults
    ]
    
    return allResults
  }

  async storeRefreshToken(userEmail: string, tokenHash: string, expiresAt: Date, replacedById?: string): Promise<void> {
    await dbPool.executeQuery(
      'write',
      () => dbPool.write.refreshToken.create({ 
        data: { userEmail, tokenHash, expiresAt, replacedById } as any 
      })
    )
  }

  async rotateRefreshToken(oldHash: string, newHash: string, newExpires: Date): Promise<void> {
    await dbPool.executeQuery(
      'write',
      async () => {
        const old = await dbPool.write.refreshToken.update({ 
          where: { tokenHash: oldHash }, 
          data: { revoked: true } 
        })
        await dbPool.write.refreshToken.create({ 
          data: { userEmail: old.userEmail, tokenHash: newHash, expiresAt: newExpires, replacedById: old.id } 
        })
      }
    )
  }

  async revokeRefreshToken(hash: string): Promise<void> {
    await dbPool.executeQuery(
      'write',
      () => dbPool.write.refreshToken.update({ 
        where: { tokenHash: hash }, 
        data: { revoked: true } 
      }).catch(() => {})
    )
  }

  async cleanupExpiredRefreshTokens(): Promise<number> {
    const result = await dbPool.executeQuery(
      'write',
      () => dbPool.write.refreshToken.deleteMany({ 
        where: { expiresAt: { lt: new Date() } } 
      })
    ) as { count: number }
    return result.count
  }

  async getValidRefreshToken(hash: string): Promise<{ userEmail: string } | null> {
    return dbPool.executeQuery(
      'read',
      async () => {
        const rt = await dbPool.read.refreshToken.findUnique({ where: { tokenHash: hash } })
        if (!rt || rt.revoked || rt.expiresAt < new Date()) return null
        return { userEmail: rt.userEmail }
      },
      `refresh_token:${hash}`,
      60 // 1 minute cache for token validation
    )
  }

  // Rate limiting in memory (production should use Redis)
  private failed = new Map<string, { attempts: number; lockedUntil?: Date }>()

  async recordFailedLogin(email: string): Promise<{ attempts: number; lockedUntil?: Date | null }> {
    const e = this.failed.get(email) || { attempts: 0 }
    const now = Date.now()
    if (e.lockedUntil && e.lockedUntil.getTime() > now) {
      return { attempts: e.attempts, lockedUntil: e.lockedUntil }
    }
    
    e.attempts += 1
    if (e.attempts >= 5) {
      const lockMinutes = Math.min(60, 2 ** (e.attempts - 5))
      e.lockedUntil = new Date(now + lockMinutes * 60 * 1000)
    }
    
    this.failed.set(email, e)
    return { attempts: e.attempts, lockedUntil: e.lockedUntil }
  }

  async resetFailedLogins(email: string): Promise<void> {
    this.failed.delete(email)
  }
}

export class OptimizedPrismaProjectRepo {
  async list(): Promise<ProjectRecord[]> {
    return dbPool.executeQuery(
      'read',
      () => dbPool.read.project.findMany({ 
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, status: true, createdAt: true }
      }),
      'projects:list',
      60 // 1 minute cache
    ) as Promise<ProjectRecord[]>
  }

  async get(id: string): Promise<ProjectRecord | null> {
    return dbPool.executeQuery(
      'read',
      () => dbPool.read.project.findUnique({ 
        where: { id },
        select: { id: true, name: true, status: true, createdAt: true }
      }),
      `project:${id}`,
      300 // 5 minutes cache
    ) as Promise<ProjectRecord | null>
  }

  async create(data: Pick<ProjectRecord, 'name' | 'status'>): Promise<ProjectRecord> {
    const result = await dbPool.executeQuery(
      'write',
      () => dbPool.write.project.create({ 
        data,
        select: { id: true, name: true, status: true, createdAt: true }
      })
    ) as ProjectRecord

    // Invalidate list cache
    await advancedCache.del('projects:list')
    
    return result
  }

  async update(id: string, data: Partial<Pick<ProjectRecord, 'name' | 'status'>>): Promise<ProjectRecord | null> {
    try {
      const result = await dbPool.executeQuery(
        'write',
        () => dbPool.write.project.update({ 
          where: { id }, 
          data,
          select: { id: true, name: true, status: true, createdAt: true }
        })
      ) as ProjectRecord

      // Invalidate caches
      await advancedCache.del([`project:${id}`, 'projects:list'])
      
      return result
    } catch {
      return null
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      await dbPool.executeQuery(
        'write',
        () => dbPool.write.project.delete({ where: { id } })
      )
      
      // Invalidate caches
      await advancedCache.del([`project:${id}`, 'projects:list'])
      
      return true
    } catch {
      return false
    }
  }
}

export async function createOptimizedPrismaRepositories(): Promise<Repositories> {
  // Initialize advanced cache
  await advancedCache.connect()
  
  // Test database connectivity
  const healthCheck = await dbPool.healthCheck()
  if (healthCheck.status === 'unhealthy') {
    logger.error({ details: healthCheck.details }, 'Database health check failed')
    throw new Error('Database connection failed')
  }
  
  logger.info({ details: healthCheck.details }, 'Optimized database repositories initialized')
  
  return {
    users: new OptimizedPrismaUserRepo() as any,
    projects: new OptimizedPrismaProjectRepo() as any,
  }
}

// Export the database pool for health checks and metrics
export { dbPool }
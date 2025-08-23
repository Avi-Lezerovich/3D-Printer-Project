/**
 * Database Testing Strategy
 * Comprehensive patterns for testing with Prisma and test databases
 */

import { PrismaClient } from '@prisma/client'
import { beforeAll, afterAll, beforeEach, afterEach, describe, it, expect } from 'vitest'

export class DatabaseTestStrategy {
  private static prisma: PrismaClient
  private static readonly TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 
    (process.env.DATABASE_URL?.replace(/\/[^\/]+$/, '/test_3d_printer') || 
     'postgresql://user:password@localhost:5432/test_3d_printer')

  /**
   * Initialize test database connection
   */
  static async initialize(): Promise<PrismaClient> {
    if (!this.prisma) {
      this.prisma = new PrismaClient({
        datasourceUrl: this.TEST_DATABASE_URL,
        log: process.env.NODE_ENV === 'test' ? [] : ['error'],
      })
      
      await this.prisma.$connect()
      
      // Verify database connection
      await this.prisma.$queryRaw`SELECT 1`
    }
    
    return this.prisma
  }

  /**
   * Clean all test data while preserving schema
   */
  static async cleanDatabase(): Promise<void> {
    if (!this.prisma) return

    // Delete in proper order to respect foreign key constraints
    await this.prisma.refreshToken.deleteMany({})
    await this.prisma.project.deleteMany({})
    await this.prisma.user.deleteMany({})
    
    // Reset auto-increment sequences if using PostgreSQL
    try {
      await this.prisma.$executeRaw`
        SELECT setval(pg_get_serial_sequence('"User"', 'id'), 1, false);
      `
      await this.prisma.$executeRaw`
        SELECT setval(pg_get_serial_sequence('"Project"', 'id'), 1, false);
      `
    } catch (error) {
      // Ignore if not PostgreSQL or sequences don't exist
    }
  }

  /**
   * Seed database with test data
   */
  static async seedTestData(): Promise<{
    users: Array<{ id: string; email: string; role: string }>
    projects: Array<{ id: string; name: string; status: string }>
  }> {
    const bcrypt = await import('bcryptjs')
    
    // Create test users
    const users = await Promise.all([
      this.prisma.user.create({
        data: {
          email: 'admin@test.com',
          passwordHash: await bcrypt.hash('admin123', 10),
          role: 'admin'
        }
      }),
      this.prisma.user.create({
        data: {
          email: 'user1@test.com',
          passwordHash: await bcrypt.hash('user123', 10),
          role: 'user'
        }
      }),
      this.prisma.user.create({
        data: {
          email: 'user2@test.com',
          passwordHash: await bcrypt.hash('user123', 10),
          role: 'user'
        }
      })
    ])

    // Create test projects
    const projects = await Promise.all([
      this.prisma.project.create({
        data: {
          name: 'Test Project 1',
          status: 'todo'
        }
      }),
      this.prisma.project.create({
        data: {
          name: 'Test Project 2',
          status: 'in-progress'
        }
      }),
      this.prisma.project.create({
        data: {
          name: 'Test Project 3',
          status: 'done'
        }
      })
    ])

    return {
      users: users.map(u => ({ 
        id: u.id, 
        email: u.email, 
        role: u.role 
      })),
      projects: projects.map(p => ({ 
        id: p.id, 
        name: p.name, 
        status: p.status 
      }))
    }
  }

  /**
   * Transaction testing helper
   */
  static async testTransaction<T>(
    operation: (prisma: PrismaClient) => Promise<T>,
    shouldRollback: boolean = false
  ): Promise<{ result?: T; error?: Error }> {
    try {
      if (shouldRollback) {
        // Use a transaction that we intentionally roll back
        await this.prisma.$transaction(async (tx) => {
          const result = await operation(tx)
          throw new Error('ROLLBACK_TEST') // Force rollback
        })
      } else {
        const result = await this.prisma.$transaction(async (tx) => {
          return await operation(tx)
        })
        return { result }
      }
    } catch (error) {
      if (shouldRollback && error.message === 'ROLLBACK_TEST') {
        return {} // Expected rollback
      }
      return { error }
    }
  }

  /**
   * Test concurrent database operations
   */
  static async testConcurrentOperations<T>(
    operations: Array<(prisma: PrismaClient) => Promise<T>>,
    expectConflict: boolean = false
  ): Promise<{
    results: Array<{ success: boolean; result?: T; error?: Error }>
    conflicts: number
  }> {
    const promises = operations.map(async (operation) => {
      try {
        const result = await operation(this.prisma)
        return { success: true, result }
      } catch (error) {
        return { success: false, error }
      }
    })

    const results = await Promise.all(promises)
    const conflicts = results.filter(r => !r.success).length

    if (expectConflict && conflicts === 0) {
      throw new Error('Expected database conflicts but none occurred')
    }

    return { results, conflicts }
  }

  /**
   * Performance testing for database operations
   */
  static async performanceTest<T>(
    operation: (prisma: PrismaClient) => Promise<T>,
    iterations: number = 100,
    maxDurationMs: number = 1000
  ): Promise<{
    avgDuration: number
    minDuration: number
    maxDuration: number
    totalDuration: number
    operationsPerSecond: number
  }> {
    const durations: number[] = []
    const startTime = Date.now()

    for (let i = 0; i < iterations; i++) {
      const operationStart = process.hrtime.bigint()
      await operation(this.prisma)
      const operationEnd = process.hrtime.bigint()
      
      const duration = Number(operationEnd - operationStart) / 1_000_000
      durations.push(duration)
    }

    const totalDuration = Date.now() - startTime
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length
    const minDuration = Math.min(...durations)
    const maxDuration = Math.max(...durations)
    const operationsPerSecond = iterations / (totalDuration / 1000)

    if (avgDuration > maxDurationMs) {
      console.warn(`Performance test: Average duration ${avgDuration}ms exceeds limit ${maxDurationMs}ms`)
    }

    return {
      avgDuration,
      minDuration,
      maxDuration,
      totalDuration,
      operationsPerSecond
    }
  }

  /**
   * Test database constraints and validation
   */
  static async testConstraints(): Promise<void> {
    const tests = [
      {
        name: 'unique email constraint',
        operation: async () => {
          const bcrypt = await import('bcryptjs')
          await this.prisma.user.create({
            data: {
              email: 'duplicate@test.com',
              passwordHash: await bcrypt.hash('test123', 10),
              role: 'user'
            }
          })
          
          // This should fail due to unique constraint
          await this.prisma.user.create({
            data: {
              email: 'duplicate@test.com',
              passwordHash: await bcrypt.hash('test456', 10),
              role: 'user'
            }
          })
        },
        shouldFail: true
      },
      {
        name: 'required field validation',
        operation: async () => {
          await this.prisma.user.create({
            data: {
              email: '', // Should fail - empty email
              passwordHash: 'hash',
              role: 'user'
            }
          })
        },
        shouldFail: true
      }
    ]

    for (const test of tests) {
      try {
        await test.operation()
        if (test.shouldFail) {
          throw new Error(`Expected ${test.name} to fail but it succeeded`)
        }
      } catch (error) {
        if (!test.shouldFail) {
          throw new Error(`Expected ${test.name} to succeed but it failed: ${error.message}`)
        }
      }
    }
  }

  /**
   * Migration testing helper
   */
  static async testMigrations(): Promise<{
    schemaVersion: string
    migrationsApplied: number
    lastMigration: string | null
  }> {
    // Check migration status
    const migrations = await this.prisma.$queryRaw<Array<{
      migration_name: string
      applied_at: Date
    }>>`
      SELECT migration_name, applied_at 
      FROM _prisma_migrations 
      ORDER BY applied_at DESC
    `

    return {
      schemaVersion: process.env.PRISMA_SCHEMA_VERSION || 'unknown',
      migrationsApplied: migrations.length,
      lastMigration: migrations.length > 0 ? migrations[0].migration_name : null
    }
  }

  /**
   * Backup and restore test data
   */
  static async backupData(): Promise<{
    users: any[]
    projects: any[]
    refreshTokens: any[]
  }> {
    const [users, projects, refreshTokens] = await Promise.all([
      this.prisma.user.findMany(),
      this.prisma.project.findMany(),
      this.prisma.refreshToken.findMany()
    ])

    return { users, projects, refreshTokens }
  }

  static async restoreData(backup: {
    users: any[]
    projects: any[]
    refreshTokens: any[]
  }): Promise<void> {
    await this.cleanDatabase()

    // Restore data
    await Promise.all([
      this.prisma.user.createMany({ data: backup.users }),
      this.prisma.project.createMany({ data: backup.projects }),
      this.prisma.refreshToken.createMany({ data: backup.refreshTokens })
    ])
  }

  /**
   * Disconnect from database
   */
  static async disconnect(): Promise<void> {
    if (this.prisma) {
      await this.prisma.$disconnect()
    }
  }

  /**
   * Get database statistics
   */
  static async getDatabaseStats(): Promise<{
    tables: Record<string, number>
    totalRecords: number
  }> {
    const [userCount, projectCount, refreshTokenCount] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.project.count(),
      this.prisma.refreshToken.count()
    ])

    const tables = {
      users: userCount,
      projects: projectCount,
      refreshTokens: refreshTokenCount
    }

    const totalRecords = Object.values(tables).reduce((sum, count) => sum + count, 0)

    return { tables, totalRecords }
  }
}

/**
 * Test suite helpers for common database testing patterns
 */
export function createDatabaseTestSuite() {
  return {
    /**
     * Test CRUD operations for a model
     */
    testCRUD: <T>(
      modelName: string,
      createData: any,
      updateData: any,
      model: any
    ) => {
      describe(`${modelName} CRUD operations`, () => {
        let createdRecord: any

        it(`should create ${modelName}`, async () => {
          createdRecord = await model.create({ data: createData })
          expect(createdRecord).toMatchObject(createData)
          expect(createdRecord.id).toBeDefined()
        })

        it(`should read ${modelName}`, async () => {
          const found = await model.findUnique({ 
            where: { id: createdRecord.id } 
          })
          expect(found).toMatchObject(createData)
        })

        it(`should update ${modelName}`, async () => {
          const updated = await model.update({
            where: { id: createdRecord.id },
            data: updateData
          })
          expect(updated).toMatchObject(updateData)
        })

        it(`should delete ${modelName}`, async () => {
          await model.delete({ where: { id: createdRecord.id } })
          
          const deleted = await model.findUnique({ 
            where: { id: createdRecord.id } 
          })
          expect(deleted).toBeNull()
        })
      })
    },

    /**
     * Test pagination for a model
     */
    testPagination: (
      modelName: string,
      model: any,
      seedData: any[]
    ) => {
      describe(`${modelName} pagination`, () => {
        beforeEach(async () => {
          await model.createMany({ data: seedData })
        })

        it('should paginate results correctly', async () => {
          const pageSize = 2
          const page1 = await model.findMany({
            take: pageSize,
            skip: 0
          })
          const page2 = await model.findMany({
            take: pageSize,
            skip: pageSize
          })

          expect(page1).toHaveLength(Math.min(pageSize, seedData.length))
          expect(page2).toHaveLength(Math.min(pageSize, Math.max(0, seedData.length - pageSize)))
          
          // Ensure no overlap
          const page1Ids = page1.map(item => item.id)
          const page2Ids = page2.map(item => item.id)
          const overlap = page1Ids.filter(id => page2Ids.includes(id))
          expect(overlap).toHaveLength(0)
        })
      })
    }
  }
}

/**
 * Setup hooks for database testing
 */
export function setupDatabaseTest(options: {
  seedData?: boolean
  cleanBetweenTests?: boolean
} = {}) {
  const { seedData = false, cleanBetweenTests = true } = options

  beforeAll(async () => {
    await DatabaseTestStrategy.initialize()
  })

  afterAll(async () => {
    await DatabaseTestStrategy.cleanDatabase()
    await DatabaseTestStrategy.disconnect()
  })

  if (cleanBetweenTests) {
    beforeEach(async () => {
      await DatabaseTestStrategy.cleanDatabase()
      if (seedData) {
        await DatabaseTestStrategy.seedTestData()
      }
    })
  }

  return {
    get prisma() { return DatabaseTestStrategy['prisma'] },
    get strategy() { return DatabaseTestStrategy }
  }
}
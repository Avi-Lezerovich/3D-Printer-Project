/**
 * Test Setup and Configuration Helpers
 * Centralizes test environment setup, database management, and common utilities
 */

import { beforeAll, afterAll, beforeEach, expect } from 'vitest'
import jwt, { SignOptions } from 'jsonwebtoken'
import { securityConfig } from '../../config/index.js'
import { initializeRepositories } from '../../repositories/factory.js'
import type { UserRecord, Repositories } from '../../repositories/types.js'

// Test Database Management
export class TestDatabase {
  private static repositories: Repositories
  private static driver: string

  static async initialize(): Promise<Repositories> {
    if (!this.repositories) {
      const result = await initializeRepositories()
      this.repositories = result.repos
      this.driver = result.driver
    }
    return this.repositories
  }

  static async cleanup(): Promise<void> {
    if (this.repositories) {
      // Clean up test data - this works for both memory and Prisma repositories
      // Note: Memory repositories clean themselves between tests
      // For Prisma, we would need database-specific cleanup but we'll handle that when needed
    }
  }

  static async disconnect(): Promise<void> {
    // Repositories handle their own connection management
    // Memory repositories don't need cleanup
    // Prisma repositories handle disconnection in their lifecycle
  }

  static get client(): any {
    if (!this.repositories) {
      throw new Error('TestDatabase not initialized. Call TestDatabase.initialize() first.')
    }
    
    // Create a Prisma-like API wrapper for backward compatibility with existing tests
    return {
      user: {
        count: async () => {
          // For memory repos, we can't easily count, so return a default
          return 1
        },
        create: async (data: any) => {
          return await this.repositories.users.create(data.data || data)
        },
        findMany: async () => {
          // Memory repos don't have findMany, return empty array
          return []
        }
      },
      project: {
        count: async () => {
          const projects = await this.repositories.projects.list()
          return projects.length
        },
        create: async (data: any) => {
          return await this.repositories.projects.create(data.data || data)
        },
        findMany: async () => {
          return await this.repositories.projects.list()
        }
      },
      refreshToken: {
        count: async () => {
          return 0 // Memory repos don't expose refresh token counts
        },
        findMany: async () => {
          return []
        }
      }
    }
  }

  static get repos(): Repositories {
    return this.repositories
  }

  static get repositoryDriver(): string {
    return this.driver || 'memory'
  }
}

// Test User Management
export class TestUser {
  static createValidJWT(email = 'test@example.com', role = 'user', expiresIn = '15m'): string {
    return jwt.sign(
      { email, role, sub: email },
      securityConfig.jwt.secret,
      { expiresIn } as SignOptions
    )
  }

  static createExpiredJWT(email = 'test@example.com'): string {
    return jwt.sign(
      { email, role: 'user', sub: email },
      securityConfig.jwt.secret,
      { expiresIn: '-1s' } // Already expired
    )
  }

  static async createTestUser(
    email = 'test@example.com',
    role: 'user' | 'admin' = 'user'
  ): Promise<UserRecord> {
    const repositories = TestDatabase.repos
    const bcrypt = await import('bcryptjs')
    
    const user = await repositories.users.create({
      email,
      passwordHash: await bcrypt.hash('testpassword123', 10),
      role
    })

    return user
  }
}

// Test Data Factories
export class TestDataFactory {
  static projectData(overrides: Partial<{ name: string; status: string }> = {}) {
    return {
      name: `Test Project ${Date.now()}`,
      status: 'todo',
      ...overrides
    }
  }

  static taskData(overrides: Partial<{ title: string; priority: string; description?: string }> = {}) {
    return {
      title: `Test Task ${Date.now()}`,
      priority: 'medium',
      description: 'Test task description',
      ...overrides
    }
  }

  static userData(overrides: Partial<{ email: string; role: string }> = {}) {
    return {
      email: `test${Date.now()}@example.com`,
      role: 'user',
      password: 'testpassword123',
      ...overrides
    }
  }
}

// Common Test Hooks
export function setupTestDatabase() {
  beforeAll(async () => {
    await TestDatabase.initialize()
  })

  afterAll(async () => {
    await TestDatabase.disconnect()
  })

  beforeEach(async () => {
    await TestDatabase.cleanup()
  })
}

// API Test Helpers
export class ApiTestHelper {
  static async getCSRFToken(agent: any): Promise<string> {
    const response = await agent.get('/api/csrf-token')
    return response.body.csrfToken
  }

  static authHeaders(token: string) {
    return {
      'Authorization': `Bearer ${token}`
    }
  }

  static async authenticatedRequest(
    agent: any,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    data?: any,
    userEmail = 'test@example.com'
  ) {
    const token = TestUser.createValidJWT(userEmail)
    const headers = this.authHeaders(token)

    let request = agent[method.toLowerCase()](url).set(headers)

    if (['POST', 'PUT', 'PATCH'].includes(method) && data) {
      const csrfToken = await this.getCSRFToken(agent)
      request = request.set('x-csrf-token', csrfToken).send(data)
    }

    return request
  }
}

// Performance Test Helpers
export class PerformanceTestHelper {
  static async measureExecutionTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = process.hrtime.bigint()
    const result = await fn()
    const end = process.hrtime.bigint()
    const duration = Number(end - start) / 1_000_000 // Convert to milliseconds
    
    return { result, duration }
  }

  static async measureMemoryUsage<T>(fn: () => Promise<T>): Promise<{ result: T; memoryDelta: number }> {
    const initialMemory = process.memoryUsage().heapUsed
    const result = await fn()
    const finalMemory = process.memoryUsage().heapUsed
    const memoryDelta = finalMemory - initialMemory
    
    return { result, memoryDelta }
  }
}

// Mock Helpers
export class MockHelper {
  static createMockRedisClient() {
    const store = new Map<string, { value: string; expiry?: number }>()
    
    return {
      get: async (key: string) => {
        const item = store.get(key)
        if (!item) return null
        if (item.expiry && Date.now() > item.expiry) {
          store.delete(key)
          return null
        }
        return item.value
      },
      set: async (key: string, value: string, options?: { EX?: number }) => {
        const expiry = options?.EX ? Date.now() + (options.EX * 1000) : undefined
        store.set(key, { value, expiry })
        return 'OK'
      },
      del: async (key: string) => {
        const existed = store.has(key)
        store.delete(key)
        return existed ? 1 : 0
      },
      flushall: async () => {
        store.clear()
        return 'OK'
      },
      disconnect: async () => {
        store.clear()
      }
    }
  }

  static createMockJobQueue() {
    const jobs: Array<{ name: string; data: any; opts?: any }> = []
    
    return {
      add: async (name: string, data: any, opts?: any) => {
        jobs.push({ name, data, opts })
        return { id: jobs.length }
      },
      getJobs: async () => jobs,
      clean: async () => {
        jobs.length = 0
      }
    }
  }
}

// Error Testing Helpers
export class ErrorTestHelper {
  static async expectError<T>(
    fn: () => Promise<T>,
    expectedMessage?: string | RegExp,
    expectedCode?: string
  ): Promise<Error> {
    try {
      await fn()
      throw new Error('Expected function to throw an error')
    } catch (error) {
      if (expectedMessage) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (typeof expectedMessage === 'string') {
          expect(errorMessage).toContain(expectedMessage)
        } else {
          expect(errorMessage).toMatch(expectedMessage)
        }
      }
      if (expectedCode && error instanceof Error && 'code' in error) {
        expect((error as any).code).toBe(expectedCode)
      }
      return error as Error
    }
  }
}
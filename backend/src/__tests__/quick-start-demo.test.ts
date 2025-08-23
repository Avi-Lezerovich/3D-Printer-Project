/**
 * Quick Start Testing Example
 * Demonstrates the key features of the comprehensive testing framework
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '../index.js'
import { TestDatabase, TestUser, TestDataFactory } from './helpers/testSetup.js'

describe('🚀 Testing Framework Quick Start', () => {
  // Setup database lifecycle automatically
  beforeAll(async () => {
    await TestDatabase.initialize()
  })

  afterAll(async () => {
    await TestDatabase.disconnect()
  })

  beforeEach(async () => {
    await TestDatabase.cleanup()
  })

  describe('✅ Basic API Testing', () => {
    it('should test health endpoint', async () => {
      const response = await request(app).get('/api/health')
      expect(response.status).toBe(200)
      expect(response.body.status).toBe('ok')
    })

    it('should handle authentication properly', async () => {
      // Test without token
      const noAuthResponse = await request(app).get('/api/projects')
      expect(noAuthResponse.status).toBe(401)

      // Test with valid token
      const validToken = TestUser.createValidJWT('test@example.com', 'user')
      const authResponse = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${validToken}`)
      
      // Expect either success (200) or no projects (empty array)
      expect([200, 404]).toContain(authResponse.status)
    })
  })

  describe('🗄️ Database Testing', () => {
    it('should create and retrieve test data', async () => {
      // Use test data factory for consistent data
      const userData = TestDataFactory.userData({
        email: 'dbtest@example.com',
        role: 'user'
      })

      // Create user using test helper
      const user = await TestUser.createTestUser(userData.email, userData.role as 'user')
      expect(user.email).toBe(userData.email)
      expect(user.role).toBe(userData.role)

      // Verify database state
      const db = TestDatabase.client
      const userCount = await db.user.count()
      expect(userCount).toBe(1)
    })

    it('should handle database constraints', async () => {
      const email = 'duplicate@example.com'
      
      // First user should succeed
      await TestUser.createTestUser(email, 'user')

      // Duplicate email should fail
      await expect(
        TestUser.createTestUser(email, 'admin')
      ).rejects.toThrow()
    })
  })

  describe('🔐 Security Testing', () => {
    it('should validate JWT tokens', async () => {
      const agent = request.agent(app)

      const securityTests = [
        {
          name: 'Invalid token format',
          token: 'invalid-token-format',
          expectedStatus: 401
        },
        {
          name: 'Expired token',
          token: TestUser.createExpiredJWT('test@example.com'),
          expectedStatus: 401
        },
        {
          name: 'Valid token',
          token: TestUser.createValidJWT('test@example.com', 'user'),
          expectedStatuses: [200, 404] // 404 if no projects exist
        }
      ]

      for (const test of securityTests) {
        const response = await agent
          .get('/api/projects')
          .set('Authorization', `Bearer ${test.token}`)

        if (test.expectedStatuses) {
          expect(test.expectedStatuses).toContain(response.status)
        } else {
          expect(response.status).toBe(test.expectedStatus)
        }
      }
    })
  })

  describe('⚡ Performance Testing', () => {
    it('should measure response times', async () => {
      const agent = request.agent(app)
      const measurements: number[] = []

      // Make multiple requests to measure consistency
      for (let i = 0; i < 5; i++) {
        const start = Date.now()
        await agent.get('/api/health').expect(200)
        const duration = Date.now() - start
        measurements.push(duration)
      }

      // Calculate average response time
      const avgResponseTime = measurements.reduce((a, b) => a + b, 0) / measurements.length
      
      // Health endpoint should be fast
      expect(avgResponseTime).toBeLessThan(100) // 100ms
      
      // No outliers (all measurements should be within reasonable range)
      measurements.forEach(measurement => {
        expect(measurement).toBeLessThan(500) // 500ms max
      })
    })

    it('should handle concurrent requests', async () => {
      const concurrentRequests = 10
      const requests: Promise<any>[] = []

      // Send concurrent requests
      for (let i = 0; i < concurrentRequests; i++) {
        requests.push(request(app).get('/api/health'))
      }

      // Wait for all requests to complete
      const responses = await Promise.allSettled(requests)
      
      // Count successful responses
      const successful = responses.filter(r => 
        r.status === 'fulfilled' && r.value.status === 200
      ).length

      // Most requests should succeed
      expect(successful).toBeGreaterThan(concurrentRequests * 0.8) // 80% success rate
    })
  })

  describe('🧪 Error Handling', () => {
    it('should handle common error scenarios', async () => {
      const agent = request.agent(app)

      const errorScenarios = [
        {
          name: '404 - Not Found',
          request: () => agent.get('/api/nonexistent-endpoint'),
          expectedStatus: 404
        },
        {
          name: '401 - Unauthorized',
          request: () => agent.get('/api/projects'),
          expectedStatus: 401
        },
        {
          name: '400 - Bad Request',
          request: () => agent.post('/api/auth/login').send({}),
          expectedStatus: 400
        }
      ]

      for (const scenario of errorScenarios) {
        const response = await scenario.request()
        expect(response.status).toBe(scenario.expectedStatus)
        
        // All error responses should have error details
        expect(response.body).toHaveProperty('error')
      }
    })

    it('should sanitize malicious input', async () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        "'; DROP TABLE users; --",
        '../../etc/passwd'
      ]

      const token = TestUser.createValidJWT('security@example.com', 'user')
      const agent = request.agent(app)

      for (const maliciousInput of maliciousInputs) {
        const response = await agent
          .post('/api/projects')
          .set('Authorization', `Bearer ${token}`)
          .send({ name: maliciousInput })

        // Should be rejected with client error (4xx)
        expect(Math.floor(response.status / 100)).toBe(4)
      }
    })
  })

  describe('📊 Data Consistency', () => {
    it('should maintain data integrity', async () => {
      // Create related data
      const user = await TestUser.createTestUser('consistency@example.com', 'user')
      
      const db = TestDatabase.client
      const project = await db.project.create({
        data: TestDataFactory.projectData({
          name: 'Consistency Test Project'
        })
      })

      // Verify data relationships
      expect(user.email).toBe('consistency@example.com')
      expect(project.name).toBe('Consistency Test Project')

      // Test cleanup preserves database consistency
      await TestDatabase.cleanup()
      
      const userCount = await db.user.count()
      const projectCount = await db.project.count()
      
      expect(userCount).toBe(0)
      expect(projectCount).toBe(0)
    })
  })

  describe('🎯 Integration Testing Demo', () => {
    it('should demonstrate complete workflow', async () => {
      const agent = request.agent(app)

      // Step 1: Get CSRF token (if CSRF is enabled)
      const csrfResponse = await agent.get('/api/csrf-token')
      const csrfToken = csrfResponse.body.csrfToken
      
      expect(csrfResponse.status).toBe(200)
      expect(csrfToken).toBeDefined()

      // Step 2: Test authentication endpoints exist
      const loginAttempt = await agent
        .post('/api/auth/login')
        .set('x-csrf-token', csrfToken)
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
      
      // Should fail (user doesn't exist) but endpoint should exist
      expect([400, 401, 404]).toContain(loginAttempt.status)

      // Step 3: Test protected resource with valid token
      const validToken = TestUser.createValidJWT('workflow@example.com', 'user')
      
      const protectedResponse = await agent
        .get('/api/projects')
        .set('Authorization', `Bearer ${validToken}`)
      
      // Should either return projects (200) or empty list (200) or not found (404)
      expect([200, 404]).toContain(protectedResponse.status)
    })
  })
})

// Export for use in other test files
export {
  TestDatabase,
  TestUser,
  TestDataFactory
}
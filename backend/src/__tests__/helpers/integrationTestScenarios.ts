/**
 * Enhanced Integration Test Scenarios
 * Critical user workflows and end-to-end testing patterns
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { Express } from 'express'
import { TestDatabase, TestUser, TestDataFactory, ApiTestHelper } from './testSetup.js'
import { setupWebSocketTest } from './websocketTestHelper.js'
import { Socket } from 'socket.io-client'

export interface IntegrationTestUser {
  email: string
  password: string
  role: 'admin' | 'user'
  token?: string
}

export class IntegrationTestScenarios {
  private app: Express
  private wsHelper: any
  private serverUrl: string = ''

  constructor(app: Express) {
    this.app = app
  }

  /**
   * Setup WebSocket testing environment
   */
  async setupWebSocket() {
    const wsSetup = setupWebSocketTest(this.app)
    this.wsHelper = wsSetup.helper
    this.serverUrl = wsSetup.serverUrl
  }

  /**
   * User Registration and Authentication Flow
   */
  createUserAuthenticationFlow() {
    return describe('User Authentication Integration', () => {
      let agent: any

      beforeAll(async () => {
        await TestDatabase.initialize()
        agent = request.agent(this.app)
      })

      afterAll(async () => {
        await TestDatabase.disconnect()
      })

      beforeEach(async () => {
        await TestDatabase.cleanup()
      })

      it('should complete full user registration workflow', async () => {
        // Step 1: Register new user
        const userData = {
          email: 'integration@example.com',
          password: 'SecurePassword123!',
          role: 'user'
        }

        const registerResponse = await agent
          .post('/api/auth/register')
          .send(userData)
          .expect(201)

        expect(registerResponse.body).toMatchObject({
          success: true,
          user: {
            email: userData.email,
            role: 'user'
          }
        })

        // Step 2: Login with registered user
        const loginResponse = await agent
          .post('/api/auth/login')
          .send({
            email: userData.email,
            password: userData.password
          })
          .expect(200)

        expect(loginResponse.body).toHaveProperty('accessToken')
        expect(loginResponse.body).toHaveProperty('refreshToken')

        const token = loginResponse.body.accessToken

        // Step 3: Access protected resource
        const protectedResponse = await agent
          .get('/api/projects')
          .set('Authorization', `Bearer ${token}`)
          .expect(200)

        expect(protectedResponse.body).toHaveProperty('projects')

        // Step 4: Refresh token
        const refreshResponse = await agent
          .post('/api/auth/refresh')
          .send({ refreshToken: loginResponse.body.refreshToken })
          .expect(200)

        expect(refreshResponse.body).toHaveProperty('accessToken')

        // Step 5: Logout
        await agent
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${token}`)
          .expect(200)

        // Step 6: Verify token is invalidated
        await agent
          .get('/api/projects')
          .set('Authorization', `Bearer ${token}`)
          .expect(401)
      })

      it('should handle password reset flow', async () => {
        // Setup: Create user
        const user = await TestUser.createTestUser('reset@example.com')

        // Step 1: Request password reset
        await agent
          .post('/api/auth/forgot-password')
          .send({ email: user.email })
          .expect(200)

        // Step 2: Simulate reset with token (in real app, would come from email)
        // For testing, we'll use a mock token
        const resetToken = 'mock-reset-token'
        
        await agent
          .post('/api/auth/reset-password')
          .send({
            token: resetToken,
            newPassword: 'NewSecurePassword123!'
          })
          .expect(200)

        // Step 3: Login with new password
        await agent
          .post('/api/auth/login')
          .send({
            email: user.email,
            password: 'NewSecurePassword123!'
          })
          .expect(200)
      })
    })
  }

  /**
   * Project Management Complete Workflow
   */
  createProjectManagementFlow() {
    return describe('Project Management Integration', () => {
      let adminUser: IntegrationTestUser
      let regularUser: IntegrationTestUser
      let agent: any

      beforeAll(async () => {
        await TestDatabase.initialize()
        agent = request.agent(this.app)

        // Create test users
        adminUser = {
          email: 'admin@example.com',
          password: 'admin123',
          role: 'admin'
        }
        
        regularUser = {
          email: 'user@example.com',
          password: 'user123',
          role: 'user'
        }

        await TestUser.createTestUser(adminUser.email, adminUser.role)
        await TestUser.createTestUser(regularUser.email, regularUser.role)

        // Get tokens
        adminUser.token = TestUser.createValidJWT(adminUser.email, adminUser.role)
        regularUser.token = TestUser.createValidJWT(regularUser.email, regularUser.role)
      })

      afterAll(async () => {
        await TestDatabase.disconnect()
      })

      beforeEach(async () => {
        // Clean projects but keep users
        const db = TestDatabase.client
        await db.project.deleteMany({})
      })

      it('should complete project lifecycle with role-based access', async () => {
        // Step 1: Regular user creates project
        const projectData = TestDataFactory.projectData({
          name: 'Integration Test Project',
          status: 'todo'
        })

        const createResponse = await ApiTestHelper.authenticatedRequest(
          agent, 'POST', '/api/projects', projectData, regularUser.email
        )
        expect(createResponse.status).toBe(201)

        const projectId = createResponse.body.project.id
        expect(createResponse.body.project).toMatchObject(projectData)

        // Step 2: User retrieves their projects
        const listResponse = await agent
          .get('/api/projects')
          .set('Authorization', `Bearer ${regularUser.token}`)
          .expect(200)

        expect(listResponse.body.projects).toHaveLength(1)
        expect(listResponse.body.projects[0]).toMatchObject(projectData)

        // Step 3: User updates project
        const updateData = { status: 'in-progress' }
        
        const updateResponse = await ApiTestHelper.authenticatedRequest(
          agent, 'PATCH', `/api/projects/${projectId}`, updateData, regularUser.email
        )
        expect(updateResponse.status).toBe(200)

        expect(updateResponse.body.project.status).toBe('in-progress')

        // Step 4: Admin views all projects
        const adminListResponse = await agent
          .get('/api/admin/projects')
          .set('Authorization', `Bearer ${adminUser.token}`)
          .expect(200)

        expect(adminListResponse.body.projects).toHaveLength(1)

        // Step 5: Regular user cannot access admin endpoints
        await agent
          .get('/api/admin/projects')
          .set('Authorization', `Bearer ${regularUser.token}`)
          .expect(403)

        // Step 6: Project completion workflow
        const completeResponse = await ApiTestHelper.authenticatedRequest(
          agent, 'PATCH', `/api/projects/${projectId}`, { status: 'completed' }, regularUser.email
        )
        expect(completeResponse.status).toBe(200)

        expect(completeResponse.body.project.status).toBe('completed')

        // Step 7: Project archival (admin only)
        const archiveResponse = await ApiTestHelper.authenticatedRequest(
          agent, 'PATCH', `/api/admin/projects/${projectId}/archive`, {}, adminUser.email
        )
        expect(archiveResponse.status).toBe(200)
      })

      it('should handle concurrent project operations', async () => {
        const concurrentOperations = []
        const projectsToCreate = 5

        // Create multiple projects concurrently
        for (let i = 0; i < projectsToCreate; i++) {
          const projectData = TestDataFactory.projectData({
            name: `Concurrent Project ${i}`,
            status: 'todo'
          })

          concurrentOperations.push(
            ApiTestHelper.authenticatedRequest(
              agent, 'POST', '/api/projects', projectData, regularUser.email
            )
          )
        }

        const responses = await Promise.all(concurrentOperations)
        
        // All should succeed
        responses.forEach(response => {
          expect(response.status).toBe(201)
        })

        // Verify all projects exist
        const listResponse = await agent
          .get('/api/projects')
          .set('Authorization', `Bearer ${regularUser.token}`)
          .expect(200)

        expect(listResponse.body.projects).toHaveLength(projectsToCreate)
      })
    })
  }

  /**
   * Real-time WebSocket Integration
   */
  createWebSocketIntegrationFlow() {
    return describe('WebSocket Integration', () => {
      let client1: Socket
      let client2: Socket
      let projectId: string

      beforeAll(async () => {
        await TestDatabase.initialize()
        await this.setupWebSocket()
      })

      afterAll(async () => {
        await TestDatabase.disconnect()
        if (this.wsHelper) {
          await this.wsHelper.cleanup()
        }
      })

      beforeEach(async () => {
        await TestDatabase.cleanup()
        
        if (this.wsHelper) {
          // Create two WebSocket clients
          client1 = await this.wsHelper.createClient(this.serverUrl, 'user1@example.com')
          client2 = await this.wsHelper.createClient(this.serverUrl, 'user2@example.com')
        }
      })

      afterEach(async () => {
        if (client1) client1.disconnect()
        if (client2) client2.disconnect()
      })

      it('should broadcast project updates to all connected clients', async () => {
        if (!this.wsHelper) {
          console.log('WebSocket helper not available, skipping test')
          return
        }

        // Step 1: Create a project via HTTP API
        const agent = request.agent(this.app)
        
        const projectData = TestDataFactory.projectData({
          name: 'WebSocket Test Project'
        })

        const createResponse = await ApiTestHelper.authenticatedRequest(
          agent, 'POST', '/api/projects', projectData, 'creator@example.com'
        )
        expect(createResponse.status).toBe(201)

        projectId = createResponse.body.project.id

        // Step 2: Set up WebSocket listeners
        const client1Events: any[] = []
        const client2Events: any[] = []

        client1.on('project.updated', (data) => {
          client1Events.push(data)
        })

        client2.on('project.updated', (data) => {
          client2Events.push(data)
        })

        // Step 3: Update project via HTTP API
        const updateResponse = await ApiTestHelper.authenticatedRequest(
          agent, 'PATCH', `/api/projects/${projectId}`, { status: 'in-progress' }, 'creator@example.com'
        )
        expect(updateResponse.status).toBe(200)

        // Step 4: Wait for WebSocket events
        await new Promise(resolve => setTimeout(resolve, 100))

        // Step 5: Verify both clients received the update
        expect(client1Events).toHaveLength(1)
        expect(client2Events).toHaveLength(1)
        expect(client1Events[0].id).toBe(projectId)
        expect(client2Events[0].id).toBe(projectId)
      })

      it('should handle WebSocket authentication and authorization', async () => {
        if (!this.wsHelper) {
          console.log('WebSocket helper not available, skipping test')
          return
        }

        // Test connection without valid token
        try {
          await this.wsHelper.createClient(this.serverUrl, 'invalid@example.com', 'user', {
            auth: { token: 'invalid-token' }
          })
          expect(false).toBe(true) // Should not reach this
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          expect(errorMessage).toContain('Failed to connect')
        }

        // Test successful connection with valid token
        const validClient = await this.wsHelper.createClient(
          this.serverUrl, 
          'valid@example.com'
        )
        expect(validClient.connected).toBe(true)
        
        validClient.disconnect()
      })
    })
  }

  /**
   * File Upload and Processing Flow
   */
  createFileUploadFlow() {
    return describe('File Upload Integration', () => {
      let userToken: string
      let agent: any

      beforeAll(async () => {
        await TestDatabase.initialize()
        userToken = TestUser.createValidJWT('uploader@example.com')
        agent = request.agent(this.app)
      })

      afterAll(async () => {
        await TestDatabase.disconnect()
      })

      beforeEach(async () => {
        await TestDatabase.cleanup()
      })

      it('should handle 3D model file upload workflow', async () => {
        // Create a project first
        const projectData = TestDataFactory.projectData({
          name: 'File Upload Test Project'
        })

        const projectResponse = await ApiTestHelper.authenticatedRequest(
          agent, 'POST', '/api/projects', projectData, 'uploader@example.com'
        )
        expect(projectResponse.status).toBe(201)

        const projectId = projectResponse.body.project.id

        // Mock STL file content
        const stlContent = Buffer.from(`
          solid TestModel
          facet normal 0 0 1
            outer loop
              vertex 0 0 0
              vertex 1 0 0
              vertex 0 1 0
            endloop
          endfacet
          endsolid TestModel
        `)

        // Upload file
        const uploadResponse = await agent
          .post(`/api/projects/${projectId}/files`)
          .set('Authorization', `Bearer ${userToken}`)
          .attach('file', stlContent, 'test-model.stl')
          .expect(200)

        expect(uploadResponse.body).toHaveProperty('fileId')
        expect(uploadResponse.body.filename).toBe('test-model.stl')

        // Verify file is associated with project
        const projectWithFiles = await agent
          .get(`/api/projects/${projectId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200)

        expect(projectWithFiles.body.project.files).toHaveLength(1)
      })

      it('should reject invalid file types and sizes', async () => {
        const projectResponse = await ApiTestHelper.authenticatedRequest(
          agent, 'POST', '/api/projects', TestDataFactory.projectData(), 'uploader@example.com'
        )
        expect(projectResponse.status).toBe(201)

        const projectId = projectResponse.body.project.id

        // Test invalid file type
        const invalidContent = Buffer.from('invalid content')
        
        await agent
          .post(`/api/projects/${projectId}/files`)
          .set('Authorization', `Bearer ${userToken}`)
          .attach('file', invalidContent, 'malware.exe')
          .expect(400)

        // Test oversized file
        const largeContent = Buffer.alloc(100 * 1024 * 1024) // 100MB
        
        await agent
          .post(`/api/projects/${projectId}/files`)
          .set('Authorization', `Bearer ${userToken}`)
          .attach('file', largeContent, 'large-model.stl')
          .expect(413)
      })
    })
  }

  /**
   * Data Consistency and Transaction Flow
   */
  createDataConsistencyFlow() {
    return describe('Data Consistency Integration', () => {
      let agent: any
      let userToken: string

      beforeAll(async () => {
        await TestDatabase.initialize()
        userToken = TestUser.createValidJWT('consistency@example.com')
        agent = request.agent(this.app)
      })

      afterAll(async () => {
        await TestDatabase.disconnect()
      })

      beforeEach(async () => {
        await TestDatabase.cleanup()
      })

      it('should maintain data consistency during complex operations', async () => {
        // Create a project with multiple related records
        const projectResponse = await ApiTestHelper.authenticatedRequest(
          agent, 'POST', '/api/projects', 
          TestDataFactory.projectData({ name: 'Consistency Test' }),
          'consistency@example.com'
        )
        expect(projectResponse.status).toBe(201)

        const projectId = projectResponse.body.project.id

        // Attempt to delete project while adding files (should handle gracefully)
        const operations = [
          // Add file
          agent
            .post(`/api/projects/${projectId}/files`)
            .set('Authorization', `Bearer ${userToken}`)
            .attach('file', Buffer.from('test'), 'test.stl'),
          
          // Update project
          ApiTestHelper.authenticatedRequest(
            agent, 'PATCH', `/api/projects/${projectId}`, 
            { status: 'in-progress' }, 'consistency@example.com'
          ),

          // Delete project
          ApiTestHelper.authenticatedRequest(
            agent, 'DELETE', `/api/projects/${projectId}`, 
            undefined, 'consistency@example.com'
          )
        ]

        const results = await Promise.allSettled(operations)
        
        // At least some operations should complete successfully
        const successful = results.filter(r => r.status === 'fulfilled').length
        expect(successful).toBeGreaterThan(0)

        // Verify database consistency
        const finalProjects = await agent
          .get('/api/projects')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200)

        // Should either have the project or not, but be consistent
        const projectExists = finalProjects.body.projects.some((p: any) => p.id === projectId)
        
        if (projectExists) {
          // If project exists, verify it's in a consistent state
          const project = finalProjects.body.projects.find((p: any) => p.id === projectId)
          expect(project).toBeDefined()
          expect(['todo', 'in-progress', 'completed']).toContain(project.status)
        }
      })
    })
  }

  /**
   * API Rate Limiting Integration
   */
  createRateLimitingFlow() {
    return describe('Rate Limiting Integration', () => {
      let userToken: string

      beforeAll(async () => {
        await TestDatabase.initialize()
        userToken = TestUser.createValidJWT('ratelimit@example.com')
      })

      afterAll(async () => {
        await TestDatabase.disconnect()
      })

      it('should enforce rate limits across multiple endpoints', async () => {
        const requests = []
        const endpoints = [
          '/api/projects',
          '/api/health',
          '/api/csrf-token'
        ]

        // Send many requests quickly
        for (let i = 0; i < 200; i++) {
          const endpoint = endpoints[i % endpoints.length]
          requests.push(
            request(this.app)
              .get(endpoint)
              .set('Authorization', userToken ? `Bearer ${userToken}` : '')
          )
        }

        const responses = await Promise.allSettled(requests)
        const rateLimited = responses.filter(r => 
          r.status === 'fulfilled' && r.value.status === 429
        ).length

        expect(rateLimited).toBeGreaterThan(0)
      })
    })
  }

  /**
   * Run all integration test scenarios
   */
  runAllScenarios() {
    describe('Integration Test Scenarios', () => {
      this.createUserAuthenticationFlow()
      this.createProjectManagementFlow()
      this.createWebSocketIntegrationFlow()
      this.createFileUploadFlow()
      this.createDataConsistencyFlow()
      this.createRateLimitingFlow()
    })
  }
}

/**
 * Helper to create comprehensive integration test suite
 */
export function createIntegrationTestSuite(app: Express) {
  const scenarios = new IntegrationTestScenarios(app)
  
  return {
    scenarios,
    runAll: () => scenarios.runAllScenarios(),
    
    // Individual scenario creators
    userAuth: () => scenarios.createUserAuthenticationFlow(),
    projectManagement: () => scenarios.createProjectManagementFlow(),
    websocket: () => scenarios.createWebSocketIntegrationFlow(),
    fileUpload: () => scenarios.createFileUploadFlow(),
    dataConsistency: () => scenarios.createDataConsistencyFlow(),
    rateLimit: () => scenarios.createRateLimitingFlow()
  }
}
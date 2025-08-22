import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import app from '../../index.js'

/**
 * Integration Tests for V2 API Critical User Flows
 * Tests complete user journeys through the V2 API endpoints
 */

describe('V2 API Integration Tests', () => {
  let accessToken: string
  let refreshTokenCookie: string
  let agent: request.SuperAgentTest
  let csrfToken: string

  // Helper function to setup CSRF token
  async function setupCsrf() {
    agent = request.agent(app)
    const csrfRes = await agent.get('/api/csrf-token')
    csrfToken = csrfRes.body.csrfToken
    return { agent, csrfToken }
  }

  describe('Authentication Flow', () => {
    it('should complete full authentication flow - register → login → refresh → logout', async () => {
      const { agent, csrfToken } = await setupCsrf()

      const testUser = {
        email: 'integration-test@example.com',
        password: 'TestPassword123!',
        role: 'user'
      }

      // 1. Register new user
      const registerResponse = await agent
        .post('/api/v2/auth/register')
        .set('x-csrf-token', csrfToken)
        .send(testUser)
        .expect(201)

      expect(registerResponse.body).toMatchObject({
        user: {
          email: testUser.email,
          role: testUser.role
        },
        accessToken: expect.any(String)
      })

      expect(registerResponse.headers['set-cookie']).toBeDefined()
      const registerCookie = registerResponse.headers['set-cookie'][0]
      expect(registerCookie).toMatch(/refreshToken=/)

      // 2. Login with registered user (using same agent to keep cookies)
      const loginResponse = await agent
        .post('/api/v2/auth/login')
        .set('x-csrf-token', csrfToken)
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200)

      expect(loginResponse.body).toMatchObject({
        user: {
          email: testUser.email,
          role: testUser.role
        },
        accessToken: expect.any(String)
      })

      accessToken = loginResponse.body.accessToken

      // 3. Access protected endpoint with access token
      const meResponse = await agent
        .get('/api/v2/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(meResponse.body).toMatchObject({
        email: testUser.email,
        role: testUser.role
      })

      // 4. Refresh token (using agent to keep refresh cookie)
      const refreshResponse = await agent
        .post('/api/v2/auth/refresh')
        .set('x-csrf-token', csrfToken)
        .expect(200)

      expect(refreshResponse.body).toHaveProperty('accessToken')
      expect(refreshResponse.headers['set-cookie']).toBeDefined()

      // 5. Logout (using agent to access refresh cookie)
      const logoutResponse = await agent
        .post('/api/v2/auth/logout')
        .set('x-csrf-token', csrfToken)
        .expect(200)

      expect(logoutResponse.body).toHaveProperty('message')
      expect(logoutResponse.headers['set-cookie']).toMatch(/refreshToken=;/)
    })

    it('should handle authentication errors properly', async () => {
      const { agent, csrfToken } = await setupCsrf()

      // Invalid login credentials
      await agent
        .post('/api/v2/auth/login')
        .set('x-csrf-token', csrfToken)
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        })
        .expect(401)
        .then(res => {
          expect(res.body).toMatchObject({
            success: false,
            error: {
              code: 'INVALID_CREDENTIALS',
              status: 401,
              timestamp: expect.any(String)
            }
          })
        })

      // Missing refresh token (using new agent without login)
      const freshAgent = request.agent(app)
      const freshCsrfRes = await freshAgent.get('/api/csrf-token')
      const freshCsrfToken = freshCsrfRes.body.csrfToken

      await freshAgent
        .post('/api/v2/auth/refresh')
        .set('x-csrf-token', freshCsrfToken)
        .expect(401)
        .then(res => {
          expect(res.body).toMatchObject({
            success: false,
            error: {
              code: 'NO_REFRESH_TOKEN',
              status: 401
            }
          })
        })

      // Unauthorized access to protected endpoint
      await agent
        .get('/api/v2/auth/me')
        .expect(401)
    })
  })

  describe('Project Management Flow', () => {
    beforeEach(async () => {
      // Setup CSRF and login to get access token for project tests
      const { agent: testAgent, csrfToken: testCsrfToken } = await setupCsrf()
      agent = testAgent
      csrfToken = testCsrfToken

      const loginResponse = await agent
        .post('/api/v2/auth/login')
        .set('x-csrf-token', csrfToken)
        .send({
          email: 'demo@example.com',
          password: 'Password123!'
        })

      accessToken = loginResponse.body.accessToken
    })

    it('should complete project lifecycle - create → list → get → update', async () => {
      const newProject = {
        name: 'Integration Test Project',
        status: 'todo'
      }

      // 1. Create project
      const createResponse = await agent
        .post('/api/v2/projects')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('x-csrf-token', csrfToken)
        .send(newProject)
        .expect(201)

      expect(createResponse.body).toMatchObject({
        name: newProject.name,
        status: newProject.status,
        id: expect.any(String),
        createdAt: expect.any(String)
      })

      const projectId = createResponse.body.id

      // 2. List projects (should include newly created)
      const listResponse = await agent
        .get('/api/v2/projects')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(Array.isArray(listResponse.body)).toBe(true)
      expect(listResponse.headers['x-total-count']).toBeDefined()
      
      const createdProject = listResponse.body.find((p: any) => p.id === projectId)
      expect(createdProject).toBeDefined()

      // 3. Get specific project
      // Note: This would need to be implemented in the v2 projects router
      // For now, we verify the project exists in the list

      // 4. Update project (would need PUT endpoint in v2 router)
      // This test demonstrates the complete flow structure
    })

    it('should handle project validation errors', async () => {
      // Invalid project data
      await agent
        .post('/api/v2/projects')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('x-csrf-token', csrfToken)
        .send({
          name: '', // Empty name should fail validation
          status: 'invalid_status'
        })
        .expect(400)
        .then(res => {
          expect(res.body).toMatchObject({
            success: false,
            error: {
              code: 'BAD_REQUEST',
              status: 400,
              details: expect.any(Array)
            }
          })
        })
    })
  })

  describe('Task Management Flow', () => {
    beforeEach(async () => {
      // Setup CSRF and login for task management tests
      const { agent: testAgent, csrfToken: testCsrfToken } = await setupCsrf()
      agent = testAgent
      csrfToken = testCsrfToken

      const loginResponse = await agent
        .post('/api/v2/auth/login')
        .set('x-csrf-token', csrfToken)
        .send({
          email: 'demo@example.com',
          password: 'Password123!'
        })

      accessToken = loginResponse.body.accessToken
    })

    it('should complete task lifecycle - create → list → get → update → delete', async () => {
      const newTask = {
        title: 'Integration Test Task',
        description: 'This is a test task created during integration testing',
        status: 'todo',
        priority: 'medium',
        labels: ['test', 'integration']
      }

      // 1. Create task
      const createResponse = await agent
        .post('/api/v2/project-management/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('x-csrf-token', csrfToken)
        .send(newTask)
        .expect(201)

      expect(createResponse.body).toMatchObject({
        title: newTask.title,
        description: newTask.description,
        status: newTask.status,
        priority: newTask.priority,
        labels: newTask.labels,
        id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })

      const taskId = createResponse.body.id

      // 2. List tasks
      const listResponse = await agent
        .get('/api/v2/project-management/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(Array.isArray(listResponse.body)).toBe(true)
      expect(listResponse.headers['x-total-count']).toBeDefined()
      
      const createdTask = listResponse.body.find((t: any) => t.id === taskId)
      expect(createdTask).toBeDefined()

      // 3. Get specific task
      const getResponse = await agent
        .get(`/api/v2/project-management/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(getResponse.body).toMatchObject({
        id: taskId,
        title: newTask.title
      })

      // 4. Update task
      const updateData = {
        status: 'in_progress',
        priority: 'high',
        description: 'Updated during integration test'
      }

      const updateResponse = await agent
        .put(`/api/v2/project-management/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('x-csrf-token', csrfToken)
        .send(updateData)
        .expect(200)

      expect(updateResponse.body).toMatchObject({
        id: taskId,
        ...updateData,
        updatedAt: expect.any(String)
      })

      // Verify the update changed the updatedAt timestamp
      expect(updateResponse.body.updatedAt).not.toBe(createResponse.body.updatedAt)

      // 5. Delete task
      await agent
        .delete(`/api/v2/project-management/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('x-csrf-token', csrfToken)
        .expect(204)

      // 6. Verify task is deleted
      await agent
        .get(`/api/v2/project-management/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404)
        .then(res => {
          expect(res.body).toMatchObject({
            success: false,
            error: {
              code: 'TASK_NOT_FOUND',
              status: 404
            }
          })
        })
    })

    it('should handle task filtering and pagination', async () => {
      // Create multiple tasks with different statuses
      const tasks = [
        { title: 'Todo Task', status: 'todo', priority: 'low' },
        { title: 'In Progress Task', status: 'in_progress', priority: 'high' },
        { title: 'Done Task', status: 'done', priority: 'medium' }
      ]

      const createdTasks = []
      for (const task of tasks) {
        const response = await agent
          .post('/api/v2/project-management/tasks')
          .set('Authorization', `Bearer ${accessToken}`)
          .set('x-csrf-token', csrfToken)
          .send(task)
          .expect(201)
        createdTasks.push(response.body)
      }

      // Test status filtering
      const todoResponse = await agent
        .get('/api/v2/project-management/tasks?status=todo')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      const todoTasks = todoResponse.body
      expect(todoTasks.every((t: any) => t.status === 'todo')).toBe(true)

      // Test priority filtering  
      const highPriorityResponse = await agent
        .get('/api/v2/project-management/tasks?priority=high')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      const highPriorityTasks = highPriorityResponse.body
      expect(highPriorityTasks.every((t: any) => t.priority === 'high')).toBe(true)

      // Test search functionality
      const searchResponse = await agent
        .get('/api/v2/project-management/tasks?search=Progress')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      const searchTasks = searchResponse.body
      expect(searchTasks.some((t: any) => t.title.includes('Progress'))).toBe(true)

      // Test pagination
      const paginatedResponse = await agent
        .get('/api/v2/project-management/tasks?limit=2&offset=0')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(paginatedResponse.body.length).toBeLessThanOrEqual(2)
      expect(paginatedResponse.headers['x-total-count']).toBeDefined()

      // Cleanup - delete created tasks
      for (const task of createdTasks) {
        await agent
          .delete(`/api/v2/project-management/tasks/${task.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .set('x-csrf-token', csrfToken)
      }
    })

    it('should handle task validation errors', async () => {
      // Invalid task data
      await agent
        .post('/api/v2/project-management/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('x-csrf-token', csrfToken)
        .send({
          title: '', // Empty title
          status: 'invalid_status',
          priority: 'invalid_priority'
        })
        .expect(400)
        .then(res => {
          expect(res.body).toMatchObject({
            success: false,
            error: {
              code: 'BAD_REQUEST',
              status: 400,
              details: expect.any(Array)
            }
          })
        })
    })
  })

  describe('API Versioning and Deprecation', () => {
    it('should return deprecation headers for v1 endpoints', async () => {
      const response = await agent
        .get('/api/auth/me')
        .expect(200)

      expect(response.headers['x-api-deprecated']).toBe('true')
      expect(response.headers['x-api-deprecation-info']).toBe(
        'This API version is deprecated. Please use /api/v2/auth'
      )
    })

    it('should not return deprecation headers for v2 endpoints', async () => {
      // Setup CSRF and login to get token for protected v2 endpoint test
      const { agent: testAgent, csrfToken: testCsrfToken } = await setupCsrf()

      const loginResponse = await testAgent
        .post('/api/v2/auth/login')
        .set('x-csrf-token', testCsrfToken)
        .send({
          email: 'demo@example.com',
          password: 'Password123!'
        })

      const token = loginResponse.body.accessToken

      const response = await testAgent
        .get('/api/v2/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.headers['x-api-deprecated']).toBeUndefined()
      expect(response.headers['x-api-deprecation-info']).toBeUndefined()
    })
  })

  describe('Error Handling and Response Format', () => {
    it('should return standardized error responses across all v2 endpoints', async () => {
      // Test various error scenarios to ensure consistent format

      // 401 Unauthorized
      const unauthorizedResponse = await agent
        .get('/api/v2/auth/me')
        .expect(401)

      expect(unauthorizedResponse.body).toMatchObject({
        message: expect.any(String) // Backwards compatibility
      })

      // 400 Bad Request 
      const { agent: badReqAgent, csrfToken: badReqCsrfToken } = await setupCsrf()

      const badRequestResponse = await badReqAgent
        .post('/api/v2/auth/login')
        .set('x-csrf-token', badReqCsrfToken)
        .send({
          email: 'invalid-email',
          password: '123' // Too short
        })
        .expect(400)

      expect(badRequestResponse.body).toMatchObject({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Validation failed',
          status: 400,
          timestamp: expect.any(String),
          details: expect.any(Array)
        },
        message: 'Validation failed' // Backwards compatibility
      })

      // 404 Not Found
      const { agent: errorTestAgent, csrfToken: errorTestCsrfToken } = await setupCsrf()

      const loginResponse = await errorTestAgent
        .post('/api/v2/auth/login')
        .set('x-csrf-token', errorTestCsrfToken)
        .send({
          email: 'demo@example.com',
          password: 'Password123!'
        })
      
      const token = loginResponse.body.accessToken

      const notFoundResponse = await errorTestAgent
        .get('/api/v2/project-management/tasks/nonexistent-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404)

      expect(notFoundResponse.body).toMatchObject({
        success: false,
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'Task not found',
          status: 404,
          timestamp: expect.any(String)
        }
      })
    })
  })
})
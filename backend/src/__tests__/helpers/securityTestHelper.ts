/**
 * Security Testing Helpers
 * Comprehensive security testing patterns and utilities
 */

import request from 'supertest'
import { Express } from 'express'
import jwt from 'jsonwebtoken'
import { securityConfig } from '../../config/index.js'

export interface SecurityTestResult {
  passed: boolean
  message: string
  details?: any
}

export class SecurityTestHelper {
  constructor(private app: Express) {}

  /**
   * Test JWT token security
   */
  async testJWTSecurity(): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = []

    // Test 1: Invalid token format
    const invalidTokenTest = await request(this.app)
      .get('/api/projects')
      .set('Authorization', 'Bearer invalid-token-format')

    results.push({
      passed: invalidTokenTest.status === 401,
      message: 'Invalid JWT token format should be rejected',
      details: { status: invalidTokenTest.status, response: invalidTokenTest.body }
    })

    // Test 2: Expired token
    const expiredToken = jwt.sign(
      { email: 'test@example.com', role: 'user' },
      securityConfig.jwt.secret,
      { expiresIn: '-1h' }
    )

    const expiredTokenTest = await request(this.app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${expiredToken}`)

    results.push({
      passed: expiredTokenTest.status === 401,
      message: 'Expired JWT token should be rejected',
      details: { status: expiredTokenTest.status, response: expiredTokenTest.body }
    })

    // Test 3: Token with wrong secret
    const wrongSecretToken = jwt.sign(
      { email: 'test@example.com', role: 'user' },
      'wrong-secret',
      { expiresIn: '1h' }
    )

    const wrongSecretTest = await request(this.app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${wrongSecretToken}`)

    results.push({
      passed: wrongSecretTest.status === 401,
      message: 'JWT token with wrong secret should be rejected',
      details: { status: wrongSecretTest.status, response: wrongSecretTest.body }
    })

    // Test 4: Token without required claims
    const incompleteToken = jwt.sign(
      { email: 'test@example.com' }, // Missing role
      securityConfig.jwt.secret,
      { expiresIn: '1h' }
    )

    const incompleteTokenTest = await request(this.app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${incompleteToken}`)

    results.push({
      passed: incompleteTokenTest.status === 401,
      message: 'JWT token without required claims should be rejected',
      details: { status: incompleteTokenTest.status, response: incompleteTokenTest.body }
    })

    return results
  }

  /**
   * Test CSRF protection
   */
  async testCSRFProtection(): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = []
    const validToken = jwt.sign(
      { email: 'test@example.com', role: 'user' },
      securityConfig.jwt.secret,
      { expiresIn: '1h' }
    )

    // Test 1: POST without CSRF token
    const noCsrfTest = await request(this.app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ name: 'Test Project' })

    results.push({
      passed: noCsrfTest.status === 403,
      message: 'POST request without CSRF token should be rejected',
      details: { status: noCsrfTest.status, response: noCsrfTest.body }
    })

    // Test 2: POST with invalid CSRF token
    const invalidCsrfTest = await request(this.app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${validToken}`)
      .set('x-csrf-token', 'invalid-csrf-token')
      .send({ name: 'Test Project' })

    results.push({
      passed: invalidCsrfTest.status === 403,
      message: 'POST request with invalid CSRF token should be rejected',
      details: { status: invalidCsrfTest.status, response: invalidCsrfTest.body }
    })

    // Test 3: Valid CSRF flow
    const agent = request.agent(this.app)
    const csrfResponse = await agent.get('/api/csrf-token')
    const csrfToken = csrfResponse.body.csrfToken

    const validCsrfTest = await agent
      .post('/api/projects')
      .set('Authorization', `Bearer ${validToken}`)
      .set('x-csrf-token', csrfToken)
      .send({ name: 'Test Project' })

    results.push({
      passed: validCsrfTest.status !== 403,
      message: 'POST request with valid CSRF token should be allowed',
      details: { status: validCsrfTest.status, response: validCsrfTest.body }
    })

    return results
  }

  /**
   * Test rate limiting
   */
  async testRateLimit(
    endpoint: string,
    maxRequests: number = 100,
    _windowMs: number = 60000
  ): Promise<SecurityTestResult> {
    const requests = []
    const startTime = Date.now()

    // Send requests rapidly
    for (let i = 0; i < maxRequests + 10; i++) {
      requests.push(
        request(this.app)
          .get(endpoint)
          .expect((res) => res.status)
      )
    }

    const responses = await Promise.all(requests)
    const rateLimitedResponses = responses.filter(res => res.status === 429)

    return {
      passed: rateLimitedResponses.length > 0,
      message: 'Rate limiting should block excessive requests',
      details: {
        totalRequests: responses.length,
        rateLimitedRequests: rateLimitedResponses.length,
        timeElapsed: Date.now() - startTime
      }
    }
  }

  /**
   * Test input validation and sanitization
   */
  async testInputValidation(): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = []
    const validToken = jwt.sign(
      { email: 'test@example.com', role: 'user' },
      securityConfig.jwt.secret,
      { expiresIn: '1h' }
    )

    const agent = request.agent(this.app)
    const csrfResponse = await agent.get('/api/csrf-token')
    const csrfToken = csrfResponse.body.csrfToken

    // Test malicious payloads
    const maliciousPayloads = [
      {
        name: 'XSS script injection',
        payload: { name: '<script>alert("xss")</script>' },
        description: 'Should sanitize script tags'
      },
      {
        name: 'SQL injection attempt',
        payload: { name: "'; DROP TABLE users; --" },
        description: 'Should sanitize SQL injection attempts'
      },
      {
        name: 'NoSQL injection',
        payload: { name: { $ne: null } },
        description: 'Should reject object injection'
      },
      {
        name: 'Path traversal',
        payload: { name: '../../etc/passwd' },
        description: 'Should sanitize path traversal attempts'
      },
      {
        name: 'Extremely long input',
        payload: { name: 'A'.repeat(10000) },
        description: 'Should reject excessively long input'
      }
    ]

    for (const test of maliciousPayloads) {
      const response = await agent
        .post('/api/projects')
        .set('Authorization', `Bearer ${validToken}`)
        .set('x-csrf-token', csrfToken)
        .send(test.payload)

      results.push({
        passed: response.status >= 400,
        message: test.description,
        details: {
          test: test.name,
          status: response.status,
          response: response.body
        }
      })
    }

    return results
  }

  /**
   * Test authorization (role-based access control)
   */
  async testAuthorization(): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = []

    // Create tokens for different roles
    const userToken = jwt.sign(
      { email: 'user@example.com', role: 'user' },
      securityConfig.jwt.secret,
      { expiresIn: '1h' }
    )

    const adminToken = jwt.sign(
      { email: 'admin@example.com', role: 'admin' },
      securityConfig.jwt.secret,
      { expiresIn: '1h' }
    )

    // Test admin-only endpoints
    const adminEndpoints = [
      '/api/admin/users',
      '/api/admin/system',
      '/api/admin/metrics'
    ]

    for (const endpoint of adminEndpoints) {
      // Test user access (should be denied)
      const userAccessTest = await request(this.app)
        .get(endpoint)
        .set('Authorization', `Bearer ${userToken}`)

      results.push({
        passed: userAccessTest.status === 403,
        message: `User should not access admin endpoint ${endpoint}`,
        details: { status: userAccessTest.status, endpoint }
      })

      // Test admin access (should be allowed)
      const adminAccessTest = await request(this.app)
        .get(endpoint)
        .set('Authorization', `Bearer ${adminToken}`)

      results.push({
        passed: adminAccessTest.status !== 403,
        message: `Admin should access admin endpoint ${endpoint}`,
        details: { status: adminAccessTest.status, endpoint }
      })
    }

    return results
  }

  /**
   * Test session security
   */
  async testSessionSecurity(): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = []

    // Test 1: Session fixation
    const agent1 = request.agent(this.app)
    const session1 = await agent1.get('/api/csrf-token')
    const sessionCookie1 = session1.headers['set-cookie']

    // Simulate login
    const loginResponse = await agent1
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' })

    // Check if session ID changed after login
    const sessionCookie2 = loginResponse.headers['set-cookie']
    
    results.push({
      passed: JSON.stringify(sessionCookie1) !== JSON.stringify(sessionCookie2),
      message: 'Session ID should change after login to prevent fixation',
      details: { 
        beforeLogin: sessionCookie1,
        afterLogin: sessionCookie2
      }
    })

    // Test 2: Secure cookie attributes
    if (sessionCookie2) {
      const cookieString = sessionCookie2[0] || ''
      cookieString.includes('Secure')
      const hasHttpOnly = cookieString.includes('HttpOnly')
      const hasSameSite = cookieString.includes('SameSite')

      results.push({
        passed: hasHttpOnly,
        message: 'Session cookies should have HttpOnly attribute',
        details: { cookieString, hasHttpOnly }
      })

      results.push({
        passed: hasSameSite,
        message: 'Session cookies should have SameSite attribute',
        details: { cookieString, hasSameSite }
      })
    }

    return results
  }

  /**
   * Test password security
   */
  async testPasswordSecurity(): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = []

    // Test weak password rejection
    const weakPasswords = [
      '123456',
      'password',
      'qwerty',
      '1234',
      'admin',
      ''
    ]

    for (const weakPassword of weakPasswords) {
      const response = await request(this.app)
        .post('/api/auth/register')
        .send({
          email: `test${Date.now()}@example.com`,
          password: weakPassword
        })

      results.push({
        passed: response.status >= 400,
        message: `Weak password "${weakPassword}" should be rejected`,
        details: { password: weakPassword, status: response.status }
      })
    }

    // Test password brute force protection
    const bruteForceAttempts = []
    const testEmail = 'bruteforce@example.com'

    for (let i = 0; i < 10; i++) {
      bruteForceAttempts.push(
        request(this.app)
          .post('/api/auth/login')
          .send({ email: testEmail, password: `wrongpassword${i}` })
      )
    }

    const bruteForceResults = await Promise.all(bruteForceAttempts)
    const laterResults = bruteForceResults.slice(-3) // Last 3 attempts
    const accountLocked = laterResults.every(res => res.status === 429 || res.status === 423)

    results.push({
      passed: accountLocked,
      message: 'Account should be locked after multiple failed login attempts',
      details: {
        attempts: bruteForceResults.length,
        laterStatuses: laterResults.map(r => r.status)
      }
    })

    return results
  }

  /**
   * Test file upload security
   */
  async testFileUploadSecurity(): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = []
    const validToken = jwt.sign(
      { email: 'test@example.com', role: 'user' },
      securityConfig.jwt.secret,
      { expiresIn: '1h' }
    )

    // Test malicious file types
    const maliciousFiles = [
      { filename: 'malware.exe', content: 'fake exe content' },
      { filename: 'script.php', content: '<?php echo "hack"; ?>' },
      { filename: 'shell.sh', content: '#!/bin/bash\nrm -rf /' },
      { filename: 'config.config', content: 'malicious config' }
    ]

    for (const file of maliciousFiles) {
      const response = await request(this.app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${validToken}`)
        .attach('file', Buffer.from(file.content), file.filename)

      results.push({
        passed: response.status >= 400,
        message: `Malicious file ${file.filename} should be rejected`,
        details: { filename: file.filename, status: response.status }
      })
    }

    // Test file size limits
    const largeFileContent = Buffer.alloc(10 * 1024 * 1024) // 10MB
    const largeSizeTest = await request(this.app)
      .post('/api/upload')
      .set('Authorization', `Bearer ${validToken}`)
      .attach('file', largeFileContent, 'large.txt')

    results.push({
      passed: largeSizeTest.status >= 400,
      message: 'Files exceeding size limit should be rejected',
      details: { status: largeSizeTest.status, fileSize: largeFileContent.length }
    })

    return results
  }

  /**
   * Comprehensive security test suite
   */
  async runComprehensiveSecurityTests(): Promise<{
    totalTests: number
    passedTests: number
    failedTests: number
    results: SecurityTestResult[]
  }> {
    const allResults: SecurityTestResult[] = []

    // Run all security tests
    const testSuites = [
      () => this.testJWTSecurity(),
      () => this.testCSRFProtection(),
      () => this.testInputValidation(),
      () => this.testAuthorization(),
      () => this.testSessionSecurity(),
      () => this.testPasswordSecurity(),
      () => this.testFileUploadSecurity()
    ]

    for (const testSuite of testSuites) {
      try {
        const results = await testSuite()
        allResults.push(...results)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        allResults.push({
          passed: false,
          message: `Test suite failed: ${errorMessage}`,
          details: { error: errorMessage }
        })
      }
    }

    // Add rate limiting test
    try {
      const rateLimitResult = await this.testRateLimit('/api/health')
      allResults.push(rateLimitResult)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      allResults.push({
        passed: false,
        message: `Rate limit test failed: ${errorMessage}`,
        details: { error: errorMessage }
      })
    }

    const passedTests = allResults.filter(r => r.passed).length
    const failedTests = allResults.filter(r => !r.passed).length

    return {
      totalTests: allResults.length,
      passedTests,
      failedTests,
      results: allResults
    }
  }
}

/**
 * Security testing setup helper
 */
export function setupSecurityTest(app: Express) {
  const securityHelper = new SecurityTestHelper(app)

  return {
    get helper() { return securityHelper },
    
    async runBasicSecurityTests() {
      return securityHelper.runComprehensiveSecurityTests()
    },
    
    async testEndpointSecurity(endpoint: string) {
      return {
        jwt: await securityHelper.testJWTSecurity(),
        csrf: await securityHelper.testCSRFProtection(),
        rateLimit: await securityHelper.testRateLimit(endpoint)
      }
    }
  }
}
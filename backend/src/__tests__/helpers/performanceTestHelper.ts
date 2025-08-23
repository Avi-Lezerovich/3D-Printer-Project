/**
 * Performance Testing Helpers
 * Load testing, bottleneck identification, and performance metrics
 */

import request from 'supertest'
import { Express } from 'express'
import { EventEmitter } from 'events'
import jwt from 'jsonwebtoken'
import { securityConfig } from '../../config/index.js'

export interface PerformanceMetrics {
  requestsPerSecond: number
  averageResponseTime: number
  minResponseTime: number
  maxResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  errorRate: number
  memoryUsage: NodeJS.MemoryUsage
  cpuUsage: NodeJS.CpuUsage
}

export interface LoadTestConfig {
  concurrency: number
  duration: number // in seconds
  rampUpTime?: number // in seconds
  endpoint: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  payload?: any
  headers?: Record<string, string>
  expectedStatusCodes?: number[]
}

export interface LoadTestResult {
  config: LoadTestConfig
  metrics: PerformanceMetrics
  timeline: Array<{
    timestamp: number
    responseTime: number
    statusCode: number
    success: boolean
  }>
  errors: Array<{
    timestamp: number
    error: string
    statusCode?: number
  }>
}

export class PerformanceTestHelper {
  private app: Express
  private eventEmitter: EventEmitter

  constructor(app: Express) {
    this.app = app
    this.eventEmitter = new EventEmitter()
    this.eventEmitter.setMaxListeners(1000) // Handle many concurrent requests
  }

  /**
   * Run comprehensive load test
   */
  async runLoadTest(config: LoadTestConfig): Promise<LoadTestResult> {
    const {
      concurrency,
      duration,
      rampUpTime = 0,
      endpoint,
      method = 'GET',
      payload,
      headers = {},
      expectedStatusCodes = [200, 201, 204]
    } = config

    const results: Array<{
      timestamp: number
      responseTime: number
      statusCode: number
      success: boolean
    }> = []

    const errors: Array<{
      timestamp: number
      error: string
      statusCode?: number
    }> = []

    const startTime = Date.now()
    const endTime = startTime + (duration * 1000)
    let activeRequests = 0
    const maxConcurrency = concurrency

    // Get initial system metrics
    const initialMemory = process.memoryUsage()
    const initialCpu = process.cpuUsage()

    // Create request function
    const makeRequest = async (): Promise<void> => {
      if (Date.now() >= endTime) return
      
      activeRequests++
      const requestStart = Date.now()

      try {
        let req = request(this.app)[method.toLowerCase()](endpoint)

        // Apply headers
        Object.entries(headers).forEach(([key, value]) => {
          req = req.set(key, value)
        })

        // Add payload for non-GET requests
        if (['POST', 'PUT', 'PATCH'].includes(method) && payload) {
          req = req.send(payload)
        }

        const response = await req
        const responseTime = Date.now() - requestStart
        const success = expectedStatusCodes.includes(response.status)

        results.push({
          timestamp: requestStart,
          responseTime,
          statusCode: response.status,
          success
        })

        if (!success) {
          errors.push({
            timestamp: requestStart,
            error: `Unexpected status code: ${response.status}`,
            statusCode: response.status
          })
        }

      } catch (error) {
        const responseTime = Date.now() - requestStart
        results.push({
          timestamp: requestStart,
          responseTime,
          statusCode: 0,
          success: false
        })

        errors.push({
          timestamp: requestStart,
          error: error.message
        })
      } finally {
        activeRequests--
        
        // Schedule next request if we haven't reached the end time
        if (Date.now() < endTime) {
          // Control concurrency
          const delay = activeRequests >= maxConcurrency ? 10 : 0
          setTimeout(() => makeRequest(), delay)
        }
      }
    }

    // Start initial concurrent requests with ramp-up
    const rampUpInterval = rampUpTime > 0 ? (rampUpTime * 1000) / concurrency : 0
    
    for (let i = 0; i < concurrency; i++) {
      setTimeout(() => {
        makeRequest()
      }, i * rampUpInterval)
    }

    // Wait for all requests to complete
    await new Promise(resolve => {
      const checkInterval = setInterval(() => {
        if (Date.now() >= endTime && activeRequests === 0) {
          clearInterval(checkInterval)
          resolve(undefined)
        }
      }, 100)
    })

    // Calculate final metrics
    const finalMemory = process.memoryUsage()
    const finalCpu = process.cpuUsage(initialCpu)

    const responseTimes = results.map(r => r.responseTime).sort((a, b) => a - b)
    const successfulRequests = results.filter(r => r.success).length
    const totalDuration = (Date.now() - startTime) / 1000

    const metrics: PerformanceMetrics = {
      requestsPerSecond: results.length / totalDuration,
      averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length || 0,
      minResponseTime: responseTimes[0] || 0,
      maxResponseTime: responseTimes[responseTimes.length - 1] || 0,
      p95ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.95)] || 0,
      p99ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.99)] || 0,
      totalRequests: results.length,
      successfulRequests,
      failedRequests: results.length - successfulRequests,
      errorRate: results.length > 0 ? (results.length - successfulRequests) / results.length : 0,
      memoryUsage: {
        rss: finalMemory.rss - initialMemory.rss,
        heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
        heapTotal: finalMemory.heapTotal - initialMemory.heapTotal,
        external: finalMemory.external - initialMemory.external,
        arrayBuffers: finalMemory.arrayBuffers - initialMemory.arrayBuffers
      },
      cpuUsage: finalCpu
    }

    return {
      config,
      metrics,
      timeline: results,
      errors
    }
  }

  /**
   * Test database performance under load
   */
  async testDatabasePerformance(config: {
    operations: Array<'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE'>
    concurrency: number
    duration: number
  }): Promise<{
    operationMetrics: Record<string, PerformanceMetrics>
    overallMetrics: PerformanceMetrics
  }> {
    const { operations, concurrency, duration } = config
    const operationResults: Record<string, LoadTestResult> = {}

    // Test each operation type
    for (const operation of operations) {
      const endpoint = this.getEndpointForOperation(operation)
      const method = this.getMethodForOperation(operation)
      const payload = this.getPayloadForOperation(operation)

      const token = jwt.sign(
        { email: 'perf@example.com', role: 'user' },
        securityConfig.jwt.secret,
        { expiresIn: '1h' }
      )

      operationResults[operation] = await this.runLoadTest({
        endpoint,
        method,
        payload,
        headers: { 'Authorization': `Bearer ${token}` },
        concurrency: Math.floor(concurrency / operations.length),
        duration: duration / operations.length
      })
    }

    // Calculate overall metrics
    const allResults = Object.values(operationResults)
    const totalRequests = allResults.reduce((sum, result) => sum + result.metrics.totalRequests, 0)
    const totalSuccess = allResults.reduce((sum, result) => sum + result.metrics.successfulRequests, 0)
    const allResponseTimes = allResults.flatMap(result => 
      result.timeline.map(t => t.responseTime)
    ).sort((a, b) => a - b)

    const overallMetrics: PerformanceMetrics = {
      requestsPerSecond: allResults.reduce((sum, result) => sum + result.metrics.requestsPerSecond, 0),
      averageResponseTime: allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length || 0,
      minResponseTime: Math.min(...allResults.map(r => r.metrics.minResponseTime)),
      maxResponseTime: Math.max(...allResults.map(r => r.metrics.maxResponseTime)),
      p95ResponseTime: allResponseTimes[Math.floor(allResponseTimes.length * 0.95)] || 0,
      p99ResponseTime: allResponseTimes[Math.floor(allResponseTimes.length * 0.99)] || 0,
      totalRequests,
      successfulRequests: totalSuccess,
      failedRequests: totalRequests - totalSuccess,
      errorRate: totalRequests > 0 ? (totalRequests - totalSuccess) / totalRequests : 0,
      memoryUsage: allResults[0]?.metrics.memoryUsage || {} as NodeJS.MemoryUsage,
      cpuUsage: allResults[0]?.metrics.cpuUsage || {} as NodeJS.CpuUsage
    }

    return {
      operationMetrics: Object.fromEntries(
        Object.entries(operationResults).map(([op, result]) => [op, result.metrics])
      ),
      overallMetrics
    }
  }

  /**
   * Test memory usage patterns
   */
  async testMemoryUsage(config: {
    endpoint: string
    requestCount: number
    batchSize?: number
    delayBetweenBatches?: number
  }): Promise<{
    memoryGrowth: number[]
    heapGrowth: number[]
    gcEvents: number
    peakMemory: number
    memoryLeaks: boolean
  }> {
    const { endpoint, requestCount, batchSize = 10, delayBetweenBatches = 100 } = config
    const memorySnapshots: number[] = []
    const heapSnapshots: number[] = []
    let gcEvents = 0

    // Monitor GC events
    const originalGc = global.gc
    if (originalGc) {
      global.gc = () => {
        gcEvents++
        return originalGc()
      }
    }

    const token = jwt.sign(
      { email: 'memory@example.com', role: 'user' },
      securityConfig.jwt.secret,
      { expiresIn: '1h' }
    )

    // Take initial memory snapshot
    memorySnapshots.push(process.memoryUsage().heapUsed)
    heapSnapshots.push(process.memoryUsage().heapTotal)

    // Execute requests in batches
    for (let i = 0; i < requestCount; i += batchSize) {
      const batchPromises = []
      
      for (let j = 0; j < Math.min(batchSize, requestCount - i); j++) {
        batchPromises.push(
          request(this.app)
            .get(endpoint)
            .set('Authorization', `Bearer ${token}`)
        )
      }

      await Promise.all(batchPromises)
      
      // Take memory snapshot
      memorySnapshots.push(process.memoryUsage().heapUsed)
      heapSnapshots.push(process.memoryUsage().heapTotal)
      
      if (delayBetweenBatches > 0) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches))
      }
    }

    // Restore original GC
    if (originalGc) {
      global.gc = originalGc
    }

    const memoryGrowth = memorySnapshots.map((snapshot, index) => 
      index === 0 ? 0 : snapshot - memorySnapshots[0]
    )

    const heapGrowth = heapSnapshots.map((snapshot, index) => 
      index === 0 ? 0 : snapshot - heapSnapshots[0]
    )

    const peakMemory = Math.max(...memorySnapshots)
    
    // Simple memory leak detection: if final memory is significantly higher than initial
    const memoryLeaks = memoryGrowth[memoryGrowth.length - 1] > (memorySnapshots[0] * 0.5)

    return {
      memoryGrowth,
      heapGrowth,
      gcEvents,
      peakMemory,
      memoryLeaks
    }
  }

  /**
   * Stress test with increasing load
   */
  async stressTest(config: {
    endpoint: string
    startConcurrency: number
    maxConcurrency: number
    step: number
    durationPerStep: number
  }): Promise<{
    breakingPoint: number | null
    results: Array<{ concurrency: number; metrics: PerformanceMetrics }>
  }> {
    const { endpoint, startConcurrency, maxConcurrency, step, durationPerStep } = config
    const results: Array<{ concurrency: number; metrics: PerformanceMetrics }> = []
    let breakingPoint: number | null = null

    const token = jwt.sign(
      { email: 'stress@example.com', role: 'user' },
      securityConfig.jwt.secret,
      { expiresIn: '1h' }
    )

    for (let concurrency = startConcurrency; concurrency <= maxConcurrency; concurrency += step) {
      const loadTestResult = await this.runLoadTest({
        endpoint,
        concurrency,
        duration: durationPerStep,
        headers: { 'Authorization': `Bearer ${token}` }
      })

      results.push({
        concurrency,
        metrics: loadTestResult.metrics
      })

      // Check if we've hit the breaking point
      if (loadTestResult.metrics.errorRate > 0.1 || // 10% error rate
          loadTestResult.metrics.p95ResponseTime > 5000) { // 5 second P95
        breakingPoint = concurrency
        break
      }
    }

    return { breakingPoint, results }
  }

  /**
   * WebSocket performance testing
   */
  async testWebSocketPerformance(config: {
    concurrentConnections: number
    messagesPerConnection: number
    messageInterval: number
  }): Promise<{
    connectionsEstablished: number
    totalMessages: number
    averageLatency: number
    messageRate: number
    errors: number
  }> {
    // This would require the WebSocket test helper
    // Implementation would be similar to the WebSocketTestHelper.performanceTest
    // For now, return a placeholder
    return {
      connectionsEstablished: 0,
      totalMessages: 0,
      averageLatency: 0,
      messageRate: 0,
      errors: 0
    }
  }

  /**
   * Generate performance report
   */
  generateReport(results: LoadTestResult[]): string {
    let report = '# Performance Test Report\n\n'
    
    results.forEach((result, index) => {
      const { config, metrics } = result
      
      report += `## Test ${index + 1}: ${config.method} ${config.endpoint}\n\n`
      report += `**Configuration:**\n`
      report += `- Concurrency: ${config.concurrency}\n`
      report += `- Duration: ${config.duration}s\n\n`
      
      report += `**Metrics:**\n`
      report += `- Requests/sec: ${metrics.requestsPerSecond.toFixed(2)}\n`
      report += `- Avg Response Time: ${metrics.averageResponseTime.toFixed(2)}ms\n`
      report += `- P95 Response Time: ${metrics.p95ResponseTime.toFixed(2)}ms\n`
      report += `- P99 Response Time: ${metrics.p99ResponseTime.toFixed(2)}ms\n`
      report += `- Success Rate: ${((1 - metrics.errorRate) * 100).toFixed(2)}%\n`
      report += `- Total Requests: ${metrics.totalRequests}\n\n`
      
      if (result.errors.length > 0) {
        report += `**Errors (${result.errors.length}):**\n`
        result.errors.slice(0, 5).forEach(error => {
          report += `- ${error.error}\n`
        })
        if (result.errors.length > 5) {
          report += `- ... and ${result.errors.length - 5} more\n`
        }
        report += '\n'
      }
    })
    
    return report
  }

  private getEndpointForOperation(operation: string): string {
    switch (operation) {
      case 'SELECT': return '/api/projects'
      case 'INSERT': return '/api/projects'
      case 'UPDATE': return '/api/projects/test-id'
      case 'DELETE': return '/api/projects/test-id'
      default: return '/api/projects'
    }
  }

  private getMethodForOperation(operation: string): 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' {
    switch (operation) {
      case 'SELECT': return 'GET'
      case 'INSERT': return 'POST'
      case 'UPDATE': return 'PUT'
      case 'DELETE': return 'DELETE'
      default: return 'GET'
    }
  }

  private getPayloadForOperation(operation: string): any {
    switch (operation) {
      case 'INSERT': return { name: 'Perf Test Project', status: 'todo' }
      case 'UPDATE': return { name: 'Updated Perf Test Project' }
      default: return undefined
    }
  }
}

/**
 * Performance test setup helper
 */
export function setupPerformanceTest(app: Express) {
  const perfHelper = new PerformanceTestHelper(app)

  return {
    get helper() { return perfHelper },
    
    async quickLoadTest(endpoint: string, duration = 10, concurrency = 5) {
      return perfHelper.runLoadTest({
        endpoint,
        duration,
        concurrency
      })
    },
    
    async authenticatedLoadTest(endpoint: string, duration = 10, concurrency = 5) {
      const token = jwt.sign(
        { email: 'perf@example.com', role: 'user' },
        securityConfig.jwt.secret,
        { expiresIn: '1h' }
      )
      
      return perfHelper.runLoadTest({
        endpoint,
        duration,
        concurrency,
        headers: { 'Authorization': `Bearer ${token}` }
      })
    }
  }
}
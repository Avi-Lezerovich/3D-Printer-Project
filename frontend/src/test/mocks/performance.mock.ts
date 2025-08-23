/**
 * Performance testing utilities
 * Provides tools for testing real-time updates and 3D rendering performance
 */

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  frameRate: number
  averageFrameTime: number
  memoryUsage: number
  renderTime: number
  updateTime: number
  totalTime: number
}

/**
 * Performance benchmark results
 */
export interface BenchmarkResult {
  name: string
  metrics: PerformanceMetrics
  passed: boolean
  thresholds: PerformanceThresholds
}

/**
 * Performance thresholds for testing
 */
export interface PerformanceThresholds {
  minFrameRate: number
  maxFrameTime: number
  maxMemoryUsage: number
  maxRenderTime: number
}

/**
 * Performance testing utilities
 */
export class PerformanceTestUtils {
  private static performanceObserver: PerformanceObserver | null = null
  private static metrics: PerformanceMetrics[] = []
  
  /**
   * Start performance monitoring
   */
  static startMonitoring() {
    this.metrics = []
    
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          if (entry.entryType === 'measure') {
            this.recordMetric(entry.name, entry.duration)
          }
        })
      })
      
      this.performanceObserver.observe({ 
        entryTypes: ['measure', 'navigation', 'resource'] 
      })
    }
  }
  
  /**
   * Stop performance monitoring
   */
  static stopMonitoring(): PerformanceMetrics {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect()
      this.performanceObserver = null
    }
    
    return this.calculateAverageMetrics()
  }
  
  /**
   * Record a performance metric
   */
  static recordMetric(name: string, duration: number) {
    const metric: Partial<PerformanceMetrics> = {}
    
    switch (name) {
      case 'frame-render':
        metric.renderTime = duration
        break
      case 'component-update':
        metric.updateTime = duration
        break
      default:
        metric.totalTime = duration
        break
    }
    
    // Calculate frame rate based on duration
    if (duration > 0) {
      metric.frameRate = 1000 / duration // Convert to FPS
      metric.averageFrameTime = duration
    }
    
    // Estimate memory usage (simplified)
    if (performance.memory) {
      metric.memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024 // MB
    }
    
    this.metrics.push(metric as PerformanceMetrics)
  }
  
  /**
   * Calculate average metrics
   */
  private static calculateAverageMetrics(): PerformanceMetrics {
    if (this.metrics.length === 0) {
      return {
        frameRate: 60,
        averageFrameTime: 16.67,
        memoryUsage: 0,
        renderTime: 0,
        updateTime: 0,
        totalTime: 0
      }
    }
    
    const sum = this.metrics.reduce((acc, metric) => {
      Object.keys(metric).forEach(key => {
        const k = key as keyof PerformanceMetrics
        acc[k] = (acc[k] || 0) + metric[k]
      })
      return acc
    }, {} as PerformanceMetrics)
    
    const avg = {} as PerformanceMetrics
    Object.keys(sum).forEach(key => {
      const k = key as keyof PerformanceMetrics
      avg[k] = sum[k] / this.metrics.length
    })
    
    return avg
  }
  
  /**
   * Benchmark a function's performance
   */
  static async benchmark(
    name: string,
    fn: () => Promise<void> | void,
    thresholds: PerformanceThresholds
  ): Promise<BenchmarkResult> {
    const startTime = performance.now()
    
    performance.mark(`${name}-start`)
    
    await fn()
    
    performance.mark(`${name}-end`)
    performance.measure(name, `${name}-start`, `${name}-end`)
    
    const endTime = performance.now()
    const duration = endTime - startTime
    
    const metrics: PerformanceMetrics = {
      frameRate: duration > 0 ? 1000 / duration : 60,
      averageFrameTime: duration,
      renderTime: duration,
      updateTime: 0,
      totalTime: duration,
      memoryUsage: performance.memory ? 
        performance.memory.usedJSHeapSize / 1024 / 1024 : 0
    }
    
    const passed = this.evaluatePerformance(metrics, thresholds)
    
    return {
      name,
      metrics,
      passed,
      thresholds
    }
  }
  
  /**
   * Evaluate performance against thresholds
   */
  private static evaluatePerformance(
    metrics: PerformanceMetrics,
    thresholds: PerformanceThresholds
  ): boolean {
    return (
      metrics.frameRate >= thresholds.minFrameRate &&
      metrics.averageFrameTime <= thresholds.maxFrameTime &&
      metrics.memoryUsage <= thresholds.maxMemoryUsage &&
      metrics.renderTime <= thresholds.maxRenderTime
    )
  }
  
  /**
   * Create performance test assertions
   */
  static createPerformanceAssertions(result: BenchmarkResult) {
    return {
      toMeetFrameRateThreshold: () => {
        expect(result.metrics.frameRate).toBeGreaterThanOrEqual(
          result.thresholds.minFrameRate
        )
      },
      
      toMeetFrameTimeThreshold: () => {
        expect(result.metrics.averageFrameTime).toBeLessThanOrEqual(
          result.thresholds.maxFrameTime
        )
      },
      
      toMeetMemoryThreshold: () => {
        expect(result.metrics.memoryUsage).toBeLessThanOrEqual(
          result.thresholds.maxMemoryUsage
        )
      },
      
      toMeetRenderTimeThreshold: () => {
        expect(result.metrics.renderTime).toBeLessThanOrEqual(
          result.thresholds.maxRenderTime
        )
      },
      
      toPassAllThresholds: () => {
        expect(result.passed).toBe(true)
      }
    }
  }
}

/**
 * Real-time performance testing utilities
 */
export class RealTimeTestUtils {
  private static connectionLatencies: number[] = []
  private static updateFrequencies: number[] = []
  private static lastUpdateTime = 0
  
  /**
   * Measure WebSocket connection latency
   */
  static measureConnectionLatency(socket: any): Promise<number> {
    return new Promise((resolve) => {
      const startTime = performance.now()
      
      socket.emit('ping', { timestamp: startTime })
      
      socket.on('pong', (data: { timestamp: number }) => {
        const latency = performance.now() - data.timestamp
        this.connectionLatencies.push(latency)
        resolve(latency)
      })
    })
  }
  
  /**
   * Track real-time update frequency
   */
  static trackUpdateFrequency() {
    const currentTime = performance.now()
    
    if (this.lastUpdateTime > 0) {
      const frequency = 1000 / (currentTime - this.lastUpdateTime) // Updates per second
      this.updateFrequencies.push(frequency)
    }
    
    this.lastUpdateTime = currentTime
  }
  
  /**
   * Get real-time performance metrics
   */
  static getRealTimeMetrics() {
    const avgLatency = this.connectionLatencies.length > 0 ?
      this.connectionLatencies.reduce((a, b) => a + b, 0) / this.connectionLatencies.length : 0
    
    const avgUpdateFreq = this.updateFrequencies.length > 0 ?
      this.updateFrequencies.reduce((a, b) => a + b, 0) / this.updateFrequencies.length : 0
    
    return {
      averageLatency: avgLatency,
      maxLatency: Math.max(...this.connectionLatencies, 0),
      minLatency: Math.min(...this.connectionLatencies, 0),
      averageUpdateFrequency: avgUpdateFreq,
      updateCount: this.updateFrequencies.length
    }
  }
  
  /**
   * Reset real-time metrics
   */
  static resetMetrics() {
    this.connectionLatencies = []
    this.updateFrequencies = []
    this.lastUpdateTime = 0
  }
  
  /**
   * Create real-time performance test
   */
  static async testRealTimePerformance(
    socket: any,
    duration: number = 5000, // 5 seconds
    expectedUpdateFreq: number = 10 // 10 updates per second
  ) {
    this.resetMetrics()
    
    // Measure initial latency
    const initialLatency = await this.measureConnectionLatency(socket)
    
    // Track updates for specified duration
    const startTime = performance.now()
    let updateCount = 0
    
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        this.trackUpdateFrequency()
        updateCount++
        
        const elapsed = performance.now() - startTime
        if (elapsed >= duration) {
          clearInterval(interval)
          
          const metrics = this.getRealTimeMetrics()
          const actualUpdateFreq = updateCount / (duration / 1000)
          
          resolve({
            ...metrics,
            initialLatency,
            actualUpdateFrequency: actualUpdateFreq,
            meetsFrequencyExpectation: actualUpdateFreq >= expectedUpdateFreq * 0.9, // 10% tolerance
            duration: elapsed
          })
        }
      }, 100) // Check every 100ms
    })
  }
}

/**
 * 3D rendering performance test utilities
 */
export class Render3DTestUtils {
  /**
   * Test 3D scene rendering performance
   */
  static async testScenePerformance(
    renderFn: () => void,
    frameCount: number = 60, // Test 60 frames
    targetFps: number = 30
  ) {
    const frameTimes: number[] = []
    let frameIndex = 0
    
    return new Promise((resolve) => {
      const renderFrame = () => {
        const frameStart = performance.now()
        
        renderFn()
        
        const frameEnd = performance.now()
        const frameTime = frameEnd - frameStart
        frameTimes.push(frameTime)
        
        frameIndex++
        
        if (frameIndex < frameCount) {
          requestAnimationFrame(renderFrame)
        } else {
          const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length
          const avgFps = 1000 / avgFrameTime
          const minFps = 1000 / Math.max(...frameTimes)
          const maxFps = 1000 / Math.min(...frameTimes)
          
          resolve({
            averageFrameTime: avgFrameTime,
            averageFps: avgFps,
            minFps,
            maxFps,
            frameCount,
            meetsTargetFps: avgFps >= targetFps,
            frameTimeVariance: Math.max(...frameTimes) - Math.min(...frameTimes)
          })
        }
      }
      
      requestAnimationFrame(renderFrame)
    })
  }
  
  /**
   * Test animation performance
   */
  static async testAnimationPerformance(
    animationFn: (progress: number) => void,
    duration: number = 2000 // 2 seconds
  ) {
    const startTime = performance.now()
    const frameTimes: number[] = []
    
    return new Promise((resolve) => {
      const animate = () => {
        const frameStart = performance.now()
        const elapsed = frameStart - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        animationFn(progress)
        
        const frameEnd = performance.now()
        frameTimes.push(frameEnd - frameStart)
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length
          const totalFrames = frameTimes.length
          const actualFps = totalFrames / (duration / 1000)
          
          resolve({
            totalFrames,
            averageFrameTime: avgFrameTime,
            actualFps,
            duration: performance.now() - startTime,
            smoothAnimation: avgFrameTime < 20 // Less than 20ms per frame
          })
        }
      }
      
      requestAnimationFrame(animate)
    })
  }
}

/**
 * Default performance thresholds for different scenarios
 */
export const performanceThresholds = {
  // 3D rendering thresholds
  rendering3D: {
    minFrameRate: 30,
    maxFrameTime: 33.33, // 30 FPS = 33.33ms per frame
    maxMemoryUsage: 100, // 100 MB
    maxRenderTime: 16.67 // Target 60 FPS
  },
  
  // Real-time updates thresholds
  realTimeUpdates: {
    minFrameRate: 10, // 10 updates per second
    maxFrameTime: 100, // 100ms per update
    maxMemoryUsage: 50, // 50 MB
    maxRenderTime: 50
  },
  
  // Component updates thresholds
  componentUpdates: {
    minFrameRate: 60,
    maxFrameTime: 16.67,
    maxMemoryUsage: 25, // 25 MB
    maxRenderTime: 10
  }
}
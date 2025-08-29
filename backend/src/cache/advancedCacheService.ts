import { createClient } from 'redis'
import { logger } from '../utils/logger.js'
import zlib from 'zlib'

interface CacheOptions {
  ttl: number
  compress?: boolean
  circuit?: boolean
}

interface CircuitBreakerState {
  failures: number
  isOpen: boolean
  nextRetry: number
}

export class AdvancedCacheService {
  private client: ReturnType<typeof createClient> | null = null
  private circuitBreaker: CircuitBreakerState = { failures: 0, isOpen: false, nextRetry: 0 }
  private readonly CIRCUIT_THRESHOLD = 5
  private readonly CIRCUIT_TIMEOUT = 30000
  private readonly COMPRESSION_THRESHOLD = 1024
  private isConnected = false

  async connect(): Promise<void> {
    if (this.client) return

    try {
      const url = process.env.REDIS_URL || 'redis://127.0.0.1:6379'
      this.client = createClient({ url })
      
      this.client.on('error', (err) => {
        logger.error({ err }, 'Advanced Redis client error')
        this.recordFailure()
      })
      
      this.client.on('connect', () => {
        logger.info('Advanced Redis connecting')
      })
      
      this.client.on('ready', () => {
        this.isConnected = true
        this.resetCircuit()
        logger.info('Advanced Redis ready')
      })
      
      this.client.on('end', () => {
        this.isConnected = false
        logger.warn('Advanced Redis connection closed')
      })

      await this.client.connect()
    } catch (error) {
      logger.error({ error }, 'Failed to connect to Advanced Redis')
      this.recordFailure()
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.isCircuitOpen() || !this.isConnected || !this.client) {
      return null
    }
    
    try {
      const start = Date.now()
      const raw = await this.client.get(key)
      const duration = Date.now() - start
      
      if (!raw) {
        logger.debug({ key, duration }, 'Cache miss')
        return null
      }
      
      let data = raw
      if (raw.startsWith('gzip:')) {
        const compressed = Buffer.from(raw.slice(5), 'base64')
        data = zlib.gunzipSync(compressed).toString()
      }
      
      this.resetCircuit()
      logger.debug({ key, duration, compressed: raw.startsWith('gzip:') }, 'Cache hit')
      return JSON.parse(data)
    } catch (error) {
      logger.warn({ error, key }, 'Cache get failed')
      this.recordFailure()
      return null
    }
  }

  async set(key: string, value: any, options: CacheOptions): Promise<void> {
    if (this.isCircuitOpen() || !this.isConnected || !this.client) {
      return
    }
    
    try {
      const start = Date.now()
      let data = JSON.stringify(value)
      let compressed = false
      
      if (options.compress !== false && data.length > this.COMPRESSION_THRESHOLD) {
        const compressedData = zlib.gzipSync(data)
        if (compressedData.length < data.length * 0.8) { // Only use if 20%+ compression
          data = 'gzip:' + compressedData.toString('base64')
          compressed = true
        }
      }
      
      await this.client.setEx(key, options.ttl, data)
      const duration = Date.now() - start
      
      this.resetCircuit()
      logger.debug({ key, ttl: options.ttl, duration, compressed, size: data.length }, 'Cache set')
    } catch (error) {
      logger.warn({ error, key }, 'Cache set failed')
      this.recordFailure()
    }
  }

  async mget(keys: string[]): Promise<Record<string, any>> {
    if (this.isCircuitOpen() || !this.isConnected || !this.client || keys.length === 0) {
      return {}
    }
    
    try {
      const start = Date.now()
      const values = await this.client.mGet(keys)
      const result: Record<string, any> = {}
      let hits = 0
      
      keys.forEach((key, index) => {
        const raw = values[index]
        if (raw) {
          try {
            let data = raw
            if (raw.startsWith('gzip:')) {
              const compressed = Buffer.from(raw.slice(5), 'base64')
              data = zlib.gunzipSync(compressed).toString()
            }
            result[key] = JSON.parse(data)
            hits++
          } catch (error) {
            logger.warn({ error, key }, 'Failed to parse cached value')
          }
        }
      })
      
      const duration = Date.now() - start
      const hitRate = (hits / keys.length) * 100
      logger.debug({ keys: keys.length, hits, hitRate, duration }, 'Batch cache get')
      
      this.resetCircuit()
      return result
    } catch (error) {
      logger.warn({ error, keys: keys.length }, 'Batch cache get failed')
      this.recordFailure()
      return {}
    }
  }

  async del(keys: string | string[]): Promise<number> {
    if (this.isCircuitOpen() || !this.isConnected || !this.client) {
      return 0
    }
    
    try {
      const keysArray = Array.isArray(keys) ? keys : [keys]
      const deleted = await this.client.del(keysArray)
      logger.debug({ keys: keysArray.length, deleted }, 'Cache delete')
      this.resetCircuit()
      return deleted
    } catch (error) {
      logger.warn({ error, keys }, 'Cache delete failed')
      this.recordFailure()
      return 0
    }
  }

  async exists(key: string): Promise<boolean> {
    if (this.isCircuitOpen() || !this.isConnected || !this.client) {
      return false
    }
    
    try {
      const exists = await this.client.exists(key)
      this.resetCircuit()
      return exists > 0
    } catch (error) {
      logger.warn({ error, key }, 'Cache exists check failed')
      this.recordFailure()
      return false
    }
  }

  async invalidatePattern(pattern: string): Promise<number> {
    if (this.isCircuitOpen() || !this.isConnected || !this.client) {
      return 0
    }
    
    try {
      const keys: string[] = []
      for await (const key of this.client.scanIterator({ MATCH: pattern })) {
        keys.push(key)
      }
      
      if (keys.length > 0) {
        const deleted = await this.client.del(keys)
        logger.debug({ pattern, keys: keys.length, deleted }, 'Pattern invalidation')
        return deleted
      }
      
      return 0
    } catch (error) {
      logger.warn({ error, pattern }, 'Pattern invalidation failed')
      this.recordFailure()
      return 0
    }
  }

  private isCircuitOpen(): boolean {
    if (this.circuitBreaker.isOpen && Date.now() > this.circuitBreaker.nextRetry) {
      this.circuitBreaker.isOpen = false
      this.circuitBreaker.failures = 0
      logger.info('Redis circuit breaker reset to closed')
    }
    return this.circuitBreaker.isOpen
  }

  private recordFailure(): void {
    this.circuitBreaker.failures++
    if (this.circuitBreaker.failures >= this.CIRCUIT_THRESHOLD) {
      this.circuitBreaker.isOpen = true
      this.circuitBreaker.nextRetry = Date.now() + this.CIRCUIT_TIMEOUT
      logger.warn({ 
        failures: this.circuitBreaker.failures,
        nextRetry: new Date(this.circuitBreaker.nextRetry).toISOString()
      }, 'Redis circuit breaker opened')
    }
  }

  private resetCircuit(): void {
    if (this.circuitBreaker.failures > 0) {
      this.circuitBreaker.failures = 0
      logger.debug('Redis circuit breaker reset')
    }
  }

  getStats() {
    return {
      connected: this.isConnected,
      circuitBreaker: {
        isOpen: this.circuitBreaker.isOpen,
        failures: this.circuitBreaker.failures,
        nextRetry: this.circuitBreaker.nextRetry
      }
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit()
      this.client = null
      this.isConnected = false
      logger.info('Advanced Redis disconnected')
    }
  }
}

export const advancedCache = new AdvancedCacheService()
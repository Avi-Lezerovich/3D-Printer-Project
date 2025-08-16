import { createClient } from 'redis'
import { logger } from '../utils/logger.js'

export interface RedisWrapper {
  client: ReturnType<typeof createClient> | null
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => Promise<void>
}

const url = process.env.REDIS_URL || 'redis://127.0.0.1:6379'

const redisWrapper: RedisWrapper = {
  client: null,
  isConnected: false,
  async connect() {
    if (this.client) return
    const client = createClient({ url })
    client.on('error', (err) => logger.error({ err }, 'Redis client error'))
    client.on('connect', () => logger.info({ url }, 'Redis connecting'))
    client.on('ready', () => { this.isConnected = true; logger.info('Redis ready') })
    client.on('end', () => { this.isConnected = false; logger.warn('Redis connection closed') })
    await client.connect()
    this.client = client
  },
  async disconnect() {
    if (!this.client) return
    await this.client.quit()
    this.client = null
    this.isConnected = false
  }
}

export default redisWrapper

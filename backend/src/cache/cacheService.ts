import redisWrapper from './redisClient.js'
import { logger } from '../utils/logger.js'

// Basic cache abstraction with in-memory fallback if Redis unavailable
const memoryCache = new Map<string, { value: any; expiresAt: number }>()

function now() { return Date.now() }

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (redisWrapper.isConnected && redisWrapper.client) {
    const raw = await redisWrapper.client.get(key)
    if (!raw) return null
    try { return JSON.parse(raw) as T } catch { return null }
  }
  const entry = memoryCache.get(key)
  if (!entry) return null
  if (entry.expiresAt < now()) { memoryCache.delete(key); return null }
  return entry.value as T
}

export async function cacheSet(key: string, value: any, ttlSeconds: number) {
  if (redisWrapper.isConnected && redisWrapper.client) {
    await redisWrapper.client.set(key, JSON.stringify(value), { EX: ttlSeconds })
    return
  }
  memoryCache.set(key, { value, expiresAt: now() + ttlSeconds * 1000 })
}

export async function cacheDelete(key: string) {
  if (redisWrapper.isConnected && redisWrapper.client) {
    await redisWrapper.client.del(key)
    return
  }
  memoryCache.delete(key)
}

// Scheduled memory cleanup (noop for Redis)
setInterval(() => {
  const t = now()
  for (const [k,v] of memoryCache.entries()) {
    if (v.expiresAt < t) memoryCache.delete(k)
  }
}, 60_000).unref()

export async function withCache<T>(key: string, ttlSeconds: number, producer: () => Promise<T>): Promise<T> {
  const cached = await cacheGet<T>(key)
  if (cached !== null) return cached
  const value = await producer()
  await cacheSet(key, value, ttlSeconds)
  return value
}

export function cacheStats() {
  return { memoryEntries: memoryCache.size, redis: redisWrapper.isConnected }
}

export async function initCache() {
  if (!process.env.REDIS_URL) {
    logger.debug?.('REDIS_URL not set; skipping Redis connection (memory cache only)')
    return
  }
  try {
    await redisWrapper.connect()
  } catch (e) {
    logger.warn({ err: e }, 'Redis connection failed, using in-memory cache only')
  }
}

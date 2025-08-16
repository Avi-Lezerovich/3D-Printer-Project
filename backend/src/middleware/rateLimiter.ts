import rateLimit from 'express-rate-limit'
import { createClient } from 'redis'
import { logger } from '../utils/logger.js'

// Placeholder for Redis-based store; currently falling back to in-memory express-rate-limit.
// Could be extended with a more robust algorithm or library. This is a sketch to iterate on.

export function basicRateLimiter(windowMs: number, max: number) {
  return rateLimit({ windowMs, max, standardHeaders: 'draft-7', legacyHeaders: false })
}

// Sliding window limiter using Redis sorted sets (best-effort). If Redis unavailable, it no-ops allowing traffic.
export function redisSlidingWindowLimiter(opts: { keyPrefix?: string; windowMs: number; max: number; redisUrl?: string; }) {
  const { windowMs, max } = opts
  const resolvedUrl = opts.redisUrl || process.env.REDIS_URL
  if (!resolvedUrl) {
    // No Redis configured: return pass-through middleware
    return (_req: any, _res: any, next: any) => next()
  }
  const client = createClient({ url: resolvedUrl })
  const prefix = opts.keyPrefix || 'ratelimit:'
  client.connect().catch(err => logger.warn({ err }, 'Rate limiter Redis connect failed; will noop'))
  return async (req: any, res: any, next: any) => {
    if (!client.isOpen) return next() // fallback skip (could chain default limiter)
    try {
      const key = prefix + (req.ip || 'unknown')
      const now = Date.now()
      const windowStart = now - windowMs
      await client.zRemRangeByScore(key, 0, windowStart)
      const count = await client.zCard(key)
      if (count >= max) {
        res.status(429).json({ message: 'Too Many Requests' })
        return
      }
      const multi = client.multi()
      multi.zAdd(key, [{ score: now, value: String(now) }])
  // Expire key slightly longer than window to avoid early purge race
  multi.pExpire(key, windowMs)
      await multi.exec()
      res.setHeader('X-RateLimit-Limit', String(max))
      res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - count - 1)))
    } catch (e) {
      logger.debug({ err: e }, 'redisSlidingWindowLimiter error; allowing request')
    }
    next()
  }
}

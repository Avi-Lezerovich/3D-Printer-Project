import { logger } from '../utils/logger.js'
import { env } from '../config/index.js'
import { Repositories } from '../repositories/types.js'

let repos: Repositories | undefined
let cleanupInterval: NodeJS.Timeout | undefined
let lastCleanup = { at: null as string | null, removed: 0 }

export function setBackgroundRepositories(r: Repositories) { repos = r }
export function getCleanupStats() { return lastCleanup }

export function startBackgroundJobs() {
  if (env.NODE_ENV === 'test') return // skip in tests
  const intervalMs = Number(process.env.CLEANUP_INTERVAL_MS || 60 * 60 * 1000)
  if (cleanupInterval) clearInterval(cleanupInterval)
  cleanupInterval = setInterval(async () => {
    try {
      if (!repos) return
      const removed = await repos.users.cleanupExpiredRefreshTokens()
      lastCleanup = { at: new Date().toISOString(), removed }
      if (removed > 0) logger.info({ removed }, 'refresh token cleanup')
    } catch (e) {
      logger.warn({ err: e }, 'cleanup job failed')
    }
  }, intervalMs)
  logger.info({ intervalMs }, 'background jobs scheduled')
}

export function stopBackgroundJobs() {
  if (cleanupInterval) clearInterval(cleanupInterval)
  cleanupInterval = undefined
}

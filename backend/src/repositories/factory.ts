import { createInMemoryRepositories } from './memoryRepositories.js'
import { createPrismaRepositories } from './prismaRepositories.js'
import { env } from '../config/index.js'
import type { Repositories } from './types.js'

export async function initializeRepositories(): Promise<{ repos: Repositories; driver: string }> {
  const driver = env.REPO_DRIVER || 'memory'
  if (driver === 'prisma') {
    try {
      const repos = await createPrismaRepositories()
      return { repos, driver }
    } catch (err) {
      console.warn('[repositories] prisma init failed, falling back to memory:', (err as Error).message)
      const fallback = createInMemoryRepositories()
      return { repos: fallback, driver: 'memory' }
    }
  }
  return { repos: createInMemoryRepositories(), driver: 'memory' }
}

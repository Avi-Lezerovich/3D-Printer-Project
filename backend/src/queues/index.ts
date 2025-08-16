import { featureFlags } from '../config/index.js'
import { logger } from '../utils/logger.js'

export interface QueueJob<T=any> { name: string; payload: T; attempts?: number }

// Minimal in-memory queue placeholder (Phase 2 scaffold)
const queue: QueueJob[] = []
let processing = false
const processors: Record<string, (job: QueueJob)=>Promise<any>|any> = {}

export function registerProcessor(name: string, fn: (job: QueueJob)=>Promise<any>|any) {
  processors[name] = fn
}

export function enqueue(job: QueueJob) {
  if (!featureFlags.queuesEnabled) return false
  queue.push(job)
  processQueue()
  return true
}

function processQueue() {
  if (processing) return
  processing = true
  setImmediate(async () => {
    while (queue.length) {
      const job = queue.shift()!
      try {
  const handler = processors[job.name]
  if (handler) await handler(job)
  else logger.debug({ job: job.name }, 'No processor registered')
      } catch (e) {
        logger.error({ err: e, job: job.name }, 'Job failed')
      }
    }
    processing = false
  })
}

export function queueStats() { return { enabled: featureFlags.queuesEnabled, depth: queue.length } }

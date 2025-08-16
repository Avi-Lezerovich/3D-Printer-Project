import { logger } from '../../utils/logger.js'
import { QueueJob } from '../index.js'

export async function processProjectAudit(job: QueueJob) {
  logger.debug({ job }, 'Processed project audit job (placeholder)')
}

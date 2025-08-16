import type http from 'http'
import { logger } from './utils/logger.js'

interface Closeable { close?: () => Promise<any> | any; disconnect?: () => Promise<any> | any }

export function setupGracefulShutdown(server: http.Server, deps: Closeable[] = []) {
  let shuttingDown = false
  async function shutdown(signal: string) {
    if (shuttingDown) return
    shuttingDown = true
    logger.info({ signal }, 'Shutdown initiated')
    await new Promise<void>(resolve => server.close(() => resolve()))
    for (const dep of deps) {
      try {
        if (typeof dep.disconnect === 'function') await dep.disconnect()
        else if (typeof dep.close === 'function') await dep.close()
      } catch (err) {
        logger.error({ err }, 'Error closing dependency during shutdown')
      }
    }
    logger.info('Shutdown complete')
    process.exit(0)
  }
  ;['SIGINT','SIGTERM'].forEach(sig => process.on(sig, () => void shutdown(sig)))
}

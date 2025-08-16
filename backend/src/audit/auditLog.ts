import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { flagEnabled } from '../config/flags.js'
import { logger } from '../utils/logger.js'

// Basic JSONL audit writer (append-only). Enabled when FLAG_AUDIT=1.
export interface AuditEvent {
  type: string
  version: number
  at: string
  userEmail?: string
  ip?: string
  payload?: any
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const auditDir = path.resolve(__dirname, '../../logs')
const auditFile = path.join(auditDir, 'audit.log')

function ensureDir() {
  try { fs.mkdirSync(auditDir, { recursive: true }) } catch { /* ignore */ }
}

export function writeAuditEvent(ev: AuditEvent) {
  if (!flagEnabled('AUDIT')) return
  try {
    ensureDir()
    fs.appendFile(auditFile, JSON.stringify(ev) + '\n', err => { if (err) logger.warn({ err }, 'audit write failed') })
  } catch (err) {
    logger.warn({ err }, 'audit write exception')
  }
}

export function auditSecurity(type: string, data: Omit<AuditEvent, 'type' | 'version' | 'at'> & { payload?: any }) {
  writeAuditEvent({ type, version: 1, at: new Date().toISOString(), ...data })
}

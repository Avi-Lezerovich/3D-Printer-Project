import crypto from 'node:crypto'
import { securityConfig, isProd } from '../../config/index.js'

// AES-256-GCM helper (Phase 2) for protecting sensitive at-rest values if stored later.
const ALGO = 'aes-256-gcm'

function getKey() {
  const key = securityConfig.encryptionKey
  if (!key || key.length < 32) {
    if (isProd) throw new Error('ENCRYPTION_KEY must be 32+ chars in production')
    return (key || 'dev_key_dev_key_dev_key_dev_key__').slice(0,32)
  }
  return key.slice(0,32)
}

export function encrypt(value: string) {
  const key = Buffer.from(getKey())
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGO, key, iv)
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return Buffer.concat([iv, authTag, ciphertext]).toString('base64')
}

export function decrypt(payload: string) {
  const buf = Buffer.from(payload, 'base64')
  const iv = buf.subarray(0,12)
  const authTag = buf.subarray(12,28)
  const data = buf.subarray(28)
  const key = Buffer.from(getKey())
  const decipher = crypto.createDecipheriv(ALGO, key, iv)
  decipher.setAuthTag(authTag)
  const plain = Buffer.concat([decipher.update(data), decipher.final()])
  return plain.toString('utf8')
}

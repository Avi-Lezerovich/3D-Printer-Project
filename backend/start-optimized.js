#!/usr/bin/env node

/**
 * Optimized startup script for 3D Printer Backend
 * Features:
 * - Advanced Redis caching with compression and circuit breaker
 * - Optimized database connection pooling with read replicas
 * - Background job processing with Bull queue
 * - Enhanced error handling with structured logging
 * - Comprehensive monitoring and health checks
 */

import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Performance-optimized environment variables
const env = {
  ...process.env,
  // Cache optimizations
  REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  CACHE_STRATEGY: 'swr', // Stale-while-revalidate for better performance
  
  // Database optimizations
  DB_POOL_SIZE: process.env.DB_POOL_SIZE || '10',
  DB_TIMEOUT_MS: process.env.DB_TIMEOUT_MS || '5000',
  READ_REPLICA_URLS: process.env.READ_REPLICA_URLS || process.env.DATABASE_URL,
  
  // Job processing optimizations
  CLEANUP_INTERVAL_MS: process.env.CLEANUP_INTERVAL_MS || '3600000', // 1 hour
  
  // Performance settings
  NODE_OPTIONS: '--max-old-space-size=2048 --enable-source-maps',
  UV_THREADPOOL_SIZE: '16', // Increase libuv thread pool
  
  // Logging optimizations
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // Feature flags for performance
  ENABLE_COMPRESSION: 'true',
  ENABLE_CACHING: 'true',
  ENABLE_METRICS: 'true',
  ENABLE_BACKGROUND_JOBS: 'true'
}

console.log('🚀 Starting optimized 3D Printer Backend...')
console.log('📊 Performance features enabled:')
console.log('   ✅ Advanced Redis caching with compression')
console.log('   ✅ Database connection pooling')
console.log('   ✅ Background job processing')
console.log('   ✅ Enhanced error handling')
console.log('   ✅ Comprehensive monitoring')
console.log('')

// Build and start the optimized server
const buildProcess = spawn('npm', ['run', 'build'], {
  cwd: __dirname,
  stdio: 'inherit',
  env
})

buildProcess.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Build failed with code', code)
    process.exit(code)
  }
  
  console.log('✅ Build completed successfully')
  console.log('🔄 Starting optimized server...')
  
  const serverProcess = spawn('node', ['dist/optimizedIndex.js'], {
    cwd: __dirname,
    stdio: 'inherit',
    env
  })
  
  serverProcess.on('close', (code) => {
    console.log('Server exited with code', code)
    process.exit(code)
  })
  
  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...')
    serverProcess.kill('SIGTERM')
  })
  
  process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, shutting down gracefully...')
    serverProcess.kill('SIGINT')
  })
})
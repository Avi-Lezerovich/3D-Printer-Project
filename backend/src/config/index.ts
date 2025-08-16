import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('8080'),
  HOST: z.string().default('0.0.0.0'),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  ALLOWED_ORIGINS: z.string().optional(),
  REPO_DRIVER: z.enum(['memory','prisma']).default('memory').optional(),
  JWT_SECRET: z.string().min(10, 'JWT_SECRET too short').optional(),
  JWT_EXPIRES: z.string().default('1h'),
  REFRESH_TOKEN_EXPIRES: z.string().default('7d'),
  LOG_LEVEL: z.string().default('info'),
  TRUST_PROXY: z.string().default('1'),
  SESSION_SECURE: z.string().optional(),
  COOKIE_DOMAIN: z.string().optional(),
  CSRF_COOKIE_NAME: z.string().optional(),
  COMMIT_SHA: z.string().optional(),
})

const parsed = envSchema.safeParse(process.env)
if (!parsed.success) {
  console.error('❌ Invalid environment configuration:')
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`)
  }
  process.exit(1)
}

export const env = parsed.data

export const allowedOrigins = (env.ALLOWED_ORIGINS || env.CLIENT_URL)
  .split(',')
  .map((s: string) => s.trim())
  .filter(Boolean)

export const isProd = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test'
export const isDev = !isProd && !isTest

export const serverConfig = {
  port: Number(env.PORT),
  host: env.HOST,
  trustProxy: Number(env.TRUST_PROXY || '1'),
}

export const securityConfig = {
  jwt: {
    secret: env.JWT_SECRET || (!isProd ? 'replace_me_dev_only' : ''),
    expiresIn: env.JWT_EXPIRES,
  refreshExpires: env.REFRESH_TOKEN_EXPIRES || '7d'
  },
  sessionSecure: String(env.SESSION_SECURE) === 'true',
  cookieDomain: env.COOKIE_DOMAIN,
  csrfCookieName: env.CSRF_COOKIE_NAME,
}

if (isProd && !securityConfig.jwt.secret) {
  console.error('FATAL: JWT_SECRET must be set in production')
  process.exit(1)
}

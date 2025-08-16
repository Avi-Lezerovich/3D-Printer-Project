import { securityConfig } from './index.js'

export const SESSION_SECURE = securityConfig.sessionSecure
export const COOKIE_DOMAIN = securityConfig.cookieDomain
export const ACCESS_TOKEN_COOKIE = SESSION_SECURE && !COOKIE_DOMAIN ? '__Host-token' : 'token'
export const CSRF_COOKIE_NAME = securityConfig.csrfCookieName || (SESSION_SECURE && !COOKIE_DOMAIN ? '__Host-csrf' : 'csrf_token')

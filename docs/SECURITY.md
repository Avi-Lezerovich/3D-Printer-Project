# Security Overview

This project integrates security-by-design measures aligned with the OWASP Top 10.

Highlights:
- Broken Access Control: JWT auth middleware protects `/api/projects`. Least-privilege roles in token payload (`role`).
- Cryptographic Failures: JWT signed with `JWT_SECRET`. Cookies are `HttpOnly`, `SameSite=Lax`, and `Secure` in production. HSTS enabled.
- Injection: Request validation with `express-validator`; JSON parsing with size limits; no dynamic SQL.
- Insecure Design: CSP via Helmet in production; threat model assumptions noted below; rate limiting; CSRF for state-changing requests.
- Security Misconfiguration: `helmet`, CORS whitelist via `ALLOWED_ORIGINS`, disabled `x-powered-by`, `trust proxy` configurable.
- Vulnerable Components: Use lockfile and update dependencies periodically. Run `npm audit` in CI.
- Identification & Authentication Failures: Strong cookie settings, login rate limiter, `WWW-Authenticate` on 401s, MFA recommended for real users.
- Software & Data Integrity Failures: Avoids eval/inline scripts in production CSP; pinned dependencies via lockfile.
- Logging & Monitoring Failures: `morgan` request logs (non-test). Integrate central logging and alerting in production.
- SSRF: No outbound fetch from server. If added, validate URLs against allowlist.

CSRF
- Cookie-based CSRF token with `__Host-` prefix when possible. State-changing requests require `x-csrf-token` except login/logout.

Headers
- Helmet with CSP, HSTS (prod), frameguard, CORP/COEP disabled for compatibility, referrer-policy no-referrer.
- Permissions-Policy set to disable camera/microphone/geolocation by default.

Configuration
- Critical env vars: `JWT_SECRET` (required in production), `ALLOWED_ORIGINS`, `CLIENT_URL`, `SESSION_SECURE`, `COOKIE_DOMAIN`, `TRUST_PROXY`.

Threat Model Assumptions
- SPA runs on allowed origins only; same-site cookies used for session token; XSS protection via CSP and no inline scripts.

Incident Response
- Central error handler avoids leaking stack in production. Add SIEM/alerts for 4xx/5xx spikes.

## Hardening Checklist
- [x] Rate limiting (global + auth)
- [x] CSRF protection
- [x] Strict cookies with `__Host-` when applicable
- [x] Helmet + CSP
- [x] CORS allowlist
- [x] Input validation
- [x] 404 + central error handler
- [x] Disable x-powered-by

## Reporting
If you discover a vulnerability, please open a private security advisory or contact the maintainer.

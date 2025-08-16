# 3D Printer Project – Documentation Hub

This folder centralizes living documentation: architecture, security, testing strategy, analyses, and improvement roadmap. The system comprises two primary deployable units (frontend SPA & backend API) plus optional data services (Postgres, Redis) orchestrated via Docker.

## 🧱 High-Level Domains

Frontend (React + Vite + TypeScript)
- Portfolio (public showcase / project narrative)
- Control Panel (printer operations & realtime telemetry UI)
- Project Management Hub (tasks, inventory, budget, analytics, timeline)

Backend (Express + TypeScript)
- Auth / Session / JWT issuance & refresh
- Project & task domain services
- Realtime event gateway (Socket.io + optional Redis adapter)
- Caching, rate limiting, CSRF, validation, audit logging
- Pluggable persistence (in-memory baseline, Prisma/Postgres optional)

## 🔐 Separation of Concerns
| Layer | Responsibility | Key Directories |
|-------|----------------|-----------------|
| UI Composition | Presentational + interaction components | `frontend/src/design-system`, `frontend/src/components` |
| Feature Logic | Domain-specific state & orchestrations | `frontend/src/features/*` |
| App Shell | Routing, providers, API typing | `frontend/src/core` |
| Services (Client) | HTTP client, socket bridge, adapters | `frontend/src/services` |
| API Transport | HTTP routing, input validation | `backend/src/routes` |
| Business Logic | Use cases & rules | `backend/src/services` |
| Data Access | Repository interfaces & drivers | `backend/src/repositories` |
| Cross-Cutting | Auth, security, caching, logging | `backend/src/middleware`, `backend/src/cache`, `backend/src/utils` |

No frontend file imports backend code; contract maintained via OpenAPI → generated TypeScript types (see `frontend` script `generate:api`).

## 🚀 Quick Start (Monorepo Root)

```powershell
# Install all workspaces
npm run install:all

# Copy env template (edit values afterward)
Copy-Item deployment/config/.env.example deployment/config/.env

# Dev (concurrent frontend + backend)
npm run dev

# Tests (frontend then backend)
npm test
```

Endpoints:
- Frontend Dev: http://localhost:5173 (or 3000 if configured)
- API: http://localhost:8080  (health: /api/health, spec: /api/v1/spec)

## 🧪 Testing Overview
- Backend: Vitest + Supertest (`backend/src/__tests__`) covering auth, projects, openapi contract, security, sockets.
- Frontend: Vitest + Testing Library (a11y, component, feature interaction tests).
- Coverage: v8 provider; run `npm run test:coverage` for aggregate.

See `TESTING.md` for detailed patterns and roadmap (SAST/DAST suggestions).

## 🔒 Security Highlights
Summarized; full detail in `SECURITY.md`.
- JWT (access + refresh) rotation, short TTL access tokens.
- CSRF tokens for cookie-based state-changing requests.
- Helmet + strict headers (CSP, HSTS prod, referrer, frameguard).
- Rate limiting (global + auth-specific throttling).
- Input validation (express-validator / zod → OpenAPI schema).
- Least-privilege role claims in tokens.

## 🏗️ Backend Architectural Notes
- Repository factory switches between memory and Prisma drivers (`REPO_DRIVER`).
- Event bus abstraction wraps Socket.io enabling alternate transports.
- Background jobs placeholder (`background/jobs.ts`) isolates future schedulers.
- Audit log centralization enables structured compliance trails.

## 🎨 Frontend Architectural Notes
- Feature slices isolate domain UI and state to minimize global stores.
- React Query manages server cache; Zustand reserved for lightweight global ephemeral state.
- Design system ensures consistent tokens (spacing, color, motion durations).
- Framer Motion leveraged for micro-interactions and staged transitions.

## 🐳 Container / Deployment
Authoritative compose + Dockerfiles: `deployment/docker/`.
```powershell
npm run deploy:local:build
npm run deploy:local:up
npm run deploy:local:logs
```
Optional dev-only compose duplicate in `backend/docker-compose.yml` (kept temporarily; prefer removal in future cleanup to avoid drift).

Services (toggle via env):
- backend (Node server)
- frontend (static build served via lightweight web server)
- postgres (Prisma driver)
- redis (cache + socket scaling)

## 🧹 Duplicate / Legacy Artifacts
- `backend/docker-compose.yml` – superseded by `deployment/docker/docker-compose.yml`.
- Root `public/` – currently empty; retained only if a static marketing site or docs export is added; otherwise removable.

## 🔄 Future Improvements (See also IMPROVEMENTS.md)
- Replace in-memory repository usage in production with Prisma by default.
- Introduce metrics endpoint `/metrics` (prom-client) + Grafana dashboard examples.
- Add e2e journey tests (Playwright) for critical flows.
- Refine domain boundaries for analytics vs project management.

## 🧭 Related Documents
- `FINAL_PROJECT_ANALYSIS.md` – Feature completeness & quality assessment
- `IMPROVEMENTS.md` – Portfolio / UX enhancement log
- `SECURITY.md` – Threat model & controls
- `TESTING.md` – Testing layers and roadmap

---
Maintained to reflect actual implementation; update this file alongside structural or architectural changes.

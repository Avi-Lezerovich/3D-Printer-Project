# 3D Printer Project

Full‑stack 3D printer management & project hub. React + Vite + TypeScript frontend, Express + TypeScript backend, real‑time (Socket.io), Redis cache, Postgres (Prisma option), and containerized deployment. Architecture follows clear domain separation guided by the Frontend / Backend Development Deep Dive documents.

## 📁 Updated Monorepo Structure (Workspace)

```
3D-Printer-Project/
│
├── 📁 shared/                      # Shared types & cross-platform utilities
│   ├── src/
│   │   └── types/                 # API contracts, domain models, events
│   ├── package.json
│   └── tsconfig.json
│
├── 📁 frontend/                    # Frontend SPA (React, UI/UX, 3 domains)
│   ├── src/
│   │   ├── design-system/         # Reusable UI primitives (buttons, layout, motion)
│   │   ├── features/              # Feature slices (tasks, inventory, budget, analytics)
│   │   │   └── __tests__/         # Feature-level tests (unit + interaction)
│   │   ├── pages/                 # Route-level components (Portfolio, Control Panel, PM Hub)
│   │   │   └── __tests__/         # Page-level tests (routing, layout)
│   │   ├── core/                  # App shell (routing, providers, query, api types)
│   │   ├── services/              # Client services (api, socket, persistence)
│   │   ├── hooks/                 # Shared hooks
│   │   ├── shared/                # Cross-feature utilities/helpers
│   │   ├── styles/                # Global styles / Tailwind layer extensions
│   │   └── types/                 # Frontend-specific types (UI-only)
│   ├── __tests__/                 # Integration tests (cross-feature)
│   ├── public/                    # Frontend static assets only (served by Vite)
│   ├── package.json               # Frontend workspace manifest
│   └── vite.config.ts             # Build & dev config
│
├── 📁 backend/                     # API / realtime server
│   ├── src/
│   │   ├── routes/                # HTTP route modules (auth, projects, management)
│   │   │   └── __tests__/         # Route handler tests (validation / responses)
│   │   ├── services/              # Business logic (authService, projectService)
│   │   │   └── __tests__/         # Service unit tests (pure logic)
│   │   ├── repositories/          # Data access abstraction (memory + prisma drivers)
│   │   │   └── __tests__/         # Repository contract tests (in-memory)
│   │   ├── middleware/            # Express middleware (auth, rate limit, validation, cache)
│   │   ├── realtime/              # Event bus + Socket.io integration
│   │   ├── cache/                 # Redis client + cache service
│   │   ├── config/                # Runtime flags / security / env config
│   │   ├── audit/                 # Audit logging
│   │   ├── background/            # Scheduled / async jobs
│   │   ├── errors/                # Error classes (AppError)
│   │   ├── utils/                 # Logger and shared helpers
│   │   ├── types/                 # Backend-specific + ambient declarations
│   │   └── openapi.ts             # OpenAPI spec source (zod → schema)
│   ├── prisma/                    # Prisma schema (optional Postgres driver)
│   ├── __tests__/                 # API integration / contract tests
│   ├── dist/                      # Build output (ignored in VCS)
│   ├── package.json               # Backend workspace manifest
│   └── tsconfig.json              # TS build configuration
│
├── 📁 deployment/                  # Deployment & infra (multi-container, prod focus)
│   ├── docker/                    # Canonical docker-compose + Dockerfiles
│   ├── scripts/                   # Cross-platform deploy helpers
│   └── config/                    # Env templates & overrides
│
├── 📁 docs/                        # Architecture, security, testing, analyses
│
├── package.json                   # Root workspace orchestrator (workspaces + scripts)
└── README.md
```

## 🧩 Architectural Highlights

Key separation of concerns:

1. Frontend never imports backend source – all communication via HTTP/WS (OpenAPI generated types via `generate:api`).
2. Repository pattern decouples persistence (in‑memory driver default; Prisma/Postgres optional via `REPO_DRIVER=prisma`).
3. Real‑time events abstracted behind `eventBus` to allow swapping Socket.io with another transport.
4. Feature folders (frontend) isolate domain UI and local state; global state kept lean using React Query + small stores.
5. Config & side‑effects centralized (`backend/src/config`, `frontend/src/core`).
6. OpenAPI spec generated from zod schemas for contract tests.

Cross‑cutting concerns:
- Security: auth middleware, CSRF, rate limiting, Helmet, validation.
- Observability: structured logging (pino), basic metrics (prom-client ready for /metrics exposure).
- Performance: caching layer (Redis) pluggable via middleware.

Duplicate / legacy artifacts:
- `backend/docker-compose.yml` (dev convenience) vs `deployment/docker/docker-compose.yml` (authoritative) – consider removing the former.
✅ Root `public/` folder removed to reduce ambiguity.

See detailed rationales in the Deep Dive PDFs (Frontend / Backend Development Deep Dive).

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd 3D-Printer-Project
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   # Copy templates and customize (never commit secrets)
   cp deployment/config/.env.example .env.local
   # Optional: create environment-specific overrides
   # cp deployment/config/.env.development .env.development
   # cp deployment/config/.env.test .env.test
   # cp deployment/config/.env.production .env.production
   ```

### Development

**Start both frontend and backend in development mode:**
```bash
npm run dev
```

**Or run individually:**
```bash
# Frontend only (http://localhost:3000)
npm run dev:frontend

# Backend only (http://localhost:8080)
npm run dev:backend
```

### Building (CI / Production)

**Build both applications:**
```bash
npm run build
```

**Build individually:**
```bash
npm run build:frontend
npm run build:backend
```

## 🐳 Docker / Containerization

Preferred (multi-container) compose file lives in `deployment/docker`.

```bash
# Build images
npm run deploy:local:build

# Start stack
npm run deploy:local:up

# Tail logs
npm run deploy:local:logs
```

Included services (optional based on env):
- backend (Node 18+ runtime)
- frontend (Nginx‑served static build)
- postgres (if using Prisma driver)
- redis (cache / socket scaling)

## 🧪 Testing & Quality

**Run all tests:**
```bash
npm run test
```

**Run with coverage:**
```bash
npm run test:coverage
```

## 🛠️ Development Scripts (Root)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend in dev mode |
| `npm run build` | Build both applications for production |
| `npm run test` | Run all tests |
| `npm run lint` | Run ESLint on both applications |
| `npm run format` | Format code with Prettier |

## 📚 Features

### Frontend (React + TypeScript)
- 🎨 Modern React with TypeScript
- 🎭 Framer Motion animations
- 🎯 3D visualization with Three.js
- 📊 Interactive charts with Recharts
- 🎨 Responsive design
- 🧪 Component testing with Vitest

### Backend (Express + TypeScript)
- 🔒 JWT authentication
- 🛡️ Security middleware (Helmet, CORS, Rate limiting)
- 📝 Request validation
- 🧪 API testing with Supertest
- 📊 Real-time updates with Socket.io

### Infrastructure / DevOps
- 🐳 Docker containerization
- 🔄 Hot reload for development
- 📦 Optimized production builds
- 🚀 Easy deployment scripts

## 🏗️ Additional Architecture Notes
Shared Types: Import shared contracts via `@3d/shared`. Keep UI-only or persistence-only shapes local to their layer to avoid accidental coupling.
Testing Layers: Co-located `__tests__` for unit / small scope; integration & contract tests in top-level `__tests__` folders per package.

- Contract Testing: Backend OpenAPI schema validated by test suite (`openapi-contract.test.ts`). Frontend can regenerate types via `npm run generate:api` (frontend workspace) to stay in sync.
- Authentication: JWT (short‑lived access + refresh) with rotation; CSRF for cookie flow.
- Rate Limiting: Global + auth endpoints; configurable via env.
- Caching: Opt‑in per route via middleware; strategy currently TTL-based.
- Extensibility: Additional repository drivers can be added by implementing defined interfaces in `repositories/types.ts` and wiring through the factory.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm run test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

MIT – see [LICENSE](LICENSE).

---
Maintained with an emphasis on clarity, testability, and demonstrable full‑stack practices.

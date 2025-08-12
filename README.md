# 3D Printer Project System

Three-part React + Vite TypeScript app:
- Portfolio (public-facing showcase)
- Control Panel (printer management UI)
- Project Management (internal tracking)

## Quick start

1) Copy env and install dependencies

```powershell
Copy-Item .env.example .env
npm install
```

2) Run client + server in dev

```powershell
npm run dev
```

- Client: http://localhost:5173
- API: http://localhost:8080 (health: /api/health)

3) Run tests

```powershell
npm test
```

## Structure
- `src/pages/Portfolio.tsx` — portfolio site sections
- `src/pages/ControlPanel.tsx` — printer dashboard & controls
- `src/pages/ProjectManagement.tsx` — tasks, inventory, budget
- `src/shared/Layout.tsx` — shared shell + navigation
- `src/shared/store.ts` — shared app state (Zustand)
- `src/services/socket.ts` — placeholder for realtime events

## Next steps
- Flesh out portfolio sections with real content, images, and downloads
- Hook Control Panel to your printer backend (OctoPrint/Klipper/Marlin via server)
- Add persistent storage (localStorage or backend API)
- Implement auth and shared settings
- Integrate camera feed and charts

## Security & configuration
- Secrets live in environment variables. Copy `.env.example` to `.env` and set real values for production.
- CSRF protection is enabled via cookie + header for state-changing requests.
- Helmet sets common security headers; adjust CSP if embedding remote assets.
- Rate limiting is enabled on `/api/*`.

## Front-end standards & performance
- Component-based architecture with lazy-loaded routes (React Suspense).
- Mobile-first, responsive CSS with utility classes and media queries.
- Images default to lazy loading via a shared `Image` component.
- Code-splitting configured in `vite.config.ts` for major libraries.
- Consider serving static assets via a CDN with caching headers in production.

## Git workflow
- Use short-lived feature branches (GitHub Flow). Example: `fe-standards-performance`.
- Open pull requests early; keep changes focused and small; squash-merge when ready.

## Docker

Build and run the API container locally:

```powershell
docker compose up --build
```

Then open http://localhost:8080/api/health

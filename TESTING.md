# Testing Strategy

This project uses fast, layered tests to keep quality high without slowing down iteration.

## What we cover
- Unit tests: Pure functions, small React components, and Express handlers in isolation.
- Integration tests: API routes with middleware and error handling using a real Express app instance.
- UI tests (lightweight E2E): Component + router flows with JSDOM using Testing Library.
- Security checks: Static checks via ESLint rules and recommended security headers/middleware; room for SAST/DAST add-ons.

## Tooling
- Test runner: Vitest (Vite-native, fast)
- DOM env: jsdom
- React testing: @testing-library/react + @testing-library/jest-dom
- API testing: supertest against the compiled Express app
- Linting: ESLint (TypeScript, React, a11y)

Config references:
- `vitest.config.ts` sets jsdom, global test APIs, and includes both `src` and `server` tests
- `eslint.config.js` enables strict TypeScript and React rules (e.g., no-explicit-any as warnings)

## Commands
- Lint
  - `npm run lint`
- Tests (unit + integration)
  - `npm test`
- Build (server + client)
  - `npm run build`
- Dev (concurrent client + server)
  - `npm run dev`

## Test locations
- Client: `src/test/**/*.test.tsx` and component/page co-located specs
- Server: `server/__tests__/*.test.ts`

## Adding tests
- Client UI
  - Prefer Testing Library: query by role/text/label.
  - Avoid implementation details; assert visible behavior.
- Server routes
  - Import the Express app (or build it) and use `supertest` for requests.
  - Cover success, validation error (400), unauthorized (401/403), and error (5xx) paths.

## Example patterns already in repo
- Health endpoint: `server/__tests__/health.test.ts`
- Auth and Projects: happy paths + auth failures
- React components: Portfolio and Before/After slider

## Security testing roadmap
- SAST
  - Option A: Integrate `eslint-plugin-security` and `@typescript-eslint/eslint-plugin` security rules.
  - Option B: Add a CI step with CodeQL or Semgrep for deeper code scanning.
- DAST
  - Run the server (`npm start`) and scan with OWASP ZAP or `zap-baseline` in CI.
  - Validate security headers (Helmet), CORS, and CSRF flows.
- Penetration testing
  - Scope and conduct targeted tests on auth, file uploads, rate limits, and sensitive routes.

## Coverage (optional)
- Enable Vitest coverage by adding to `vitest.config.ts`:

```ts
// ...existing config
test: {
  // ...existing options
  coverage: { reporter: ['text', 'lcov'], provider: 'v8' },
},
```

Then run `vitest run --coverage` or set an npm script.

## CI suggestions
- Job order: install → lint → test → build → (optional) coverage upload → (optional) DAST.
- Fail on ESLint errors; keep `no-explicit-any` as warn until types are stabilized.

# Testing Strategy

This project uses fast, layered tests to keep quality high without slowing down iteration.

## What we cover
- **Unit tests**: Pure functions, small React components, hooks, and Express handlers in isolation
- **Integration tests**: API routes with middleware and error handling using a real Express app instance  
- **Component tests**: React components with user interactions, state management, and accessibility
- **Security tests**: Input sanitization, validation middleware, and security boundaries
- **UI tests (lightweight E2E)**: Component + router flows with JSDOM using Testing Library
- **Security checks**: Static checks via ESLint rules and recommended security headers/middleware; room for SAST/DAST add-ons

## Tooling
- **Test runner**: Vitest (Vite-native, fast)
- **DOM env**: jsdom
- **React testing**: @testing-library/react + @testing-library/jest-dom + jest-axe for a11y
- **API testing**: supertest against the compiled Express app
- **Mocking**: Vitest's built-in mocking with vi.mock()
- **Linting**: ESLint (TypeScript, React, a11y)

Config references:
- `vitest.config.ts` sets jsdom, global test APIs, and includes both `src` and `server` tests
- `eslint.config.js` enables strict TypeScript and React rules (e.g., no-explicit-any as warnings)

## Commands
- **Lint**
  - `npm run lint`
- **Tests (unit + integration)**
  - `npm test` - Run all tests
  - `npm run test:coverage` - Run tests with coverage report
  - `npm run test:watch` - Watch mode for development
- **Build (server + client)**
  - `npm run build`
- **Dev (concurrent client + server)**
  - `npm run dev`

## Test locations
- **Frontend**: `src/**/*.{test,spec}.{ts,tsx}` and component/page co-located specs
  - Services: `src/services/__tests__/`
  - Components: `src/components/__tests__/`
  - Hooks: `src/hooks/__tests__/`
  - Features: Feature-specific `__tests__/` directories
  - Integration: `src/__tests__/integration/`
- **Backend**: `src/**/*.{test,spec}.ts`
  - Routes: `src/__tests__/`
  - Middleware: `src/middleware/__tests__/`
  - Security: `src/security/**/__tests__/`
  - Services: `src/services/__tests__/`

## Adding tests

### Frontend (React Components)
- **Prefer Testing Library**: Query by role/text/label, avoid implementation details
- **Assert visible behavior**: Focus on what users see and interact with
- **Mock external dependencies**: Use `vi.mock()` for API calls, external libraries
- **Test accessibility**: Include basic a11y assertions with jest-axe
- **Component structure**:
```tsx
// ComponentName.test.tsx
describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
  
  it('handles user interaction', async () => {
    render(<ComponentName />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Expected result')).toBeInTheDocument();
  });
});
```

### Frontend (Hooks)
- **Use renderHook**: From @testing-library/react for hook testing
- **Test state changes**: Assert hook return values and state updates
- **Mock dependencies**: Mock services and external hooks
```tsx
// useHookName.test.ts
import { renderHook, act } from '@testing-library/react';

describe('useHookName', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useHookName());
    expect(result.current.value).toBe(initialValue);
  });
});
```

### Frontend (Services)
- **Mock external APIs**: Use vi.mock() for fetch, axios, etc.
- **Test error handling**: Ensure proper error states and recovery
- **Test edge cases**: Network failures, timeouts, malformed data
```tsx
// service.test.ts
vi.mock('global-fetch-or-axios');

describe('ServiceName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('handles successful API calls', async () => {
    mockFetch.mockResolvedValue({ data: 'success' });
    const result = await serviceFn();
    expect(result).toEqual({ data: 'success' });
  });
});
```

### Backend (Routes)
- **Import the Express app** (or build it) and use `supertest` for requests
- **Cover all HTTP methods**: GET, POST, PUT, DELETE, PATCH
- **Test status codes**: Success (2xx), validation errors (400), auth failures (401/403), server errors (5xx)
- **Test with/without auth**: Include both authenticated and unauthenticated requests
```ts
// route.test.ts
import request from 'supertest';
import app from '../app';

describe('Route /api/resource', () => {
  it('GET /api/resource returns list', async () => {
    const res = await request(app)
      .get('/api/resource')
      .expect(200);
    expect(res.body).toHaveProperty('data');
  });
  
  it('POST /api/resource creates resource', async () => {
    const res = await request(app)
      .post('/api/resource')
      .send({ name: 'Test' })
      .expect(201);
    expect(res.body.data.name).toBe('Test');
  });
});
```

### Backend (Middleware & Services)
- **Mock dependencies**: Database, external APIs, file system
- **Test middleware flow**: Ensure next() is called appropriately
- **Test error handling**: Validation failures, authorization errors
```ts
// middleware.test.ts
describe('MiddlewareName', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  
  beforeEach(() => {
    mockReq = {};
    mockRes = {};
    mockNext = vi.fn();
  });
  
  it('processes valid input', () => {
    mockReq.body = { valid: 'data' };
    middleware(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith();
  });
});
```

## Example patterns already in repo

### Frontend Tests
- **API Service**: `src/services/__tests__/api.test.ts` - CSRF handling, error responses, network failures
- **Hooks**: `src/hooks/__tests__/useApiWithToasts.test.ts` - Toast notifications, error handling
- **Components**: `src/components/__tests__/ThemeToggle.test.ts` - User interaction, localStorage integration
- **Error Boundaries**: `src/components/__tests__/ErrorBoundary.test.tsx` - Error catching and recovery
- **Accessibility**: `src/__tests__/a11y.test.tsx` - Layout accessibility validation
- **Analytics**: `src/__tests__/projectAnalytics.test.tsx` - Chart rendering with mocked recharts

### Backend Tests  
- **Health endpoint**: `src/__tests__/health.test.ts` - Basic route testing
- **Auth routes**: `src/__tests__/auth.test.ts`, `src/__tests__/auth-more.test.ts` - Authentication flows
- **Projects CRUD**: `src/__tests__/projects.test.ts`, `src/__tests__/projects-more.test.ts` - Full CRUD operations
- **Security**: `src/__tests__/security.test.ts` - Security headers and CSRF protection
- **Validation**: `src/middleware/__tests__/validate.test.ts` - Input validation with Zod schemas
- **Sanitization**: `src/security/sanitization/__tests__/sanitize.test.ts` - Input sanitization and XSS prevention
- **Integration**: `src/__tests__/integration/projects-permissions.test.ts` - Authorization flows

## Testing Best Practices

### General
- **Fast feedback**: Tests should run quickly (< 5 seconds for unit tests)
- **Isolated**: Tests should not depend on each other or external state
- **Deterministic**: Tests should always produce the same results
- **Descriptive names**: Test names should clearly describe what is being tested
- **AAA pattern**: Arrange, Act, Assert structure

### Mocking Strategy
- **Mock external dependencies**: APIs, databases, file system, timers
- **Don't mock what you're testing**: Only mock dependencies, not the code under test  
- **Use realistic mocks**: Mock data should resemble real API responses
- **Reset mocks**: Clear mock state between tests

### Coverage Guidelines
- **Aim for high coverage** without writing unnecessary tests
- **Focus on critical paths**: Authentication, data validation, error handling
- **Test edge cases**: Empty inputs, network failures, boundary conditions
- **Don't chase 100%**: Focus on meaningful test coverage over metrics

## Security testing roadmap
- **SAST (Static Analysis)**
  - Option A: Integrate `eslint-plugin-security` and `@typescript-eslint/eslint-plugin` security rules
  - Option B: Add a CI step with CodeQL or Semgrep for deeper code scanning
- **DAST (Dynamic Analysis)**
  - Run the server (`npm start`) and scan with OWASP ZAP or `zap-baseline` in CI
  - Validate security headers (Helmet), CORS, and CSRF flows
- **Input Validation Testing**
  - Test sanitization functions with malicious inputs
  - Validate Zod schemas against injection attempts
  - Test file upload restrictions and validation
- **Penetration testing**
  - Scope and conduct targeted tests on auth, file uploads, rate limits, and sensitive routes

## Coverage reporting

Enable comprehensive coverage reporting:

### Frontend
```bash
# Run with coverage
npm run test:coverage

# Coverage is already configured in vitest.config.ts
```

### Backend  
```bash
# Run with coverage
npm run test:coverage

# Coverage is already configured in vitest.config.ts
```

Coverage thresholds can be added to enforce minimum coverage:
```ts
// vitest.config.ts
test: {
  coverage: {
    provider: 'v8',
    reporter: ['text', 'lcov', 'html'],
    thresholds: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    }
  }
}
```

## CI suggestions
- **Job order**: install → lint → test → build → (optional) coverage upload → (optional) DAST
- **Fail on ESLint errors**: Keep `no-explicit-any` as warn until types are stabilized
- **Parallel testing**: Run frontend and backend tests in parallel for faster CI
- **Coverage reporting**: Upload coverage to services like Codecov or Coveralls
- **Security scanning**: Integrate SAST/DAST tools in CI pipeline

## Debugging Tests
- **Use describe.only/it.only**: Focus on specific tests during development
- **Console logging**: Add console.log statements in tests (remove before committing)
- **VS Code debugging**: Use built-in debugger with Vitest extension
- **Test isolation**: Run single test files to isolate issues

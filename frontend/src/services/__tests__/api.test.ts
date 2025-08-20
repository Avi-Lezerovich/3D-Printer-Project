import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('API Service', () => {
  let mockFetch: any;
  let originalFetch: any;

  beforeEach(() => {
    // Reset module cache to clear CSRF token cache
    vi.resetModules();
    
    // Store original fetch and create mock
    originalFetch = global.fetch;
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    global.fetch = originalFetch;
  });

  describe('apiFetch', () => {
    it('fetches CSRF token on first request', async () => {
      const { apiFetch } = await import('../api');
      
      // Mock CSRF token request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ csrfToken: 'test-csrf-token' })
      });

      // Mock actual request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: 'test' })
      });

      await apiFetch('/api/test');

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenCalledWith('/api/csrf-token', { credentials: 'include' });
    });

    it('includes CSRF token in non-GET requests', async () => {
      const { apiFetch } = await import('../api');
      
      // Mock CSRF token request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ csrfToken: 'test-csrf-token' })
      });

      // Mock actual request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: 'test' })
      });

      await apiFetch('/api/test', { method: 'POST', body: JSON.stringify({ test: true }) });

      const postCall = mockFetch.mock.calls[1];
      expect(postCall[0]).toBe('/api/test');
      expect(postCall[1].method).toBe('POST');
      
      const headers = postCall[1].headers;
      expect(headers.get('x-csrf-token')).toBe('test-csrf-token');
      expect(headers.get('Content-Type')).toBe('application/json');
    });

    it('does not include CSRF token in GET requests', async () => {
      const { apiFetch } = await import('../api');
      
      // Mock CSRF token request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ csrfToken: 'test-csrf-token' })
      });

      // Mock actual request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: 'test' })
      });

      await apiFetch('/api/test', { method: 'GET' });

      const getCall = mockFetch.mock.calls[1];
      const headers = getCall[1].headers;
      expect(headers.get('x-csrf-token')).toBeNull();
    });

    it('throws ApiError for network errors', async () => {
      const { apiFetch, ApiError } = await import('../api');
      
      // Mock CSRF token request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ csrfToken: 'test-csrf-token' })
      });

      // Mock network error (reject with AbortError for timeout case)
      const abortError = new Error('Network error');
      mockFetch.mockRejectedValueOnce(abortError);

      await expect(apiFetch('/api/test')).rejects.toThrow(ApiError);
    });

    it('throws ApiError for timeout', async () => {
      const { apiFetch, ApiError } = await import('../api');
      
      // Mock CSRF token request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ csrfToken: 'test-csrf-token' })
      });

      // Mock AbortError to simulate timeout
      const abortError = new Error('Request timed out');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValueOnce(abortError);

      await expect(apiFetch('/api/test', { timeoutMs: 100 })).rejects.toThrow(ApiError);
    });

    it('throws ApiError for HTTP errors', async () => {
      const { apiFetch, ApiError } = await import('../api');
      
      // Mock CSRF token request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ csrfToken: 'test-csrf-token' })
      });

      // Mock 404 error
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ message: 'Not found' })
      });

      const error = await apiFetch('/api/test').catch(e => e);
      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(404);
      expect(error.message).toBe('Not found');
    });
  });

  describe('Authentication API', () => {
    it('login sends correct request', async () => {
      const { login } = await import('../api');
      
      // Mock CSRF token request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ csrfToken: 'test-csrf-token' })
      });

      // Mock login request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ token: 'jwt-token' })
      });

      await login('test@example.com', 'password');

      const loginCall = mockFetch.mock.calls[1];
      expect(loginCall[0]).toBe('/api/v1/auth/login');
      expect(loginCall[1].method).toBe('POST');
      
      const body = JSON.parse(loginCall[1].body);
      expect(body.email).toBe('test@example.com');
      expect(body.password).toBe('password');
    });

    it('login trims and lowercases email', async () => {
      const { login } = await import('../api');
      
      // Mock CSRF token request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ csrfToken: 'test-csrf-token' })
      });

      // Mock login request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ token: 'jwt-token' })
      });

      await login(' Test@Example.COM ', 'password');

      const loginCall = mockFetch.mock.calls[1];
      const body = JSON.parse(loginCall[1].body);
      expect(body.email).toBe('test@example.com');
    });
  });

  describe('Projects API', () => {
    it('listProjects sends GET request', async () => {
      const { listProjects } = await import('../api');
      
      // Mock CSRF token request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ csrfToken: 'test-csrf-token' })
      });

      // Mock list projects request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ projects: [{ id: '1', name: 'Test', status: 'todo' }] })
      });

      const result = await listProjects();

      expect(result.projects).toHaveLength(1);
      expect(result.projects[0]).toMatchObject({
        id: '1',
        name: 'Test',
        status: 'todo'
      });
      
      const listCall = mockFetch.mock.calls[1];
      expect(listCall[0]).toBe('/api/v1/projects');
      expect(listCall[1].method).toBeUndefined(); // GET is default
    });

    it('createProject sends POST request with data', async () => {
      const { createProject } = await import('../api');
      
      // Mock CSRF token request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ csrfToken: 'test-csrf-token' })
      });

      // Mock create project request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 
          project: { id: '1', name: 'New Project', status: 'todo' }
        })
      });

      await createProject({ name: 'New Project', status: 'todo' });

      const createCall = mockFetch.mock.calls[1];
      expect(createCall[0]).toBe('/api/v1/projects');
      expect(createCall[1].method).toBe('POST');
      
      const body = JSON.parse(createCall[1].body);
      expect(body).toMatchObject({
        name: 'New Project',
        status: 'todo'
      });
    });

    it('updateProject sends PUT request with data', async () => {
      const { updateProject } = await import('../api');
      
      // Mock CSRF token request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ csrfToken: 'test-csrf-token' })
      });

      // Mock update project request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 
          project: { id: '1', name: 'Updated Project', status: 'in_progress' }
        })
      });

      await updateProject('1', { name: 'Updated Project', status: 'in_progress' });

      const updateCall = mockFetch.mock.calls[1];
      expect(updateCall[0]).toBe('/api/v1/projects/1');
      expect(updateCall[1].method).toBe('PUT');
      
      const body = JSON.parse(updateCall[1].body);
      expect(body).toMatchObject({
        name: 'Updated Project',
        status: 'in_progress'
      });
    });
  });

  describe('ApiError', () => {
    it('creates error with status and body', async () => {
      const { ApiError } = await import('../api');
      
      const error = new ApiError('Test error', 400, { field: 'invalid' });
      
      expect(error.message).toBe('Test error');
      expect(error.status).toBe(400);
      expect(error.body).toEqual({ field: 'invalid' });
      expect(error).toBeInstanceOf(Error);
    });
  });
});
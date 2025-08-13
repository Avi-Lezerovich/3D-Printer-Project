// Centralized API client with CSRF header and credentials
export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  // Ensure CSRF cookie exists by pre-fetching token endpoint on first use
  if (!sessionStorage.getItem('csrf_initialized')) {
    try {
      await fetch('/api/csrf-token', { credentials: 'include' })
    } catch {}
    sessionStorage.setItem('csrf_initialized', '1')
  }

  const method = (init.method || 'GET').toUpperCase()
  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json')

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    // Read CSRF token returned by the API; fallback to cookie if needed
    try {
      const res = await fetch('/api/csrf-token', { credentials: 'include' })
      if (res.ok) {
        const data = (await res.json()) as { csrfToken?: string }
        if (data?.csrfToken) headers.set('x-csrf-token', data.csrfToken)
      }
    } catch {}
  }

  return fetch(input, { ...init, headers, credentials: 'include' })
}

export async function login(email: string, password: string) {
  const res = await apiFetch('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error('Login failed')
  return res.json()
}

// Projects API
export async function listProjects() {
  const res = await apiFetch('/api/v1/projects')
  if (!res.ok) throw new Error('Failed to list projects')
  return res.json() as Promise<{ projects: any[] }>
}

export async function createProject(input: { name: string; status?: 'todo' | 'in_progress' | 'done' }) {
  const res = await apiFetch('/api/v1/projects', { method: 'POST', body: JSON.stringify(input) })
  if (!res.ok) throw new Error('Failed to create project')
  return res.json() as Promise<{ project: any }>
}

export async function updateProject(id: string, input: Partial<{ name: string; status: 'todo' | 'in_progress' | 'done' }>) {
  const res = await apiFetch(`/api/v1/projects/${id}`, { method: 'PUT', body: JSON.stringify(input) })
  if (!res.ok) throw new Error('Failed to update project')
  return res.json() as Promise<{ project: any }>
}

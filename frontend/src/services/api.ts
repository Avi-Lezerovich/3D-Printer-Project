import { SECURITY } from '../core/constants';

let cachedCsrfToken: string | null = null;
let csrfInitPromise: Promise<void> | null = null;

async function ensureCsrf(): Promise<void> {
  if (cachedCsrfToken) return;
  if (!csrfInitPromise) {
    csrfInitPromise = (async () => {
      try {
        const res = await fetch('/api/csrf-token', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
            if ((data as { csrfToken?: string }).csrfToken) cachedCsrfToken = (data as { csrfToken?: string }).csrfToken;
        }
      } catch {}
    })();
  }
  await csrfInitPromise;
}

export class ApiError extends Error {
  status: number; body?: unknown;
  constructor(message: string, status: number, body?: unknown){
    super(message); this.status = status; this.body = body;
  }
}

export interface ApiFetchOptions extends RequestInit { timeoutMs?: number; expectJson?: boolean }

export async function apiFetch(input: RequestInfo | URL, init: ApiFetchOptions = {}) {
  const { timeoutMs = SECURITY.REQUEST_TIMEOUT_MS, expectJson = true, ...rest } = init;
  await ensureCsrf();
  const method = (rest.method || 'GET').toUpperCase();
  const headers = new Headers(rest.headers);
  if (!headers.has('Content-Type') && rest.body) headers.set('Content-Type', 'application/json');
  if (!['GET','HEAD','OPTIONS'].includes(method) && cachedCsrfToken) headers.set('x-csrf-token', cachedCsrfToken);
  const controller = new AbortController();
  const id = setTimeout(()=>controller.abort(), timeoutMs);
  let resp: Response;
  try { resp = await fetch(input, { ...rest, headers, credentials: 'include', signal: controller.signal }); }
  catch(e){ clearTimeout(id); if(e instanceof Error && e.name==='AbortError') throw new ApiError('Request timed out', 408); throw new ApiError('Network error', 0); }
  clearTimeout(id);
  if(!resp.ok){ let body: unknown; if(expectJson){ try{ body = await resp.json(); }catch{} } const message = (body as { message?: string })?.message || `Request failed (${resp.status})`; throw new ApiError(message, resp.status, body); }
  if(!expectJson) return resp; const data = await resp.json(); if((data as { csrfToken?: string }).csrfToken) cachedCsrfToken = (data as { csrfToken?: string }).csrfToken; return data as unknown;
}

export async function login(email: string, password: string) {
  return apiFetch('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ email: email.trim().toLowerCase(), password }) });
}

// Projects API
export interface ProjectDto { id: string; name: string; status: 'todo' | 'in_progress' | 'done' }
export async function listProjects() { return apiFetch('/api/v1/projects') as Promise<{ projects: ProjectDto[] }>; }

export async function createProject(input: { name: string; status?: 'todo' | 'in_progress' | 'done' }) { return apiFetch('/api/v1/projects', { method: 'POST', body: JSON.stringify(input) }) as Promise<{ project: ProjectDto }>; }

export async function updateProject(id: string, input: Partial<{ name: string; status: 'todo' | 'in_progress' | 'done' }>) { return apiFetch(`/api/v1/projects/${id}`, { method: 'PUT', body: JSON.stringify(input) }) as Promise<{ project: ProjectDto }>; }

// Lightweight fetch wrapper with auth & refresh retry placeholder
export interface ApiClientOptions { baseUrl: string }

const DEFAULT_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export class ApiError extends Error { constructor(message:string, public status:number){ super(message); }}

export class ApiClient {
  private base: string;
  constructor(opts: Partial<ApiClientOptions> = {}){ this.base = opts.baseUrl || DEFAULT_BASE }

  private async request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
    const res = await fetch(this.base + path, {
      credentials: 'include',
      headers: { 'Accept': 'application/json', 'Content-Type':'application/json', ...(init.headers||{}) },
      ...init,
    });
    if(res.status === 401 && retry){
      // try refresh
      try {
        const r = await fetch(this.base + '/api/v1/auth/refresh', { method:'POST', credentials:'include'});
        if(r.ok) return this.request<T>(path, init, false);
      } catch {}
    }
    if(!res.ok){ throw new ApiError(res.statusText || 'Request failed', res.status); }
    if(res.status === 204) return undefined as unknown as T;
    return res.json() as Promise<T>;
  }

  get<T>(p:string){ return this.request<T>(p); }
  post<T,B=unknown>(p:string, body:B){ return this.request<T>(p,{ method:'POST', body: JSON.stringify(body)}); }
  del<T>(p:string){ return this.request<T>(p,{ method:'DELETE'}); }
}

export const apiClient = new ApiClient();

import { create } from 'zustand';
import { apiClient } from '../api/client';

export interface User { id?: string; email: string; role?: string }

interface LoginResponse { token: string; refreshToken: string; user: { email: string; role?: string } }

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  setUser: (u: User | null) => void;
  setToken: (t: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  initialized: false,
  token: null,
  setUser: (u) => set({ user: u }),
  setToken: (t) => set({ token: t }),
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const resp = await apiClient.post<LoginResponse, { email: string; password: string }>(
        '/api/v1/auth/login',
        { email, password }
      );
      // resp.user payload shape differs slightly from /me; treat as authoritative
      set({ user: { email: resp.user.email, role: resp.user.role }, token: resp.token, loading: false, initialized: true });
      return true;
    } catch (e: any) {
      set({ error: e.message || 'Login failed', loading: false, user: null });
      return false;
    }
  },
  logout: async () => {
    try { await apiClient.post('/api/v1/auth/logout', {}); } catch {}
    set({ user: null, token: null });
  },
  refreshSession: async () => {
    try {
      const me = await apiClient.get<User>('/api/v1/auth/me');
      set({ user: me, initialized: true });
    } catch {
      set({ user: null, initialized: true });
    }
  },
}));

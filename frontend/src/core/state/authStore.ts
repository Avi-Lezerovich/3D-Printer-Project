import { create } from 'zustand';
import { apiClient } from '../api/client';

export interface User { id: string; email: string; role?: string }

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  setUser: (u: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  initialized: false,
  setUser: (u) => set({ user: u }),
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      await apiClient.post('/api/v1/auth/login', { email, password });
      const me = await apiClient.get<User>('/api/v1/auth/me');
      set({ user: me, loading: false, initialized: true });
      return true;
    } catch (e: any) {
      set({ error: e.message || 'Login failed', loading: false, user: null });
      return false;
    }
  },
  logout: async () => {
    try { await apiClient.post('/api/v1/auth/logout', {}); } catch {}
    set({ user: null });
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

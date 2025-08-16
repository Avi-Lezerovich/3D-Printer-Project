import { describe, it, expect, vi } from 'vitest';
import { useAuthStore } from '../core/state/authStore';
import { act } from '@testing-library/react';

vi.mock('../core/api/client', () => {
  return {
    apiClient: {
      post: vi.fn((path: string) => {
        if(path.includes('login')) return Promise.resolve({ token: 't123', refreshToken: 'r123', user: { email: 'user@example.com', role: 'user' } });
        if(path.includes('logout')) return Promise.resolve({});
        return Promise.resolve({});
      }),
      get: vi.fn((path: string) => {
        if(path.includes('/me')) return Promise.resolve({ id: 'u1', email: 'user@example.com', role: 'user' });
        return Promise.resolve({});
      })
    }
  }
});

describe('authStore', () => {
  it('logs in and sets user', async () => {
  useAuthStore.setState({ user: null, loading: false, error: null, initialized: false, token: null });
    let success: boolean | undefined;
    await act(async () => { success = await useAuthStore.getState().login('user@example.com','pass'); });
    expect(success).toBe(true);
    expect(useAuthStore.getState().user?.email).toBe('user@example.com');
  });

  it('refreshSession sets user when session valid', async () => {
    useAuthStore.setState({ user: null, initialized: false });
    await act(async () => { await useAuthStore.getState().refreshSession(); });
    expect(useAuthStore.getState().user).not.toBeNull();
    expect(useAuthStore.getState().initialized).toBe(true);
  });
});

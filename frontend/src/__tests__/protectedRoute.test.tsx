import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import Protected from '../core/components/Protected';

vi.mock('../core/state/authStore', () => {
  let state = {
    user: null as any,
    initialized: true,
    login: vi.fn(),
    logout: vi.fn(),
    refreshSession: vi.fn(),
    setUser: (u: any) => { state.user = u; }
  };
  const useAuthStore = (selector?: any) => selector ? selector(state) : state;
  return { useAuthStore };
});

function App(){
  return (
    <MemoryRouter initialEntries={['/private']}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/private" element={<Protected><div>Secret</div></Protected>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Protected route', () => {
  it('redirects when no user', async () => {
    render(<App />);
    await waitFor(()=> screen.getByText('Login Page'));
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});

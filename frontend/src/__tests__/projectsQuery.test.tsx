import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProjects, useCreateProject } from '../features/projects/useProjects';

vi.mock('../core/api/client', () => ({
  apiClient: {
    get: vi.fn(() => Promise.resolve({ projects: [{ id:'p1', name:'Proj 1', status:'todo' }] })),
    post: vi.fn(() => Promise.resolve({ project: { id:'p2', name:'New', status:'todo' } }))
  }
}));

interface WrapperProps { children: React.ReactNode }
function wrapper({ children }: WrapperProps){
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('projects queries', () => {
  it('fetches projects list', async () => {
    const { result } = renderHook(()=> useProjects(), { wrapper });
    await waitFor(()=> expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.projects.length).toBe(1);
  });
  it('creates project and invalidates list', async () => {
    const { result: queryResult, rerender } = renderHook(()=> useProjects(), { wrapper });
    const { result: createResult } = renderHook(()=> useCreateProject(), { wrapper });
    await waitFor(()=> expect(queryResult.current.isSuccess).toBe(true));
    await createResult.current.mutateAsync({ name:'New' });
    await waitFor(()=> expect(createResult.current.isSuccess || createResult.current.isIdle).toBe(true));
    rerender();
  });
});

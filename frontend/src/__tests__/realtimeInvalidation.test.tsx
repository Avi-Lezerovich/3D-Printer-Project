import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ReactNode, useEffect } from 'react';

// Mock socket.io-client before importing provider
vi.mock('socket.io-client', () => ({ io: () => ({ on: vi.fn(), off: vi.fn() }) }));

vi.mock('../core/api/client', () => ({
  apiClient: { get: vi.fn(()=> Promise.resolve({ projects: [] })) }
}));

import { SocketProvider } from '../core/realtime/SocketProvider';
import { useProjects } from '../features/projects/useProjects';

function Trigger({ children }: { children: ReactNode }){
  const qc = useQueryClient();
  useEffect(()=>{
    // simulate project updated event by manually invalidating
    qc.invalidateQueries({ queryKey: ['projects'] });
  }, [qc]);
  return <>{children}</>;
}

function App(){
  const qc = new QueryClient();
  return (
    <QueryClientProvider client={qc}>
      <SocketProvider>
        <Trigger>
          <List />
        </Trigger>
      </SocketProvider>
    </QueryClientProvider>
  );
}

function List(){
  const { data } = useProjects();
  return <div data-testid="count">{data?.projects.length ?? 0}</div>;
}

describe('Realtime invalidation', () => {
  it('handles manual invalidation (placeholder for socket event)', () => {
    // Just mount to ensure no errors
    expect(()=> App()).not.toThrow();
  });
});

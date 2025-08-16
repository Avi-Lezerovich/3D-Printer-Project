import { describe, it, expect, vi } from 'vitest';
import { SocketProvider, useSocket } from '../core/realtime/SocketProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

vi.mock('socket.io-client', () => {
  const onHandlers: Record<string, Function[]> = {};
  const socket = {
    on: (name: string, fn: Function) => { (onHandlers[name] ||= []).push(fn); return socket; },
    emit: (name: string, payload?: any) => { (onHandlers[name]||[]).forEach(fn=>fn(payload)); },
    disconnect: () => {},
  };
  return { io: () => socket };
});

function HookProbe(){
  const { status } = useSocket();
  return <span data-status={status} />;
}

describe('SocketProvider', () => {
  it('initializes and provides status', () => {
    const qc = new QueryClient();
    const { container } = render(
      <QueryClientProvider client={qc}>
        <SocketProvider enable>
          <HookProbe />
        </SocketProvider>
      </QueryClientProvider>
    );
    const span = container.querySelector('span[data-status]');
    expect(span).toBeTruthy();
  });
});

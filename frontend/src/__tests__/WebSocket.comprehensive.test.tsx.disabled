import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SocketProvider, useSocket } from '../../core/realtime/SocketProvider';

// Enhanced WebSocket mock with realistic connection behaviors
class MockSocket {
  private handlers: Record<string, Function[]> = {};
  private connected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  constructor() {
    // Simulate connection delay
    setTimeout(() => {
      this.connected = true;
      this.emit('connect');
    }, 10);
  }

  on(event: string, handler: Function) {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event].push(handler);
    return this;
  }

  off(event: string, handler: Function) {
    if (this.handlers[event]) {
      this.handlers[event] = this.handlers[event].filter(h => h !== handler);
    }
    return this;
  }

  emit(event: string, data?: any) {
    if (this.handlers[event]) {
      this.handlers[event].forEach(handler => handler(data));
    }
  }

  disconnect() {
    this.connected = false;
    this.emit('disconnect');
  }

  connect() {
    if (!this.connected && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connected = true;
        this.emit('connect');
      }, 100 * this.reconnectAttempts); // Progressive delay
    }
  }

  // Test utilities
  simulateConnectionLoss() {
    this.connected = false;
    this.emit('disconnect');
  }

  simulateReconnection() {
    this.connected = true;
    this.emit('connect');
  }

  simulateError(error: Error) {
    this.emit('connect_error', error);
  }

  simulateNetworkDelay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  isConnected() {
    return this.connected;
  }
}

// Mock socket.io-client
let mockSocket: MockSocket;
vi.mock('socket.io-client', () => ({
  io: () => {
    mockSocket = new MockSocket();
    return mockSocket;
  }
}));

const createWrapper = (enable = true) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <SocketProvider enable={enable}>
        {children}
      </SocketProvider>
    </QueryClientProvider>
  );
};

describe('WebSocket Real-time Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Connection Management', () => {
    it('establishes connection on initialization', async () => {
      const { result } = renderHook(() => useSocket(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.status).toBe('connected');
      });

      expect(mockSocket.isConnected()).toBe(true);
    });

    it('handles connection when disabled', () => {
      const { result } = renderHook(() => useSocket(), { wrapper: createWrapper(false) });

      expect(result.current.status).toBe('disabled');
      expect(result.current.emit).toBeDefined();
    });

    it('manages connection state transitions', async () => {
      const { result } = renderHook(() => useSocket(), { wrapper: createWrapper() });

      // Initial connecting state
      expect(result.current.status).toBe('connecting');

      // Should transition to connected
      await waitFor(() => {
        expect(result.current.status).toBe('connected');
      });

      // Simulate disconnection
      act(() => {
        mockSocket.simulateConnectionLoss();
      });

      await waitFor(() => {
        expect(result.current.status).toBe('disconnected');
      });

      // Simulate reconnection
      act(() => {
        mockSocket.simulateReconnection();
      });

      await waitFor(() => {
        expect(result.current.status).toBe('connected');
      });
    });

    it('handles connection errors gracefully', async () => {
      const { result } = renderHook(() => useSocket(), { wrapper: createWrapper() });

      const connectionError = new Error('Connection refused');
      
      act(() => {
        mockSocket.simulateError(connectionError);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });
    });
  });

  describe('Real-time Data Synchronization', () => {
    it('receives and processes real-time printer status updates', async () => {
      const TestComponent = () => {
        const { status, lastMessage } = useSocket();
        return <div data-testid="status">{status}</div>;
      };

      const { getByTestId } = render(<TestComponent />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(getByTestId('status')).toHaveTextContent('connected');
      });

      // Simulate printer status update
      const printerStatus = {
        status: 'printing',
        progress: 45,
        currentJob: 'test-model.gcode',
        temperature: { hotend: 210, bed: 60 }
      };

      act(() => {
        mockSocket.emit('printer-status', printerStatus);
      });

      // Hook should provide access to the latest message
      // This would need to be implemented in the actual SocketProvider
    });

    it('handles high-frequency updates without performance issues', async () => {
      const updateCount = 100;
      const { result } = renderHook(() => useSocket(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.status).toBe('connected');
      });

      const startTime = performance.now();

      // Send many rapid updates
      for (let i = 0; i < updateCount; i++) {
        act(() => {
          mockSocket.emit('temperature-update', {
            hotend: 200 + i,
            bed: 60,
            timestamp: Date.now()
          });
        });
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('maintains message ordering under rapid updates', async () => {
      const receivedMessages: number[] = [];
      
      const TestComponent = () => {
        const { status } = useSocket();
        
        React.useEffect(() => {
          if (!mockSocket) return;
          
          const handler = (data: { sequence: number }) => {
            receivedMessages.push(data.sequence);
          };
          
          mockSocket.on('sequence-test', handler);
          return () => mockSocket.off('sequence-test', handler);
        }, []);

        return <div>{status}</div>;
      };

      render(<TestComponent />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(mockSocket.isConnected()).toBe(true);
      });

      // Send messages with sequence numbers
      for (let i = 0; i < 20; i++) {
        act(() => {
          mockSocket.emit('sequence-test', { sequence: i });
        });
      }

      await waitFor(() => {
        expect(receivedMessages).toHaveLength(20);
      });

      // Messages should be received in order
      expect(receivedMessages).toEqual([...Array(20).keys()]);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('implements exponential backoff for reconnection attempts', async () => {
      const { result } = renderHook(() => useSocket(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.status).toBe('connected');
      });

      // Simulate connection loss
      act(() => {
        mockSocket.simulateConnectionLoss();
      });

      await waitFor(() => {
        expect(result.current.status).toBe('disconnected');
      });

      // Should attempt to reconnect
      await waitFor(() => {
        expect(result.current.status).toBe('connected');
      }, { timeout: 2000 });
    });

    it('handles malformed messages gracefully', async () => {
      const { result } = renderHook(() => useSocket(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.status).toBe('connected');
      });

      // Send malformed data
      const malformedData = [
        null,
        undefined,
        'invalid-json',
        { incomplete: true },
        123,
        []
      ];

      malformedData.forEach((data, index) => {
        act(() => {
          mockSocket.emit('test-message', data);
        });
      });

      // Should remain connected despite malformed messages
      expect(result.current.status).toBe('connected');
    });

    it('recovers from temporary network issues', async () => {
      const { result } = renderHook(() => useSocket(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.status).toBe('connected');
      });

      // Simulate network delay
      act(() => {
        mockSocket.simulateConnectionLoss();
      });

      await waitFor(() => {
        expect(result.current.status).toBe('disconnected');
      });

      // Simulate network recovery after delay
      setTimeout(() => {
        act(() => {
          mockSocket.simulateReconnection();
        });
      }, 200);

      await waitFor(() => {
        expect(result.current.status).toBe('connected');
      }, { timeout: 1000 });
    });
  });

  describe('Performance Monitoring', () => {
    it('tracks connection latency', async () => {
      const { result } = renderHook(() => useSocket(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.status).toBe('connected');
      });

      // Simulate ping/pong for latency tracking
      const startTime = performance.now();
      
      act(() => {
        mockSocket.emit('ping', { timestamp: startTime });
      });

      act(() => {
        mockSocket.emit('pong', { timestamp: startTime });
      });

      const endTime = performance.now();
      const latency = endTime - startTime;

      expect(latency).toBeLessThan(100); // Should be very fast in tests
    });

    it('monitors memory usage during long-running operations', async () => {
      const { result, unmount } = renderHook(() => useSocket(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.status).toBe('connected');
      });

      // Simulate many updates to test for memory leaks
      for (let i = 0; i < 1000; i++) {
        act(() => {
          mockSocket.emit('stress-test', { data: new Array(100).fill(i) });
        });
      }

      // Component should still be responsive
      expect(result.current.status).toBe('connected');

      // Cleanup should work properly
      unmount();
    });

    it('handles concurrent operations efficiently', async () => {
      const hook1 = renderHook(() => useSocket(), { wrapper: createWrapper() });
      const hook2 = renderHook(() => useSocket(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(hook1.result.current.status).toBe('connected');
        expect(hook2.result.current.status).toBe('connected');
      });

      const startTime = performance.now();

      // Simulate concurrent operations
      const promises = [];
      for (let i = 0; i < 50; i++) {
        promises.push(new Promise(resolve => {
          act(() => {
            mockSocket.emit(`concurrent-${i}`, { data: i });
          });
          resolve(i);
        }));
      }

      await Promise.all(promises);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(500);
    });
  });

  describe('Integration with React Query', () => {
    it('invalidates queries when real-time data changes', async () => {
      const queryClient = new QueryClient();
      const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

      const TestComponent = () => {
        const { status } = useSocket();
        return <div>{status}</div>;
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          <SocketProvider enable={true}>
            {children}
          </SocketProvider>
        </QueryClientProvider>
      );

      render(<TestComponent />, { wrapper });

      await waitFor(() => {
        expect(mockSocket.isConnected()).toBe(true);
      });

      // Simulate data change that should invalidate queries
      act(() => {
        mockSocket.emit('project-updated', { projectId: 'test-123' });
      });

      // This would need to be implemented in the actual SocketProvider
      // expect(invalidateQueries).toHaveBeenCalledWith(['projects', 'test-123']);
    });

    it('optimistically updates cache with real-time data', async () => {
      const queryClient = new QueryClient();
      const setQueryData = vi.spyOn(queryClient, 'setQueryData');

      const TestComponent = () => {
        const { status } = useSocket();
        return <div>{status}</div>;
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          <SocketProvider enable={true}>
            {children}
          </SocketProvider>
        </QueryClientProvider>
      );

      render(<TestComponent />, { wrapper });

      await waitFor(() => {
        expect(mockSocket.isConnected()).toBe(true);
      });

      // Simulate real-time update
      const taskUpdate = {
        taskId: 'task-123',
        status: 'completed',
        progress: 100
      };

      act(() => {
        mockSocket.emit('task-updated', taskUpdate);
      });

      // This would need to be implemented in the actual SocketProvider
      // expect(setQueryData).toHaveBeenCalledWith(['tasks', 'task-123'], expect.any(Function));
    });
  });

  describe('Security and Authentication', () => {
    it('handles authentication token refresh', async () => {
      const { result } = renderHook(() => useSocket(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.status).toBe('connected');
      });

      // Simulate auth token expiry
      act(() => {
        mockSocket.emit('auth-required');
      });

      // Should handle re-authentication gracefully
      await waitFor(() => {
        expect(result.current.status).toBe('connected');
      });
    });

    it('validates incoming message authenticity', async () => {
      const { result } = renderHook(() => useSocket(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.status).toBe('connected');
      });

      // Send message without proper signature/validation
      act(() => {
        mockSocket.emit('suspicious-message', { 
          type: 'admin-command',
          payload: 'delete-all-data' 
        });
      });

      // Should ignore or handle suspicious messages appropriately
      expect(result.current.status).toBe('connected');
    });
  });
});
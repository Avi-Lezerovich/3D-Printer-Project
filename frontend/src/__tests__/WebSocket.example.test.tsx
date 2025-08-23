import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, renderHook, act, waitFor } from '@testing-library/react';

// Mock Socket.IO
const mockSocket = {
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
  connected: false
};

vi.mock('socket.io-client', () => ({
  io: () => mockSocket
}));

// Simplified Socket Hook for testing
const useSocket = () => {
  const [status, setStatus] = React.useState('connecting');
  const [lastMessage, setLastMessage] = React.useState<any>(null);

  React.useEffect(() => {
    const handleConnect = () => setStatus('connected');
    const handleDisconnect = () => setStatus('disconnected');
    const handleMessage = (data: any) => setLastMessage(data);

    mockSocket.on('connect', handleConnect);
    mockSocket.on('disconnect', handleDisconnect);
    mockSocket.on('printer-status', handleMessage);
    mockSocket.on('temperature-update', handleMessage);

    return () => {
      mockSocket.off('connect', handleConnect);
      mockSocket.off('disconnect', handleDisconnect);
      mockSocket.off('printer-status', handleMessage);
      mockSocket.off('temperature-update', handleMessage);
    };
  }, []);

  const emit = (event: string, data: any) => {
    mockSocket.emit(event, data);
  };

  return { status, lastMessage, emit };
};

// Test component that uses the socket
const SocketTestComponent = () => {
  const { status, lastMessage } = useSocket();
  
  return (
    <div>
      <div data-testid="status">{status}</div>
      {lastMessage && (
        <div data-testid="last-message">
          {JSON.stringify(lastMessage)}
        </div>
      )}
    </div>
  );
};

describe('WebSocket Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSocket.connected = false;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Connection Management', () => {
    it('starts in connecting state', () => {
      const { result } = renderHook(() => useSocket());
      expect(result.current.status).toBe('connecting');
    });

    it('transitions to connected when socket connects', async () => {
      const { result } = renderHook(() => useSocket());

      expect(result.current.status).toBe('connecting');

      // Simulate connection
      act(() => {
        const connectHandler = mockSocket.on.mock.calls
          .find(call => call[0] === 'connect')?.[1];
        if (connectHandler) connectHandler();
      });

      expect(result.current.status).toBe('connected');
    });

    it('transitions to disconnected when socket disconnects', async () => {
      const { result } = renderHook(() => useSocket());

      // First connect
      act(() => {
        const connectHandler = mockSocket.on.mock.calls
          .find(call => call[0] === 'connect')?.[1];
        if (connectHandler) connectHandler();
      });

      expect(result.current.status).toBe('connected');

      // Then disconnect
      act(() => {
        const disconnectHandler = mockSocket.on.mock.calls
          .find(call => call[0] === 'disconnect')?.[1];
        if (disconnectHandler) disconnectHandler();
      });

      expect(result.current.status).toBe('disconnected');
    });
  });

  describe('Message Handling', () => {
    it('receives printer status updates', async () => {
      const { result } = renderHook(() => useSocket());

      const statusUpdate = {
        status: 'printing',
        progress: 25,
        temperature: { hotend: 200, bed: 60 }
      };

      act(() => {
        const messageHandler = mockSocket.on.mock.calls
          .find(call => call[0] === 'printer-status')?.[1];
        if (messageHandler) messageHandler(statusUpdate);
      });

      expect(result.current.lastMessage).toEqual(statusUpdate);
    });

    it('receives temperature updates', async () => {
      const { result } = renderHook(() => useSocket());

      const tempUpdate = {
        hotend: 210,
        bed: 65,
        timestamp: Date.now()
      };

      act(() => {
        const messageHandler = mockSocket.on.mock.calls
          .find(call => call[0] === 'temperature-update')?.[1];
        if (messageHandler) messageHandler(tempUpdate);
      });

      expect(result.current.lastMessage).toEqual(tempUpdate);
    });

    it('handles multiple rapid updates', async () => {
      const { result } = renderHook(() => useSocket());

      const messageHandler = mockSocket.on.mock.calls
        .find(call => call[0] === 'temperature-update')?.[1];
      
      if (!messageHandler) throw new Error('Message handler not found');

      // Send multiple rapid updates
      for (let i = 0; i < 10; i++) {
        act(() => {
          messageHandler({ hotend: 200 + i, bed: 60 });
        });
      }

      // Should have the last update
      expect(result.current.lastMessage).toEqual({ hotend: 209, bed: 60 });
    });
  });

  describe('Component Integration', () => {
    it('displays connection status in UI', async () => {
      render(<SocketTestComponent />);

      const statusElement = document.querySelector('[data-testid="status"]');
      expect(statusElement).toHaveTextContent('connecting');

      // Simulate connection
      act(() => {
        const connectHandler = mockSocket.on.mock.calls
          .find(call => call[0] === 'connect')?.[1];
        if (connectHandler) connectHandler();
      });

      await waitFor(() => {
        expect(statusElement).toHaveTextContent('connected');
      });
    });

    it('displays received messages in UI', async () => {
      render(<SocketTestComponent />);

      const message = { status: 'printing', progress: 50 };

      act(() => {
        const messageHandler = mockSocket.on.mock.calls
          .find(call => call[0] === 'printer-status')?.[1];
        if (messageHandler) messageHandler(message);
      });

      await waitFor(() => {
        const messageElement = document.querySelector('[data-testid="last-message"]');
        expect(messageElement).toHaveTextContent(JSON.stringify(message));
      });
    });
  });

  describe('Cleanup', () => {
    it('cleans up event listeners on unmount', () => {
      const { unmount } = renderHook(() => useSocket());
      
      // Verify listeners were added
      expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('printer-status', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('temperature-update', expect.any(Function));

      unmount();

      // Verify listeners were removed
      expect(mockSocket.off).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockSocket.off).toHaveBeenCalledWith('disconnect', expect.any(Function));
      expect(mockSocket.off).toHaveBeenCalledWith('printer-status', expect.any(Function));
      expect(mockSocket.off).toHaveBeenCalledWith('temperature-update', expect.any(Function));
    });
  });

  describe('Performance', () => {
    it('handles high frequency updates efficiently', async () => {
      const { result } = renderHook(() => useSocket());

      const startTime = performance.now();

      const messageHandler = mockSocket.on.mock.calls
        .find(call => call[0] === 'temperature-update')?.[1];

      if (messageHandler) {
        // Send 100 rapid updates
        for (let i = 0; i < 100; i++) {
          act(() => {
            messageHandler({ hotend: 200 + (i % 20), bed: 60 });
          });
        }
      }

      const endTime = performance.now();
      
      // Should handle updates quickly
      expect(endTime - startTime).toBeLessThan(100);
      
      // Should still have the latest data
      expect(result.current.lastMessage).toEqual({ 
        hotend: 200 + (99 % 20), 
        bed: 60 
      });
    });
  });
});
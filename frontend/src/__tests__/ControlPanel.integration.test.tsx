import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import ControlPanel from '../../pages/ControlPanel';
import { SocketProvider } from '../../core/realtime/SocketProvider';

// Enhanced WebSocket mock for realistic testing
const createMockSocket = (initialState = 'connected') => {
  const handlers: Record<string, Function[]> = {};
  const socket = {
    on: (event: string, handler: Function) => {
      if (!handlers[event]) handlers[event] = [];
      handlers[event].push(handler);
      return socket;
    },
    emit: (event: string, data?: any) => {
      handlers[event]?.forEach(h => h(data));
    },
    disconnect: () => socket.emit('disconnect'),
    // Simulate real-time data updates
    simulateStatusUpdate: (status: any) => {
      socket.emit('printer-status', status);
    },
    simulateTemperatureUpdate: (temp: any) => {
      socket.emit('temperature-update', temp);
    },
    simulatePrintProgress: (progress: number) => {
      socket.emit('print-progress', { progress });
    }
  };
  return socket;
};

// Mock Socket.IO
let mockSocket: ReturnType<typeof createMockSocket>;
vi.mock('socket.io-client', () => ({
  io: () => mockSocket
}));

// Mock the app store
vi.mock('../../shared/store', () => ({
  useAppStore: () => ({
    jobs: [],
    addJob: vi.fn(),
    updateJob: vi.fn(),
    removeJob: vi.fn()
  })
}));

const renderControlPanel = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <SocketProvider enable={true}>
          <ControlPanel />
        </SocketProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('ControlPanel Integration Tests', () => {
  beforeEach(() => {
    mockSocket = createMockSocket();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Real-time Status Updates', () => {
    it('displays current printer status and updates in real-time', async () => {
      renderControlPanel();

      // Initial state should show idle
      expect(screen.getByText(/status/i)).toBeInTheDocument();

      // Simulate printer starting to print
      act(() => {
        mockSocket.simulateStatusUpdate({
          status: 'printing',
          currentJob: 'test-model.gcode',
          progress: 25
        });
      });

      await waitFor(() => {
        expect(screen.getByText(/printing/i)).toBeInTheDocument();
        expect(screen.getByText(/test-model\.gcode/i)).toBeInTheDocument();
        expect(screen.getByText(/25%/i)).toBeInTheDocument();
      });

      // Simulate error state
      act(() => {
        mockSocket.simulateStatusUpdate({
          status: 'error',
          error: 'Hotend temperature too low'
        });
      });

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
        expect(screen.getByText(/hotend temperature too low/i)).toBeInTheDocument();
      });
    });

    it('updates temperature displays in real-time', async () => {
      renderControlPanel();

      // Simulate temperature updates
      act(() => {
        mockSocket.simulateTemperatureUpdate({
          hotend: { current: 210, target: 215 },
          bed: { current: 55, target: 60 }
        });
      });

      await waitFor(() => {
        expect(screen.getByText(/210°C/)).toBeInTheDocument();
        expect(screen.getByText(/215°C/)).toBeInTheDocument();
        expect(screen.getByText(/55°C/)).toBeInTheDocument();
        expect(screen.getByText(/60°C/)).toBeInTheDocument();
      });

      // Simulate temperature reaching target
      act(() => {
        mockSocket.simulateTemperatureUpdate({
          hotend: { current: 215, target: 215 },
          bed: { current: 60, target: 60 }
        });
      });

      await waitFor(() => {
        expect(screen.getByText(/215°C/)).toBeInTheDocument();
        expect(screen.getByText(/60°C/)).toBeInTheDocument();
      });
    });

    it('shows appropriate status indicators based on printer state', async () => {
      renderControlPanel();

      // Test different status colors/indicators
      const testStates = [
        { status: 'printing', expectedColor: 'blue', expectedIcon: 'Play' },
        { status: 'error', expectedColor: 'red', expectedIcon: 'AlertCircle' },
        { status: 'idle', expectedColor: 'green', expectedIcon: 'CheckCircle' }
      ];

      for (const state of testStates) {
        act(() => {
          mockSocket.simulateStatusUpdate(state);
        });

        await waitFor(() => {
          const statusElement = screen.getByTestId('printer-status');
          expect(statusElement).toHaveClass(state.expectedColor);
        });
      }
    });
  });

  describe('Control Panel Navigation', () => {
    it('switches between different control panel tabs', async () => {
      const user = userEvent.setup();
      renderControlPanel();

      // Test tab navigation
      const tabs = ['overview', 'files', 'queue', 'monitor', 'charts'];
      
      for (const tab of tabs) {
        const tabButton = screen.getByRole('button', { name: new RegExp(tab, 'i') });
        await user.click(tabButton);

        await waitFor(() => {
          expect(tabButton).toHaveClass('active');
        });
      }
    });

    it('persists tab state during real-time updates', async () => {
      const user = userEvent.setup();
      renderControlPanel();

      // Switch to files tab
      const filesTab = screen.getByRole('button', { name: /files/i });
      await user.click(filesTab);

      await waitFor(() => {
        expect(filesTab).toHaveClass('active');
      });

      // Simulate status update
      act(() => {
        mockSocket.simulateStatusUpdate({ status: 'printing', progress: 50 });
      });

      // Tab should remain active
      await waitFor(() => {
        expect(filesTab).toHaveClass('active');
      });
    });
  });

  describe('Emergency Controls', () => {
    it('enables emergency stop when printer is active', async () => {
      const user = userEvent.setup();
      renderControlPanel();

      // Initially, emergency stop might be disabled
      let emergencyButton = screen.queryByRole('button', { name: /emergency stop/i });
      
      // Simulate printer starting
      act(() => {
        mockSocket.simulateStatusUpdate({ status: 'printing' });
      });

      await waitFor(() => {
        emergencyButton = screen.getByRole('button', { name: /emergency stop/i });
        expect(emergencyButton).not.toBeDisabled();
      });

      // Click emergency stop
      await user.click(emergencyButton);

      // Should emit emergency stop command
      expect(mockSocket.emit).toHaveBeenCalledWith('emergency-stop');
    });

    it('shows confirmation dialog for destructive actions', async () => {
      const user = userEvent.setup();
      renderControlPanel();

      // Simulate active print
      act(() => {
        mockSocket.simulateStatusUpdate({ status: 'printing', progress: 50 });
      });

      const emergencyButton = await screen.findByRole('button', { name: /emergency stop/i });
      await user.click(emergencyButton);

      // Should show confirmation dialog
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();

      // Cancel should close dialog
      await user.click(screen.getByRole('button', { name: /cancel/i }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Performance and Accessibility', () => {
    it('handles high-frequency updates without performance degradation', async () => {
      renderControlPanel();

      const startTime = performance.now();
      
      // Send 50 rapid temperature updates
      for (let i = 0; i < 50; i++) {
        act(() => {
          mockSocket.simulateTemperatureUpdate({
            hotend: { current: 200 + i, target: 215 },
            bed: { current: 60, target: 60 }
          });
        });
      }
      
      const endTime = performance.now();
      
      // Should complete within reasonable time (less than 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
      
      // UI should remain responsive
      const overviewTab = screen.getByRole('button', { name: /overview/i });
      expect(overviewTab).toBeInTheDocument();
    });

    it('supports keyboard navigation for all interactive elements', async () => {
      const user = userEvent.setup();
      renderControlPanel();

      // Get all interactive elements
      const buttons = screen.getAllByRole('button');
      const sliders = screen.queryAllByRole('slider');
      
      const interactiveElements = [...buttons, ...sliders];

      // Test that we can tab through all elements
      for (let i = 0; i < Math.min(5, interactiveElements.length); i++) {
        await user.tab();
        expect(document.activeElement).toBe(interactiveElements[i]);
      }
    });

    it('announces status changes to screen readers', async () => {
      renderControlPanel();

      // Find live regions
      const statusRegion = screen.getByRole('status', { hidden: true }) || 
                          screen.getByLabelText(/printer status/i);

      act(() => {
        mockSocket.simulateStatusUpdate({
          status: 'printing',
          currentJob: 'model.gcode',
          progress: 75
        });
      });

      await waitFor(() => {
        expect(statusRegion).toHaveTextContent(/printing.*75%/i);
      });
    });

    it('maintains focus management during dynamic updates', async () => {
      const user = userEvent.setup();
      renderControlPanel();

      // Focus on a control
      const controlButton = screen.getByRole('button', { name: /start print/i });
      await user.click(controlButton);
      
      // Simulate status update
      act(() => {
        mockSocket.simulateStatusUpdate({ status: 'printing' });
      });

      // Focus should not be lost
      await waitFor(() => {
        expect(document.activeElement).toBe(controlButton);
      });
    });
  });

  describe('Error Handling', () => {
    it('handles WebSocket disconnection gracefully', async () => {
      renderControlPanel();

      // Simulate connection loss
      act(() => {
        mockSocket.emit('disconnect');
      });

      await waitFor(() => {
        expect(screen.getByText(/connection lost/i)).toBeInTheDocument();
      });

      // Should show reconnection indicator
      expect(screen.getByText(/reconnecting/i)).toBeInTheDocument();
    });

    it('displays appropriate error messages for different failure scenarios', async () => {
      renderControlPanel();

      const errorScenarios = [
        { error: 'Temperature sensor failure', expectedMessage: /temperature sensor/i },
        { error: 'Filament jam detected', expectedMessage: /filament jam/i },
        { error: 'Power loss detected', expectedMessage: /power loss/i }
      ];

      for (const scenario of errorScenarios) {
        act(() => {
          mockSocket.simulateStatusUpdate({
            status: 'error',
            error: scenario.error
          });
        });

        await waitFor(() => {
          expect(screen.getByText(scenario.expectedMessage)).toBeInTheDocument();
        });
      }
    });
  });
});
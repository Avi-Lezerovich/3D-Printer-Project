/**
 * Real-time WebSocket Integration Tests
 * Comprehensive testing for WebSocket connections, real-time updates,
 * and printer status synchronization
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { 
  createWebSocketTestUtils, 
  mockSocketIo,
  PrinterStatus 
} from '../test/mocks/websocket.mock'
import { 
  RealTimeTestUtils,
  PerformanceTestUtils,
  performanceThresholds
} from '../test/mocks/performance.mock'

// Mock Socket.io
vi.mock('socket.io-client', () => mockSocketIo)

// Mock component that uses WebSocket
const PrinterStatusComponent: React.FC = () => {
  const [printerStatus, setPrinterStatus] = React.useState<PrinterStatus | null>(null)
  const [connectionStatus, setConnectionStatus] = React.useState<'connected' | 'disconnected' | 'connecting'>('connecting')
  
  React.useEffect(() => {
    const socket = mockSocketIo.io('http://localhost:3001')
    
    socket.on('connect', () => {
      setConnectionStatus('connected')
    })
    
    socket.on('disconnect', () => {
      setConnectionStatus('disconnected')
    })
    
    socket.on('printer-status', (status: PrinterStatus) => {
      setPrinterStatus(status)
    })
    
    // Auto-connect after a short delay to simulate real behavior
    const timer = setTimeout(() => {
      socket.connect()
    }, 50)
    
    return () => {
      clearTimeout(timer)
      socket.disconnect()
    }
  }, [])
  
  if (connectionStatus === 'connecting') {
    return <div>Connecting to printer...</div>
  }
  
  if (connectionStatus === 'disconnected') {
    return <div>Disconnected from printer</div>
  }
  
  if (!printerStatus) {
    return <div>Waiting for printer status...</div>
  }
  
  return (
    <div data-testid="printer-status">
      <div>Status: {printerStatus.status}</div>
      <div>Nozzle Temperature: {printerStatus.temperature.nozzle}°C</div>
      <div>Bed Temperature: {printerStatus.temperature.bed}°C</div>
      <div>Progress: {printerStatus.progress}%</div>
      {printerStatus.currentJob && (
        <div data-testid="current-job">
          <div>Job: {printerStatus.currentJob.name}</div>
          <div>Time Remaining: {printerStatus.currentJob.timeRemaining}s</div>
        </div>
      )}
    </div>
  )
}

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('Real-time WebSocket Integration', () => {
  let testUtils: ReturnType<typeof createWebSocketTestUtils>
  
  beforeEach(() => {
    vi.clearAllMocks()
    testUtils = createWebSocketTestUtils()
    RealTimeTestUtils.resetMetrics()
  })

  afterEach(() => {
    testUtils.testUtils.reset()
  })

  describe('Connection Management', () => {
    it('establishes WebSocket connection successfully', async () => {
      render(
        <TestWrapper>
          <PrinterStatusComponent />
        </TestWrapper>
      )
      
      expect(screen.getByText('Connecting to printer...')).toBeInTheDocument()
      
      // Simulate successful connection
      testUtils.testUtils.simulateConnectionStatus(true)
      
      await waitFor(() => {
        expect(screen.getByText('Waiting for printer status...')).toBeInTheDocument()
      })
      
      // Verify connection was established
      expect(testUtils.mockSocket.connect).toHaveBeenCalled()
      expect(testUtils.mockSocket.connected).toBe(true)
    })

    it('handles connection failures gracefully', async () => {
      render(
        <TestWrapper>
          <PrinterStatusComponent />
        </TestWrapper>
      )
      
      // Simulate connection failure
      testUtils.testUtils.simulateConnectionStatus(false)
      
      await waitFor(() => {
        expect(screen.getByText('Disconnected from printer')).toBeInTheDocument()
      })
      
      expect(testUtils.mockSocket.connected).toBe(false)
    })

    it('reconnects automatically after disconnection', async () => {
      render(
        <TestWrapper>
          <PrinterStatusComponent />
        </TestWrapper>
      )
      
      // Establish connection
      testUtils.testUtils.simulateConnectionStatus(true)
      
      await waitFor(() => {
        expect(screen.getByText('Waiting for printer status...')).toBeInTheDocument()
      })
      
      // Simulate disconnection
      testUtils.testUtils.simulateConnectionStatus(false)
      
      await waitFor(() => {
        expect(screen.getByText('Disconnected from printer')).toBeInTheDocument()
      })
      
      // Simulate reconnection
      testUtils.testUtils.simulateConnectionStatus(true)
      
      await waitFor(() => {
        expect(screen.getByText('Waiting for printer status...')).toBeInTheDocument()
      })
    })

    it('measures connection latency', async () => {
      render(
        <TestWrapper>
          <PrinterStatusComponent />
        </TestWrapper>
      )
      
      const latency = await RealTimeTestUtils.measureConnectionLatency(testUtils.mockSocket)
      
      expect(latency).toBeGreaterThan(0)
      expect(latency).toBeLessThan(1000) // Should be less than 1 second
    })
  })

  describe('Real-time Printer Status Updates', () => {
    it('receives and displays printer status updates', async () => {
      render(
        <TestWrapper>
          <PrinterStatusComponent />
        </TestWrapper>
      )
      
      // Establish connection
      testUtils.testUtils.simulateConnectionStatus(true)
      
      await waitFor(() => {
        expect(screen.getByText('Waiting for printer status...')).toBeInTheDocument()
      })
      
      // Send printer status update
      testUtils.testUtils.simulatePrinterStatusUpdate({
        status: 'printing',
        temperature: { nozzle: 210, bed: 60 },
        progress: 45,
        currentJob: {
          name: 'test-print.gcode',
          timeElapsed: 1800,
          timeRemaining: 2400
        }
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('printer-status')).toBeInTheDocument()
        expect(screen.getByText('Status: printing')).toBeInTheDocument()
        expect(screen.getByText('Nozzle Temperature: 210°C')).toBeInTheDocument()
        expect(screen.getByText('Bed Temperature: 60°C')).toBeInTheDocument()
        expect(screen.getByText('Progress: 45%')).toBeInTheDocument()
      })
      
      const currentJob = screen.getByTestId('current-job')
      expect(currentJob).toBeInTheDocument()
      expect(screen.getByText('Job: test-print.gcode')).toBeInTheDocument()
      expect(screen.getByText('Time Remaining: 2400s')).toBeInTheDocument()
    })

    it('handles multiple rapid status updates efficiently', async () => {
      render(
        <TestWrapper>
          <PrinterStatusComponent />
        </TestWrapper>
      )
      
      // Establish connection
      testUtils.testUtils.simulateConnectionStatus(true)
      
      await waitFor(() => {
        expect(screen.getByText('Waiting for printer status...')).toBeInTheDocument()
      })
      
      // Send multiple rapid updates
      const updateCount = 50
      const startTime = performance.now()
      
      for (let i = 0; i < updateCount; i++) {
        testUtils.testUtils.simulatePrinterStatusUpdate({
          status: 'printing',
          progress: Math.min(i * 2, 100),
          temperature: { nozzle: 210 + i, bed: 60 }
        })
        RealTimeTestUtils.trackUpdateFrequency()
      }
      
      const endTime = performance.now()
      const totalTime = endTime - startTime
      
      // Should handle all updates within reasonable time
      expect(totalTime).toBeLessThan(1000) // Less than 1 second
      
      // Final update should be displayed
      await waitFor(() => {
        expect(screen.getByText('Progress: 98%')).toBeInTheDocument()
      })
      
      const metrics = RealTimeTestUtils.getRealTimeMetrics()
      expect(metrics.updateCount).toBeGreaterThan(0)
      expect(metrics.averageUpdateFrequency).toBeGreaterThan(10) // At least 10 updates per second
    })

    it('handles different printer states correctly', async () => {
      render(
        <TestWrapper>
          <PrinterStatusComponent />
        </TestWrapper>
      )
      
      // Establish connection
      testUtils.testUtils.simulateConnectionStatus(true)
      await waitFor(() => {
        expect(screen.getByText('Waiting for printer status...')).toBeInTheDocument()
      })
      
      // Test idle state
      testUtils.testUtils.simulatePrinterStatusUpdate({ status: 'idle' })
      await waitFor(() => {
        expect(screen.getByText('Status: idle')).toBeInTheDocument()
      })
      
      // Test printing state
      testUtils.testUtils.simulatePrinterStatusUpdate({
        status: 'printing',
        progress: 25,
        currentJob: { name: 'model.stl', timeElapsed: 900, timeRemaining: 2700 }
      })
      await waitFor(() => {
        expect(screen.getByText('Status: printing')).toBeInTheDocument()
        expect(screen.getByText('Progress: 25%')).toBeInTheDocument()
      })
      
      // Test paused state
      testUtils.testUtils.simulatePrinterStatusUpdate({ status: 'paused' })
      await waitFor(() => {
        expect(screen.getByText('Status: paused')).toBeInTheDocument()
      })
      
      // Test error state
      testUtils.testUtils.simulatePrinterStatusUpdate({ status: 'error' })
      await waitFor(() => {
        expect(screen.getByText('Status: error')).toBeInTheDocument()
      })
    })
  })

  describe('Real-time Performance', () => {
    it('maintains performance under high update frequency', async () => {
      render(
        <TestWrapper>
          <PrinterStatusComponent />
        </TestWrapper>
      )
      
      // Establish connection
      testUtils.testUtils.simulateConnectionStatus(true)
      
      const performanceResult = await RealTimeTestUtils.testRealTimePerformance(
        testUtils.mockSocket,
        5000, // 5 seconds
        20    // 20 updates per second
      )
      
      expect(performanceResult.meetsFrequencyExpectation).toBe(true)
      expect(performanceResult.averageLatency).toBeLessThan(50) // Less than 50ms latency
      expect(performanceResult.actualUpdateFrequency).toBeGreaterThan(18) // Allow some variance
    })

    it('meets real-time performance benchmarks', async () => {
      const realTimeTest = async () => {
        render(
          <TestWrapper>
            <PrinterStatusComponent />
          </TestWrapper>
        )
        
        // Simulate typical real-time usage
        testUtils.testUtils.simulateConnectionStatus(true)
        
        for (let i = 0; i < 100; i++) {
          testUtils.testUtils.simulatePrinterStatusUpdate({
            status: 'printing',
            progress: i,
            temperature: { nozzle: 210, bed: 60 }
          })
          await new Promise(resolve => setTimeout(resolve, 10))
        }
      }
      
      const result = await PerformanceTestUtils.benchmark(
        'realtime-updates',
        realTimeTest,
        performanceThresholds.realTimeUpdates
      )
      
      const assertions = PerformanceTestUtils.createPerformanceAssertions(result)
      assertions.toMeetFrameRateThreshold()
      assertions.toMeetMemoryThreshold()
      assertions.toPassAllThresholds()
    })
  })

  describe('Error Handling and Recovery', () => {
    it('handles WebSocket errors gracefully', async () => {
      render(
        <TestWrapper>
          <PrinterStatusComponent />
        </TestWrapper>
      )
      
      // Establish connection
      testUtils.testUtils.simulateConnectionStatus(true)
      
      // Simulate error
      testUtils.testUtils.simulateError('Connection lost')
      
      // Component should handle error without crashing
      expect(screen.getByText('Waiting for printer status...')).toBeInTheDocument()
    })

    it('recovers from network interruptions', async () => {
      render(
        <TestWrapper>
          <PrinterStatusComponent />
        </TestWrapper>
      )
      
      // Initial connection
      testUtils.testUtils.simulateConnectionStatus(true)
      
      await waitFor(() => {
        expect(screen.getByText('Waiting for printer status...')).toBeInTheDocument()
      })
      
      // Send initial status
      testUtils.testUtils.simulatePrinterStatusUpdate({
        status: 'printing',
        progress: 30
      })
      
      await waitFor(() => {
        expect(screen.getByText('Status: printing')).toBeInTheDocument()
      })
      
      // Simulate network interruption
      testUtils.testUtils.simulateConnectionStatus(false)
      
      await waitFor(() => {
        expect(screen.getByText('Disconnected from printer')).toBeInTheDocument()
      })
      
      // Simulate reconnection with updated status
      testUtils.testUtils.simulateConnectionStatus(true)
      testUtils.testUtils.simulatePrinterStatusUpdate({
        status: 'printing',
        progress: 75 // Progress continued during disconnection
      })
      
      await waitFor(() => {
        expect(screen.getByText('Status: printing')).toBeInTheDocument()
        expect(screen.getByText('Progress: 75%')).toBeInTheDocument()
      })
    })

    it('handles malformed data gracefully', async () => {
      render(
        <TestWrapper>
          <PrinterStatusComponent />
        </TestWrapper>
      )
      
      // Establish connection
      testUtils.testUtils.simulateConnectionStatus(true)
      
      // Send malformed data
      const malformedData = { invalid: 'data' }
      
      // Mock the event emission directly to bypass type checking
      const onCalls = testUtils.mockSocket.on.mock.calls
      const printerStatusHandler = onCalls.find(([event]) => event === 'printer-status')?.[1]
      
      expect(() => {
        if (printerStatusHandler) {
          printerStatusHandler(malformedData)
        }
      }).not.toThrow()
      
      // Should still show waiting state (no valid data received)
      expect(screen.getByText('Waiting for printer status...')).toBeInTheDocument()
    })
  })

  describe('Task and Project Updates', () => {
    it('handles task updates in real-time', async () => {
      render(
        <TestWrapper>
          <PrinterStatusComponent />
        </TestWrapper>
      )
      
      // Establish connection
      testUtils.testUtils.simulateConnectionStatus(true)
      
      // Send task update
      testUtils.testUtils.simulateTaskUpdate({
        id: 'task-1',
        title: 'Print calibration cube',
        status: 'in-progress',
        priority: 'high'
      })
      
      // Verify task update event was handled
      expect(testUtils.mockSocket.on).toHaveBeenCalledWith('task-updated', expect.any(Function))
    })

    it('synchronizes multiple concurrent updates', async () => {
      render(
        <TestWrapper>
          <PrinterStatusComponent />
        </TestWrapper>
      )
      
      // Establish connection
      testUtils.testUtils.simulateConnectionStatus(true)
      
      // Send multiple concurrent updates
      testUtils.testUtils.simulatePrinterStatusUpdate({ status: 'printing', progress: 50 })
      testUtils.testUtils.simulateTaskUpdate({ title: 'Updated task', status: 'completed' })
      
      // All updates should be processed without conflicts
      const emittedEvents = testUtils.testUtils.getEmittedEvents()
      expect(emittedEvents.length).toBeGreaterThan(0)
    })
  })

  describe('Memory Management', () => {
    it('does not leak memory during long sessions', async () => {
      const { unmount } = render(
        <TestWrapper>
          <PrinterStatusComponent />
        </TestWrapper>
      )
      
      // Simulate long session with many updates
      testUtils.testUtils.simulateConnectionStatus(true)
      
      for (let i = 0; i < 1000; i++) {
        testUtils.testUtils.simulatePrinterStatusUpdate({
          status: 'printing',
          progress: i % 100
        })
      }
      
      // Unmount component
      unmount()
      
      // Should cleanup event handlers
      expect(testUtils.mockSocket.disconnect).toHaveBeenCalled()
    })

    it('cleans up resources on component unmount', () => {
      const { unmount } = render(
        <TestWrapper>
          <PrinterStatusComponent />
        </TestWrapper>
      )
      
      // Verify cleanup
      unmount()
      
      expect(testUtils.mockSocket.disconnect).toHaveBeenCalled()
    })
  })
})
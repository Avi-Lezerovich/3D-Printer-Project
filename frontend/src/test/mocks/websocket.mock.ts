/**
 * WebSocket and Socket.io mocking utilities
 * Provides comprehensive mocking for real-time functionality testing
 */

export interface MockSocketInstance {
  id: string
  connected: boolean
  emit: ReturnType<typeof vi.fn>
  on: ReturnType<typeof vi.fn>
  off: ReturnType<typeof vi.fn>
  connect: ReturnType<typeof vi.fn>
  disconnect: ReturnType<typeof vi.fn>
  join: ReturnType<typeof vi.fn>
  leave: ReturnType<typeof vi.fn>
}

export interface MockSocketEvents {
  'printer-status': (status: PrinterStatus) => void
  'task-created': (task: Task) => void
  'task-updated': (task: Task) => void
  'project-update': (project: Project) => void
  'error': (error: string) => void
  connect: () => void
  disconnect: () => void
}

export interface PrinterStatus {
  id: string
  status: 'idle' | 'printing' | 'paused' | 'error'
  temperature: {
    nozzle: number
    bed: number
  }
  progress: number
  currentJob?: {
    name: string
    timeElapsed: number
    timeRemaining: number
  }
}

export interface Task {
  id: string
  title: string
  status: 'todo' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  assigneeId?: string
  projectId?: string
}

export interface Project {
  id: string
  name: string
  status: 'active' | 'completed' | 'paused'
  tasks: Task[]
}

/**
 * Creates a mock Socket.io client instance
 */
export function createMockSocket(): MockSocketInstance {
  const eventHandlers = new Map<string, Function[]>()
  
  return {
    id: `mock-socket-${Date.now()}`,
    connected: true,
    
    emit: vi.fn((event: string, data?: any) => {
      // Simulate server response for certain events
      if (event === 'join-project' && data) {
        setTimeout(() => {
          const handlers = eventHandlers.get('project-update') || []
          handlers.forEach(handler => handler({ id: data, name: 'Mock Project' }))
        }, 10)
      }
    }),
    
    on: vi.fn((event: string, handler: Function) => {
      if (!eventHandlers.has(event)) {
        eventHandlers.set(event, [])
      }
      eventHandlers.get(event)!.push(handler)
    }),
    
    off: vi.fn((event: string, handler?: Function) => {
      if (handler) {
        const handlers = eventHandlers.get(event) || []
        const index = handlers.indexOf(handler)
        if (index > -1) {
          handlers.splice(index, 1)
        }
      } else {
        eventHandlers.delete(event)
      }
    }),
    
    connect: vi.fn(() => {
      setTimeout(() => {
        const handlers = eventHandlers.get('connect') || []
        handlers.forEach(handler => handler())
      }, 10)
      return mockSocket
    }),
    
    disconnect: vi.fn(() => {
      setTimeout(() => {
        const handlers = eventHandlers.get('disconnect') || []
        handlers.forEach(handler => handler())
      }, 10)
      return mockSocket
    }),
    
    join: vi.fn((room: string) => {
      // Mock room joining
    }),
    
    leave: vi.fn((room: string) => {
      // Mock room leaving
    })
  }
}

/**
 * Mock Socket.io library
 */
export const mockSocketIo = {
  io: vi.fn(() => createMockSocket()),
  connect: vi.fn(() => createMockSocket())
}

/**
 * Test utilities for WebSocket scenarios
 */
export class WebSocketTestUtils {
  private mockSocket: MockSocketInstance
  
  constructor(mockSocket: MockSocketInstance) {
    this.mockSocket = mockSocket
  }
  
  /**
   * Simulate receiving a printer status update
   */
  simulatePrinterStatusUpdate(status: Partial<PrinterStatus>) {
    const fullStatus: PrinterStatus = {
      id: 'printer-1',
      status: 'idle',
      temperature: { nozzle: 200, bed: 60 },
      progress: 0,
      ...status
    }
    
    this.emitEvent('printer-status', fullStatus)
  }
  
  /**
   * Simulate receiving a task update
   */
  simulateTaskUpdate(task: Partial<Task>) {
    const fullTask: Task = {
      id: 'task-1',
      title: 'Test Task',
      status: 'todo',
      priority: 'medium',
      ...task
    }
    
    this.emitEvent('task-updated', fullTask)
  }
  
  /**
   * Simulate connection/disconnection events
   */
  simulateConnectionStatus(connected: boolean) {
    this.mockSocket.connected = connected
    this.emitEvent(connected ? 'connect' : 'disconnect')
  }
  
  /**
   * Simulate network error
   */
  simulateError(message: string) {
    this.emitEvent('error', message)
  }
  
  /**
   * Helper to emit events to registered handlers
   */
  private emitEvent(event: string, data?: any) {
    // Access the mock's internal event handlers and trigger them
    const onCalls = this.mockSocket.on.mock.calls
    onCalls
      .filter(([eventName]) => eventName === event)
      .forEach(([, handler]) => {
        setTimeout(() => handler(data), 10)
      })
  }
  
  /**
   * Get all emitted events for testing
   */
  getEmittedEvents(): Array<{event: string, data: any}> {
    return this.mockSocket.emit.mock.calls.map(([event, data]) => ({
      event,
      data
    }))
  }
  
  /**
   * Reset all mocks
   */
  reset() {
    vi.clearAllMocks()
  }
}

/**
 * Create test utilities with a mock socket
 */
export function createWebSocketTestUtils(): {
  mockSocket: MockSocketInstance
  testUtils: WebSocketTestUtils
} {
  const mockSocket = createMockSocket()
  const testUtils = new WebSocketTestUtils(mockSocket)
  
  return { mockSocket, testUtils }
}
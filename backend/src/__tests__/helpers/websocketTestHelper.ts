/**
 * WebSocket Testing Helpers
 * Comprehensive utilities for testing real-time functionality
 */

import { Server as HttpServer } from 'http'
import { io as Client, Socket } from 'socket.io-client'
import { AddressInfo } from 'net'
import jwt from 'jsonwebtoken'
import { securityConfig } from '../../config/index.js'

export interface SocketTestEvent {
  event: string
  data: any
  timestamp: number
  socketId?: string
}

export class WebSocketTestHelper {
  private server: HttpServer | null = null
  private clients: Socket[] = []
  private eventLogs: SocketTestEvent[] = []

  constructor(private app: any) {}

  /**
   * Start test server and create authenticated socket connections
   */
  async startServer(): Promise<{ port: number; url: string }> {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(0, '127.0.0.1', (err: any) => {
        if (err) return reject(err)
        
        const address = this.server!.address() as AddressInfo
        const port = address.port
        const url = `http://127.0.0.1:${port}`
        
        resolve({ port, url })
      })
    })
  }

  /**
   * Create authenticated socket client
   */
  async createClient(
    serverUrl: string,
    userEmail = 'test@example.com',
    role = 'user',
    options: any = {}
  ): Promise<Socket> {
    const token = jwt.sign(
      { email: userEmail, role, sub: userEmail },
      securityConfig.jwt.secret,
      { expiresIn: '5m' }
    )

    const client = Client(serverUrl, {
      auth: { token },
      transports: ['websocket'],
      timeout: 2000,
      forceNew: true,
      ...options
    })

    // Log all events for testing
    client.onAny((event, ...args) => {
      this.eventLogs.push({
        event,
        data: args,
        timestamp: Date.now(),
        socketId: client.id
      })
    })

    // Wait for connection or failure
    const connected = await new Promise<boolean>((resolve) => {
      const timeout = setTimeout(() => resolve(false), 3000)
      
      client.on('connect', () => {
        clearTimeout(timeout)
        resolve(true)
      })
      
      client.on('connect_error', () => {
        clearTimeout(timeout)
        resolve(false)
      })
    })

    if (!connected) {
      throw new Error('Failed to connect WebSocket client')
    }

    this.clients.push(client)
    return client
  }

  /**
   * Create multiple authenticated clients
   */
  async createMultipleClients(
    serverUrl: string,
    count: number,
    baseEmail = 'user'
  ): Promise<Socket[]> {
    const clients: Socket[] = []
    
    for (let i = 0; i < count; i++) {
      const email = `${baseEmail}${i}@example.com`
      const client = await this.createClient(serverUrl, email)
      clients.push(client)
    }
    
    return clients
  }

  /**
   * Wait for specific event on client
   */
  async waitForEvent(
    client: Socket,
    eventName: string,
    timeout = 5000
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timeout waiting for event: ${eventName}`))
      }, timeout)

      client.once(eventName, (data) => {
        clearTimeout(timer)
        resolve(data)
      })
    })
  }

  /**
   * Wait for multiple events across different clients
   */
  async waitForEvents(
    expectations: Array<{
      client: Socket
      event: string
      validator?: (data: any) => boolean
    }>,
    timeout = 5000
  ): Promise<any[]> {
    const results: any[] = []
    
    const promises = expectations.map((exp, index) => {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error(`Timeout waiting for event: ${exp.event} on client ${index}`))
        }, timeout)

        exp.client.on(exp.event, (data) => {
          if (!exp.validator || exp.validator(data)) {
            clearTimeout(timer)
            results[index] = data
            resolve(data)
          }
        })
      })
    })

    await Promise.all(promises)
    return results
  }

  /**
   * Simulate connection issues
   */
  async simulateDisconnection(client: Socket): Promise<void> {
    client.disconnect()
    // Wait a bit for the disconnection to process
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  async simulateReconnection(client: Socket): Promise<void> {
    client.connect()
    await this.waitForEvent(client, 'connect')
  }

  /**
   * Test message broadcasting
   */
  async testBroadcast(
    clients: Socket[],
    triggerAction: () => Promise<void>,
    expectedEvent: string,
    validator?: (data: any) => boolean
  ): Promise<any[]> {
    const eventPromises = clients.map(client => 
      this.waitForEvent(client, expectedEvent)
    )

    // Trigger the action that should cause broadcast
    await triggerAction()

    const results = await Promise.all(eventPromises)
    
    if (validator) {
      results.forEach(result => {
        if (!validator(result)) {
          throw new Error('Broadcast validation failed')
        }
      })
    }

    return results
  }

  /**
   * Test room-based messaging
   */
  async testRoomMessaging(
    clients: Socket[],
    roomName: string,
    joinRoomEvent: string,
    testEvent: string
  ): Promise<void> {
    // Have some clients join the room
    const roomClients = clients.slice(0, Math.floor(clients.length / 2))
    const nonRoomClients = clients.slice(Math.floor(clients.length / 2))

    // Join room
    for (const client of roomClients) {
      client.emit(joinRoomEvent, { room: roomName })
    }

    // Wait a bit for room joins to process
    await new Promise(resolve => setTimeout(resolve, 100))

    // Set up listeners
    const roomPromises = roomClients.map(client => 
      this.waitForEvent(client, testEvent)
    )

    // Non-room clients should not receive the event
    const nonRoomPromises = nonRoomClients.map(client => {
      return new Promise((resolve) => {
        const timeout = setTimeout(() => resolve('no-event'), 500)
        client.once(testEvent, () => {
          clearTimeout(timeout)
          resolve('unexpected-event')
        })
      })
    })

    // Emit event to room (this should be done by your server logic)
    // The actual implementation depends on your server-side code

    const roomResults = await Promise.all(roomPromises)
    const nonRoomResults = await Promise.all(nonRoomPromises)

    // Verify room clients received the event
    expect(roomResults).toHaveLength(roomClients.length)
    
    // Verify non-room clients didn't receive the event
    nonRoomResults.forEach(result => {
      expect(result).toBe('no-event')
    })
  }

  /**
   * Test rate limiting on WebSocket
   */
  async testRateLimit(
  client: Socket,
  event: string,
  data: any,
  maxRequests: number,
  _timeWindow: number
  ): Promise<{ successful: number; blocked: number }> {
    let successful = 0
    let blocked = 0

    const promises: Promise<void>[] = []
    
    for (let i = 0; i < maxRequests + 5; i++) {
      const promise = new Promise<void>((resolve) => {
        client.emit(event, data, (response: any) => {
          if (response && response.error && response.error.includes('rate limit')) {
            blocked++
          } else {
            successful++
          }
          resolve()
        })
      })
      promises.push(promise)
    }

    await Promise.all(promises)
    
    return { successful, blocked }
  }

  /**
   * Performance testing for WebSocket
   */
  async performanceTest(
    serverUrl: string,
    concurrentClients: number,
    messagesPerClient: number,
    messageInterval: number = 10
  ): Promise<{
    totalMessages: number
    totalTime: number
    messagesPerSecond: number
    averageLatency: number
    errors: number
  }> {
    const clients: Socket[] = []
    const startTime = Date.now()
    let totalMessages = 0
    let totalLatency = 0
    let errors = 0

    try {
      // Create clients
      for (let i = 0; i < concurrentClients; i++) {
        const client = await this.createClient(serverUrl, `perf${i}@example.com`)
        clients.push(client)
      }

      // Send messages concurrently
      const messagePromises: Promise<void>[] = []
      
      for (let clientIndex = 0; clientIndex < clients.length; clientIndex++) {
        const client = clients[clientIndex]
        
        for (let msgIndex = 0; msgIndex < messagesPerClient; msgIndex++) {
          const promise = new Promise<void>((resolve) => {
            setTimeout(() => {
              const sendTime = Date.now()
              
              client.emit('test-performance', { 
                clientIndex, 
                msgIndex, 
                timestamp: sendTime 
              }, (response: any) => {
                if (response && response.error) {
                  errors++
                } else {
                  totalMessages++
                  totalLatency += Date.now() - sendTime
                }
                resolve()
              })
            }, msgIndex * messageInterval)
          })
          
          messagePromises.push(promise)
        }
      }

      await Promise.all(messagePromises)
      
    } finally {
      // Cleanup
      clients.forEach(client => client.disconnect())
    }

    const totalTime = Date.now() - startTime
    
    return {
      totalMessages,
      totalTime,
      messagesPerSecond: totalMessages / (totalTime / 1000),
      averageLatency: totalMessages > 0 ? totalLatency / totalMessages : 0,
      errors
    }
  }

  /**
   * Get event logs for debugging
   */
  getEventLogs(eventFilter?: string): SocketTestEvent[] {
    return eventFilter 
      ? this.eventLogs.filter(log => log.event === eventFilter)
      : this.eventLogs
  }

  /**
   * Clear event logs
   */
  clearEventLogs(): void {
    this.eventLogs = []
  }

  /**
   * Clean up all connections and server
   */
  async cleanup(): Promise<void> {
    // Disconnect all clients
    this.clients.forEach(client => {
      if (client.connected) {
        client.disconnect()
      }
    })
    this.clients = []

    // Close server
    if (this.server) {
      return new Promise((resolve, reject) => {
        this.server!.close((err) => {
          if (err) reject(err)
          else resolve()
        })
      })
    }
  }
}

/**
 * Helper function for setting up WebSocket tests
 */
export function setupWebSocketTest(app: any) {
  let wsHelper: WebSocketTestHelper
  let serverUrl: string

  beforeAll(async () => {
    wsHelper = new WebSocketTestHelper(app)
    const { url } = await wsHelper.startServer()
    serverUrl = url
  })

  afterAll(async () => {
    await wsHelper.cleanup()
  })

  beforeEach(() => {
    wsHelper.clearEventLogs()
  })

  return {
    get helper() { return wsHelper },
    get serverUrl() { return serverUrl }
  }
}
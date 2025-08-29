import { Server as SocketIOServer, Socket } from 'socket.io';
import { EventEmitter } from 'events';
import { PrinterInfo, PrintJob, PrinterError, PrintJobStatus } from '../types.js';
import { ProcessedData, Anomaly } from '../../realtime/DataProcessor.js';
import { logger } from '../../utils/logger.js';

export interface BroadcastEvent {
  type: string;
  data: any;
  timestamp: Date;
  targetRoom?: string;
  metadata?: Record<string, any>;
}

export interface ClientSubscription {
  socketId: string;
  userId?: string;
  subscribedPrinters: Set<string>;
  subscribedEvents: Set<string>;
  lastActivity: Date;
}

interface SocketWithUser extends Socket {
  userId?: string;
  subscribedPrinters?: Set<string>;
}

export class PrinterEventBroadcaster extends EventEmitter {
  private io: SocketIOServer;
  private connectedSockets = new Map<string, SocketWithUser>();
  private printerSubscriptions = new Map<string, Set<string>>(); // printerId -> Set<socketId>
  private userPermissions = new Map<string, Set<string>>(); // userId -> Set<printerId>
  private roomSubscriptions = new Map<string, Set<string>>(); // room -> socketIds
  private eventRateLimits = new Map<string, { count: number; resetTime: number }>();
  private compressionEnabled = true;
  private batchingEnabled = true;
  private batchBuffer: BroadcastEvent[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 10;
  private readonly BATCH_DELAY = 50; // ms

  constructor(io: SocketIOServer) {
    super();
    this.io = io;
    this.setupSocketHandlers();
    this.setupEventHandlers();
  }

  public subscribeToPrinter(socketId: string, printerId: string): void {
    const socket = this.connectedSockets.get(socketId);
    if (!socket) {
      logger.warn(`Socket ${socketId} not found for printer subscription`);
      return;
    }

    // Check user permissions
    const userId = socket.userId;
    if (userId && !this.hasPermission(userId, printerId)) {
      socket.emit('error', { message: 'Permission denied for printer access' });
      return;
    }

    // Add subscription
    if (!socket.subscribedPrinters) {
      socket.subscribedPrinters = new Set();
    }
    socket.subscribedPrinters.add(printerId);

    if (!this.printerSubscriptions.has(printerId)) {
      this.printerSubscriptions.set(printerId, new Set());
    }
    this.printerSubscriptions.get(printerId)!.add(socketId);

    logger.debug(`Socket ${socketId} subscribed to printer ${printerId}`);
    socket.emit('printerSubscribed', { printerId });
  }

  public unsubscribeFromPrinter(socketId: string, printerId: string): void {
    const socket = this.connectedSockets.get(socketId);
    if (socket && socket.subscribedPrinters) {
      socket.subscribedPrinters.delete(printerId);
    }

    const subscribers = this.printerSubscriptions.get(printerId);
    if (subscribers) {
      subscribers.delete(socketId);
      if (subscribers.size === 0) {
        this.printerSubscriptions.delete(printerId);
      }
    }

    logger.debug(`Socket ${socketId} unsubscribed from printer ${printerId}`);
  }

  public broadcastPrinterStatus(status: PrinterInfo): void {
    const subscribers = this.printerSubscriptions.get(status.id);
    if (!subscribers || subscribers.size === 0) return;

    const message = {
      type: 'printerStatus',
      data: status,
      timestamp: new Date()
    };

    subscribers.forEach(socketId => {
      const socket = this.connectedSockets.get(socketId);
      if (socket) {
        socket.emit('printerStatusUpdate', message);
      }
    });

    logger.debug(`Broadcasted status update for printer ${status.id} to ${subscribers.size} clients`);
  }

  public broadcastPrintJobUpdate(job: PrintJob): void {
    const subscribers = this.printerSubscriptions.get(job.printerId);
    if (!subscribers || subscribers.size === 0) return;

    const message = {
      type: 'printJobUpdate',
      data: job,
      timestamp: new Date()
    };

    subscribers.forEach(socketId => {
      const socket = this.connectedSockets.get(socketId);
      if (socket) {
        socket.emit('printJobUpdate', message);
      }
    });

    logger.debug(`Broadcasted job update for printer ${job.printerId} to ${subscribers.size} clients`);
  }

  public broadcastPrinterError(printerId: string, error: PrinterError): void {
    const subscribers = this.printerSubscriptions.get(printerId);
    if (!subscribers || subscribers.size === 0) return;

    const message = {
      type: 'printerError',
      data: { printerId, error },
      timestamp: new Date()
    };

    subscribers.forEach(socketId => {
      const socket = this.connectedSockets.get(socketId);
      if (socket) {
        socket.emit('printerError', message);
      }
    });

    logger.warn(`Broadcasted error for printer ${printerId} to ${subscribers.size} clients`);
  }

  public broadcastTemperatureUpdate(printerId: string, temperature: any): void {
    const subscribers = this.printerSubscriptions.get(printerId);
    if (!subscribers || subscribers.size === 0) return;

    const message = {
      type: 'temperatureUpdate',
      data: { printerId, temperature },
      timestamp: new Date()
    };

    subscribers.forEach(socketId => {
      const socket = this.connectedSockets.get(socketId);
      if (socket) {
        socket.emit('temperatureUpdate', message);
      }
    });
  }

  public broadcastPositionUpdate(printerId: string, position: any): void {
    const subscribers = this.printerSubscriptions.get(printerId);
    if (!subscribers || subscribers.size === 0) return;

    const message = {
      type: 'positionUpdate',
      data: { printerId, position },
      timestamp: new Date()
    };

    subscribers.forEach(socketId => {
      const socket = this.connectedSockets.get(socketId);
      if (socket) {
        socket.emit('positionUpdate', message);
      }
    });
  }

  public broadcastPrintProgress(printerId: string, progress: number, timeRemaining?: number): void {
    const subscribers = this.printerSubscriptions.get(printerId);
    if (!subscribers || subscribers.size === 0) return;

    const message = {
      type: 'printProgress',
      data: { printerId, progress, timeRemaining },
      timestamp: new Date()
    };

    subscribers.forEach(socketId => {
      const socket = this.connectedSockets.get(socketId);
      if (socket) {
        socket.emit('printProgress', message);
      }
    });
  }

  public broadcastQueueUpdate(queue: PrintJob[]): void {
    const event: BroadcastEvent = {
      type: 'queue.update',
      data: queue,
      timestamp: new Date(),
      targetRoom: 'queue',
      metadata: { queue: true }
    };

    this.broadcastEvent(event);
  }

  public broadcastPrinterEvent(eventType: 'connected' | 'disconnected' | 'statusUpdate' | 'error', 
                              printerId: string, data: any): void {
    const event: BroadcastEvent = {
      type: `printer.${eventType}`,
      data: { printerId, ...data },
      timestamp: new Date(),
      targetRoom: `printer:${printerId}`,
      metadata: { printerId }
    };

    this.broadcastEvent(event);
  }

  public broadcastPrintEvent(eventType: 'started' | 'paused' | 'resumed' | 'cancelled' | 'completed',
                           printerId: string, jobData: any): void {
    const event: BroadcastEvent = {
      type: `print.${eventType}`,
      data: { printerId, ...jobData },
      timestamp: new Date(),
      targetRoom: `printer:${printerId}`,
      metadata: { printerId }
    };

    this.broadcastEvent(event);
  }

  public broadcastQueueEvent(eventType: 'jobAdded' | 'jobStarted' | 'jobCompleted' | 'jobFailed' | 'queueUpdated',
                           data: any): void {
    const event: BroadcastEvent = {
      type: `queue.${eventType}`,
      data,
      timestamp: new Date(),
      targetRoom: 'queue',
      metadata: { queue: true }
    };

    this.broadcastEvent(event);
  }

  public broadcastDataUpdate(processedData: ProcessedData): void {
    const event: BroadcastEvent = {
      type: 'data.update',
      data: processedData,
      timestamp: new Date(),
      targetRoom: `printer:${processedData.printerId}`,
      metadata: { printerId: processedData.printerId, dataType: 'processed' }
    };

    this.broadcastEvent(event);
  }

  public broadcastAnomalies(printerId: string, anomalies: Anomaly[]): void {
    const event: BroadcastEvent = {
      type: 'anomalies.detected',
      data: { printerId, anomalies },
      timestamp: new Date(),
      targetRoom: `printer:${printerId}`,
      metadata: { printerId, severity: 'high' }
    };

    // Anomalies are high priority - broadcast immediately
    this.broadcastEventImmediate(event);
  }

  public broadcastSystemAlert(alert: { type: string; message: string; severity: string; data?: any }): void {
    const event: BroadcastEvent = {
      type: 'system.alert',
      data: alert,
      timestamp: new Date(),
      metadata: { severity: alert.severity }
    };

    this.broadcastEventImmediate(event);
  }

  private broadcastEvent(event: BroadcastEvent): void {
    if (this.batchingEnabled && event.metadata?.severity !== 'high') {
      this.addToBatch(event);
    } else {
      this.broadcastEventImmediate(event);
    }
  }

  private broadcastEventImmediate(event: BroadcastEvent): void {
    try {
      // Check rate limiting
      if (!this.checkRateLimit(event.type)) {
        logger.warn(`Rate limit exceeded for event type: ${event.type}`);
        return;
      }

      // Determine target sockets
      const targetSockets = this.getTargetSockets(event);
      
      if (targetSockets.length === 0) {
        return; // No clients interested in this event
      }

      // Prepare event data
      const eventData = this.prepareEventData(event);

      // Broadcast to target sockets
      if (event.targetRoom) {
        this.io.to(event.targetRoom).emit(event.type, eventData);
      } else {
        targetSockets.forEach(socketId => {
          this.io.to(socketId).emit(event.type, eventData);
        });
      }

      // Emit internal event for logging/metrics
      this.emit('eventBroadcast', { event, targetCount: targetSockets.length });
      
      logger.debug(`Broadcasted ${event.type} to ${targetSockets.length} clients`);
    } catch (error) {
      logger.error(`Failed to broadcast event ${event.type}:`, error);
    }
  }

  private addToBatch(event: BroadcastEvent): void {
    this.batchBuffer.push(event);

    if (this.batchBuffer.length >= this.BATCH_SIZE) {
      this.flushBatch();
    } else if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(() => {
        this.flushBatch();
      }, this.BATCH_DELAY);
    }
  }

  private flushBatch(): void {
    if (this.batchBuffer.length === 0) return;

    const batch = [...this.batchBuffer];
    this.batchBuffer = [];
    
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    // Group events by target room/socket for efficient broadcasting
    const eventGroups = new Map<string, BroadcastEvent[]>();
    
    batch.forEach(event => {
      const key = event.targetRoom || 'global';
      if (!eventGroups.has(key)) {
        eventGroups.set(key, []);
      }
      eventGroups.get(key)!.push(event);
    });

    // Broadcast each group
    eventGroups.forEach((events, target) => {
      const batchedEvent: BroadcastEvent = {
        type: 'batch.update',
        data: { events: events.map(e => this.prepareEventData(e)) },
        timestamp: new Date()
      };

      if (target === 'global') {
        this.io.emit(batchedEvent.type, batchedEvent.data);
      } else {
        this.io.to(target).emit(batchedEvent.type, batchedEvent.data);
      }
    });

    logger.debug(`Flushed batch of ${batch.length} events`);
  }

  private getTargetSockets(event: BroadcastEvent): string[] {
    const targetSockets: string[] = [];

    // If event has a specific room, get all sockets in that room
    if (event.targetRoom) {
      const roomSockets = this.roomSubscriptions.get(event.targetRoom);
      if (roomSockets) {
        return Array.from(roomSockets);
      }
    }

    // Otherwise, filter based on subscriptions
    this.connectedSockets.forEach((socket, socketId) => {
      // Check printer-specific subscriptions
      if (event.metadata?.printerId) {
        if (socket.subscribedPrinters && socket.subscribedPrinters.has(event.metadata.printerId)) {
          targetSockets.push(socketId);
        }
      } else {
        // Global events go to all clients
        targetSockets.push(socketId);
      }
    });

    return targetSockets;
  }

  private prepareEventData(event: BroadcastEvent): any {
    let eventData = {
      type: event.type,
      data: event.data,
      timestamp: event.timestamp,
      metadata: event.metadata
    };

    // Apply compression if enabled
    if (this.compressionEnabled && JSON.stringify(eventData).length > 1024) {
      eventData = this.compressEventData(eventData);
    }

    return eventData;
  }

  private compressEventData(eventData: any): any {
    // Simple compression logic - could be enhanced with actual compression
    return {
      ...eventData,
      _compressed: true
    };
  }

  private checkRateLimit(eventType: string): boolean {
    const now = Date.now();
    const windowMs = 1000; // 1 second window
    const maxEvents = 100; // max events per window

    const limit = this.eventRateLimits.get(eventType);
    
    if (!limit || now > limit.resetTime) {
      this.eventRateLimits.set(eventType, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }

    if (limit.count >= maxEvents) {
      return false;
    }

    limit.count++;
    return true;
  }

  public broadcastSystemMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    const broadcastMessage = {
      type: 'systemMessage',
      data: { message, level },
      timestamp: new Date()
    };

    this.io.emit('systemMessage', broadcastMessage);
    logger.info(`Broadcasted system message: ${message}`);
  }

  public setUserPermissions(userId: string, printerIds: string[]): void {
    this.userPermissions.set(userId, new Set(printerIds));
    logger.debug(`Set permissions for user ${userId}: ${printerIds.join(', ')}`);
  }

  public getUserPermissions(userId: string): string[] {
    return Array.from(this.userPermissions.get(userId) || []);
  }

  public getConnectedClientsCount(): number {
    return this.connectedSockets.size;
  }

  public getPrinterSubscriptionCount(printerId: string): number {
    return this.printerSubscriptions.get(printerId)?.size || 0;
  }

  public getConnectionStats(): any {
    const stats = {
      totalConnections: this.connectedSockets.size,
      totalSubscriptions: 0,
      printerSubscriptions: {} as Record<string, number>
    };

    this.printerSubscriptions.forEach((subscribers, printerId) => {
      stats.printerSubscriptions[printerId] = subscribers.size;
      stats.totalSubscriptions += subscribers.size;
    });

    return stats;
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket: SocketWithUser) => {
      const socketId = socket.id;
      this.connectedSockets.set(socketId, socket);
      
      logger.info(`Client connected: ${socketId}`);

      // Handle authentication
      socket.on('authenticate', (data: { token: string }) => {
        this.authenticateSocket(socket, data.token);
      });

      // Handle printer subscriptions
      socket.on('subscribeToPrinter', (data: { printerId: string }) => {
        this.subscribeToPrinter(socketId, data.printerId);
      });

      socket.on('unsubscribeFromPrinter', (data: { printerId: string }) => {
        this.unsubscribeFromPrinter(socketId, data.printerId);
      });

      // Handle printer control commands
      socket.on('printerCommand', (data: { printerId: string; command: any }) => {
        this.handlePrinterCommand(socket, data.printerId, data.command);
      });

      // Handle queue operations
      socket.on('queueOperation', (data: { operation: string; jobId?: string; jobData?: any }) => {
        this.handleQueueOperation(socket, data);
      });

      // Handle file upload events
      socket.on('fileUpload', (data: { printerId: string; fileName: string; progress: number }) => {
        this.broadcastFileUploadProgress(data.printerId, data.fileName, data.progress);
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        this.handleDisconnection(socketId, reason);
      });

      // Handle errors
      socket.on('error', (error) => {
        logger.error(`Socket error for ${socketId}:`, error);
      });

      // Send initial connection confirmation
      socket.emit('connected', {
        socketId,
        timestamp: new Date(),
        message: 'Connected to 3D Printer System'
      });
    });
  }

  private setupEventHandlers(): void {
    // These events would be emitted by the printer handlers
    this.on('printerConnected', (printerId: string) => {
      this.broadcastSystemMessage(`Printer ${printerId} connected`, 'info');
    });

    this.on('printerDisconnected', (printerId: string) => {
      this.broadcastSystemMessage(`Printer ${printerId} disconnected`, 'warning');
    });

    this.on('printStarted', (data: { printerId: string; fileName: string }) => {
      this.broadcastSystemMessage(`Started printing ${data.fileName} on printer ${data.printerId}`, 'info');
    });

    this.on('printCompleted', (data: { printerId: string; fileName: string }) => {
      this.broadcastSystemMessage(`Completed printing ${data.fileName} on printer ${data.printerId}`, 'info');
    });

    this.on('printFailed', (data: { printerId: string; fileName: string; error: string }) => {
      this.broadcastSystemMessage(`Print failed: ${data.error}`, 'error');
    });
  }

  private authenticateSocket(socket: SocketWithUser, token: string): void {
    try {
      // This would validate the JWT token and extract user info
      // For now, we'll simulate authentication
      const userId = this.extractUserIdFromToken(token);
      
      if (userId) {
        socket.userId = userId;
        socket.emit('authenticated', { userId });
        logger.debug(`Socket ${socket.id} authenticated as user ${userId}`);
      } else {
        socket.emit('authenticationFailed', { message: 'Invalid token' });
      }
    } catch (error) {
      socket.emit('authenticationFailed', { message: 'Authentication error' });
      logger.error(`Authentication failed for socket ${socket.id}:`, error);
    }
  }

  private extractUserIdFromToken(token: string): string | null {
    // This would decode and validate a JWT token
    // For demonstration purposes, returning a mock user ID
    return token ? 'user-123' : null;
  }

  private hasPermission(userId: string, printerId: string): boolean {
    const permissions = this.userPermissions.get(userId);
    return permissions?.has(printerId) || permissions?.has('*') || false;
  }

  private handlePrinterCommand(socket: SocketWithUser, printerId: string, command: any): void {
    const userId = socket.userId;
    
    if (userId && !this.hasPermission(userId, printerId)) {
      socket.emit('commandError', { message: 'Permission denied' });
      return;
    }

    // Emit command to printer manager
    this.emit('printerCommand', { printerId, command, socketId: socket.id });
  }

  private handleQueueOperation(socket: SocketWithUser, data: any): void {
    const userId = socket.userId;
    
    // Basic permission check for queue operations
    if (!userId) {
      socket.emit('queueError', { message: 'Authentication required' });
      return;
    }

    // Emit queue operation to queue manager
    this.emit('queueOperation', { ...data, userId, socketId: socket.id });
  }

  private broadcastFileUploadProgress(printerId: string, fileName: string, progress: number): void {
    const subscribers = this.printerSubscriptions.get(printerId);
    if (!subscribers || subscribers.size === 0) return;

    const message = {
      type: 'fileUploadProgress',
      data: { printerId, fileName, progress },
      timestamp: new Date()
    };

    subscribers.forEach(socketId => {
      const socket = this.connectedSockets.get(socketId);
      if (socket) {
        socket.emit('fileUploadProgress', message);
      }
    });
  }

  private handleDisconnection(socketId: string, reason: string): void {
    const socket = this.connectedSockets.get(socketId);
    
    if (socket && socket.subscribedPrinters) {
      // Clean up subscriptions
      socket.subscribedPrinters.forEach(printerId => {
        this.unsubscribeFromPrinter(socketId, printerId);
      });
    }

    this.connectedSockets.delete(socketId);
    logger.info(`Client disconnected: ${socketId} (${reason})`);
  }
}
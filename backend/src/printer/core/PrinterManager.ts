import { EventEmitter } from 'events';
import { PrinterInfo, PrinterStatus, PrinterCommand, PrinterError, NetworkPrinterConfig } from '../types.js';
import { NetworkPrinterHandler } from '../network/NetworkPrinterHandler.js';
import { SerialPrinterHandler } from '../serial/SerialPrinterHandler.js';
import { PrintQueueManager } from '../queue/PrintQueueManager.js';
import { PrinterEventBroadcaster } from '../realtime/PrinterEventBroadcaster.js';
import { logger } from '../../utils/logger.js';

export interface PrinterConfiguration {
  id: string;
  name: string;
  type: 'network' | 'serial';
  config: NetworkPrinterConfig | { port: string; baudRate: number };
  enabled: boolean;
  healthCheckInterval: number;
  maxRetries: number;
}

export class PrinterManager extends EventEmitter {
  private printers = new Map<string, NetworkPrinterHandler | SerialPrinterHandler>();
  private printerConfigs = new Map<string, PrinterConfiguration>();
  private healthChecks = new Map<string, NodeJS.Timeout>();
  private reconnectAttempts = new Map<string, number>();
  private queueManager: PrintQueueManager;
  private eventBroadcaster: PrinterEventBroadcaster;
  private circuitBreakers = new Map<string, { failures: number; lastFailure: number; state: 'closed' | 'open' | 'half-open' }>();

  constructor(queueManager: PrintQueueManager, eventBroadcaster: PrinterEventBroadcaster) {
    super();
    this.queueManager = queueManager;
    this.eventBroadcaster = eventBroadcaster;
    this.setupEventHandlers();
  }

  public async addPrinter(config: PrinterConfiguration): Promise<void> {
    try {
      logger.info(`Adding printer ${config.id} (${config.type})`);

      let handler: NetworkPrinterHandler | SerialPrinterHandler;

      if (config.type === 'network') {
        handler = new NetworkPrinterHandler(config.id, config.config as NetworkPrinterConfig);
      } else {
        const serialConfig = config.config as { port: string; baudRate: number };
        handler = new SerialPrinterHandler(config.id, serialConfig.port, serialConfig.baudRate);
      }

      // Setup handler events
      this.setupPrinterEventHandlers(config.id, handler);

      this.printers.set(config.id, handler);
      this.printerConfigs.set(config.id, config);
      this.circuitBreakers.set(config.id, { failures: 0, lastFailure: 0, state: 'closed' });

      if (config.enabled) {
        await this.connectPrinter(config.id);
        this.startHealthCheck(config.id);
      }

      this.emit('printerAdded', config);
    } catch (error) {
      logger.error(`Failed to add printer ${config.id}:`, error);
      throw error;
    }
  }

  public async removePrinter(printerId: string): Promise<void> {
    try {
      await this.disconnectPrinter(printerId);
      this.stopHealthCheck(printerId);

      this.printers.delete(printerId);
      this.printerConfigs.delete(printerId);
      this.circuitBreakers.delete(printerId);
      this.reconnectAttempts.delete(printerId);

      logger.info(`Removed printer ${printerId}`);
      this.emit('printerRemoved', printerId);
    } catch (error) {
      logger.error(`Failed to remove printer ${printerId}:`, error);
      throw error;
    }
  }

  public async connectPrinter(printerId: string): Promise<void> {
    const handler = this.printers.get(printerId);
    const config = this.printerConfigs.get(printerId);

    if (!handler || !config) {
      throw new Error(`Printer ${printerId} not found`);
    }

    const circuitBreaker = this.circuitBreakers.get(printerId)!;
    
    // Check circuit breaker
    if (circuitBreaker.state === 'open' && 
        Date.now() - circuitBreaker.lastFailure < 60000) { // 1 minute cooldown
      throw new Error(`Circuit breaker open for printer ${printerId}`);
    }

    try {
      await handler.connect();
      circuitBreaker.failures = 0;
      circuitBreaker.state = 'closed';
      this.reconnectAttempts.set(printerId, 0);
      
      logger.info(`Successfully connected to printer ${printerId}`);
    } catch (error) {
      this.handleConnectionFailure(printerId, error);
      throw error;
    }
  }

  public async disconnectPrinter(printerId: string): Promise<void> {
    const handler = this.printers.get(printerId);
    if (handler) {
      await handler.disconnect();
    }
  }

  public async sendCommand(printerId: string, command: PrinterCommand): Promise<string> {
    const handler = this.printers.get(printerId);
    if (!handler) {
      throw new Error(`Printer ${printerId} not found`);
    }

    const circuitBreaker = this.circuitBreakers.get(printerId)!;
    if (circuitBreaker.state === 'open') {
      throw new Error(`Circuit breaker open for printer ${printerId}`);
    }

    try {
      const result = await handler.sendCommand(command);
      
      // Reset circuit breaker on success
      if (circuitBreaker.state === 'half-open') {
        circuitBreaker.state = 'closed';
        circuitBreaker.failures = 0;
      }

      return result;
    } catch (error) {
      this.handleCommandFailure(printerId, error);
      throw error;
    }
  }

  public async getAllPrinterStatus(): Promise<PrinterInfo[]> {
    const statuses: PrinterInfo[] = [];

    for (const [printerId, handler] of this.printers) {
      try {
        const status = await handler.getStatus();
        statuses.push(status);
      } catch (error) {
        logger.error(`Failed to get status for printer ${printerId}:`, error);
        
        // Return offline status for failed printers
        statuses.push({
          id: printerId,
          name: `Printer ${printerId}`,
          type: 'FDM',
          connectionType: 'network' as any,
          status: PrinterStatus.OFFLINE,
          temperature: { hotend: 0, bed: 0, targetHotend: 0, targetBed: 0 },
          position: { x: 0, y: 0, z: 0 },
          progress: 0,
          lastUpdate: new Date()
        });
      }
    }

    return statuses;
  }

  public async getPrinterStatus(printerId: string): Promise<PrinterInfo> {
    const handler = this.printers.get(printerId);
    if (!handler) {
      throw new Error(`Printer ${printerId} not found`);
    }

    return handler.getStatus();
  }

  public getConnectedPrinters(): string[] {
    const connected: string[] = [];
    for (const [printerId, handler] of this.printers) {
      // This would need to be implemented in handlers
      if (handler && (handler as any).isConnected) {
        connected.push(printerId);
      }
    }
    return connected;
  }

  private setupPrinterEventHandlers(printerId: string, handler: NetworkPrinterHandler | SerialPrinterHandler): void {
    handler.on('connected', () => {
      logger.info(`Printer ${printerId} connected`);
      this.eventBroadcaster.broadcastPrinterEvent('connected', printerId, null);
      this.emit('printerConnected', printerId);
    });

    handler.on('disconnected', () => {
      logger.warn(`Printer ${printerId} disconnected`);
      this.eventBroadcaster.broadcastPrinterEvent('disconnected', printerId, null);
      this.emit('printerDisconnected', printerId);
    });

    handler.on('statusUpdate', (status: PrinterInfo) => {
      this.eventBroadcaster.broadcastPrinterEvent('statusUpdate', printerId, status);
      this.emit('printerStatusUpdate', printerId, status);
    });

    handler.on('error', (errorData: { printerId: string; error: PrinterError }) => {
      logger.error(`Printer ${printerId} error:`, errorData.error);
      this.eventBroadcaster.broadcastPrinterEvent('error', printerId, errorData.error);
      this.handlePrinterError(printerId, errorData.error);
    });

    handler.on('connectionError', (errorData: { printerId: string; error: any }) => {
      this.handleConnectionFailure(printerId, errorData.error);
    });

    handler.on('printStarted', (data: { printerId: string; fileName: string }) => {
      this.eventBroadcaster.broadcastPrintEvent('started', printerId, data.fileName);
      this.emit('printStarted', data);
    });

    handler.on('printPaused', (data: { printerId: string }) => {
      this.eventBroadcaster.broadcastPrintEvent('paused', printerId, null);
      this.emit('printPaused', data);
    });

    handler.on('printResumed', (data: { printerId: string }) => {
      this.eventBroadcaster.broadcastPrintEvent('resumed', printerId, null);
      this.emit('printResumed', data);
    });

    handler.on('printCancelled', (data: { printerId: string }) => {
      this.eventBroadcaster.broadcastPrintEvent('cancelled', printerId, null);
      this.emit('printCancelled', data);
    });
  }

  private setupEventHandlers(): void {
    // Handle queue events
    this.queueManager.on('jobStarted', (job) => {
      this.eventBroadcaster.broadcastQueueEvent('jobStarted', job);
    });

    this.queueManager.on('jobCompleted', (job) => {
      this.eventBroadcaster.broadcastQueueEvent('jobCompleted', job);
    });

    this.queueManager.on('jobFailed', ({ job, error }) => {
      this.eventBroadcaster.broadcastQueueEvent('jobFailed', { job, error });
    });

    this.queueManager.on('queueUpdated', () => {
      this.eventBroadcaster.broadcastQueueEvent('queueUpdated', this.queueManager.getQueue());
    });
  }

  private startHealthCheck(printerId: string): void {
    const config = this.printerConfigs.get(printerId);
    if (!config) return;

    const interval = setInterval(async () => {
      try {
        await this.getPrinterStatus(printerId);
      } catch (error) {
        logger.warn(`Health check failed for printer ${printerId}:`, error);
        this.handleConnectionFailure(printerId, error);
      }
    }, config.healthCheckInterval || 30000);

    this.healthChecks.set(printerId, interval);
  }

  private stopHealthCheck(printerId: string): void {
    const interval = this.healthChecks.get(printerId);
    if (interval) {
      clearInterval(interval);
      this.healthChecks.delete(printerId);
    }
  }

  private handleConnectionFailure(printerId: string, error: any): void {
    const circuitBreaker = this.circuitBreakers.get(printerId)!;
    circuitBreaker.failures++;
    circuitBreaker.lastFailure = Date.now();

    if (circuitBreaker.failures >= 3) {
      circuitBreaker.state = 'open';
      logger.warn(`Circuit breaker opened for printer ${printerId}`);
    }

    const attempts = this.reconnectAttempts.get(printerId) || 0;
    const config = this.printerConfigs.get(printerId);
    
    if (attempts < (config?.maxRetries || 5)) {
      this.reconnectAttempts.set(printerId, attempts + 1);
      
      const delay = Math.min(1000 * Math.pow(2, attempts), 30000); // Exponential backoff, max 30s
      setTimeout(() => {
        this.attemptReconnection(printerId);
      }, delay);
    } else {
      logger.error(`Max reconnection attempts reached for printer ${printerId}`);
      this.emit('printerReconnectFailed', printerId);
    }
  }

  private async attemptReconnection(printerId: string): Promise<void> {
    try {
      const circuitBreaker = this.circuitBreakers.get(printerId)!;
      if (circuitBreaker.state === 'open') {
        circuitBreaker.state = 'half-open';
      }

      await this.connectPrinter(printerId);
      logger.info(`Successfully reconnected to printer ${printerId}`);
    } catch (error) {
      logger.error(`Reconnection failed for printer ${printerId}:`, error);
    }
  }

  private handleCommandFailure(printerId: string, error: any): void {
    const circuitBreaker = this.circuitBreakers.get(printerId)!;
    circuitBreaker.failures++;

    if (circuitBreaker.failures >= 5) {
      circuitBreaker.state = 'open';
      circuitBreaker.lastFailure = Date.now();
    }
  }

  private handlePrinterError(printerId: string, error: PrinterError): void {
    this.emit('printerError', printerId, error);

    // Handle critical errors
    if (error.severity === 'critical' && !error.recoverable) {
      logger.error(`Critical unrecoverable error on printer ${printerId}, disconnecting`);
      this.disconnectPrinter(printerId).catch(err => {
        logger.error(`Failed to disconnect printer ${printerId} after critical error:`, err);
      });
    }
  }

  public async cleanup(): Promise<void> {
    for const [printerId] of this.printers) {
      await this.removePrinter(printerId);
    }
    
    await this.queueManager.cleanup();
    logger.info('Printer manager cleaned up');
  }
}
import { EventEmitter } from 'events';
import { Server as SocketIOServer } from 'socket.io';
import { SerialPrinterHandler } from './serial/SerialPrinterHandler.js';
import { NetworkPrinterHandler } from './network/NetworkPrinterHandler.js';
import { PrintQueueManager } from './queue/PrintQueueManager.js';
import { ErrorRecoveryManager } from './recovery/ErrorRecoveryManager.js';
import { PrinterEventBroadcaster } from './realtime/PrinterEventBroadcaster.js';
import { 
  PrinterInfo, 
  PrinterConnectionType, 
  PrinterStatus, 
  PrintJob, 
  PrinterCommand, 
  PrinterError,
  NetworkPrinterConfig,
  SerialPortInfo
} from './types.js';
import { logger } from '../utils/logger.js';

interface PrinterConfig {
  id: string;
  name: string;
  type: PrinterConnectionType;
  config: {
    // Serial config
    portPath?: string;
    baudRate?: number;
    // Network config
    hostname?: string;
    port?: number;
    protocol?: 'http' | 'https' | 'tcp';
    apiKey?: string;
    endpoints?: {
      status: string;
      command: string;
      files: string;
      job: string;
    };
  };
  enabled: boolean;
  autoConnect: boolean;
}

export class PrinterManager extends EventEmitter {
  private printers = new Map<string, SerialPrinterHandler | NetworkPrinterHandler>();
  private printerConfigs = new Map<string, PrinterConfig>();
  private printerStatus = new Map<string, PrinterInfo>();
  private queueManager: PrintQueueManager;
  private recoveryManager: ErrorRecoveryManager;
  private eventBroadcaster: PrinterEventBroadcaster;
  private discoveryInterval: NodeJS.Timeout | null = null;
  private statusUpdateInterval: NodeJS.Timeout | null = null;

  constructor(io: SocketIOServer, redisConfig?: any) {
    super();
    
    this.queueManager = new PrintQueueManager(redisConfig);
    this.recoveryManager = new ErrorRecoveryManager();
    this.eventBroadcaster = new PrinterEventBroadcaster(io);
    
    this.setupEventHandlers();
    this.startStatusUpdates();
  }

  public async addPrinter(config: PrinterConfig): Promise<void> {
    try {
      logger.info(`Adding printer: ${config.id} (${config.type})`);
      
      if (this.printers.has(config.id)) {
        throw new Error(`Printer ${config.id} already exists`);
      }

      this.printerConfigs.set(config.id, config);
      
      const handler = this.createPrinterHandler(config);
      this.printers.set(config.id, handler);
      
      this.setupPrinterEventHandlers(config.id, handler);

      if (config.enabled && config.autoConnect) {
        await this.connectPrinter(config.id);
      }

      this.emit('printerAdded', config);
      logger.info(`Successfully added printer: ${config.id}`);
    } catch (error) {
      logger.error(`Failed to add printer ${config.id}:`, error);
      throw error;
    }
  }

  public async removePrinter(printerId: string): Promise<void> {
    try {
      logger.info(`Removing printer: ${printerId}`);
      
      const handler = this.printers.get(printerId);
      if (handler) {
        await handler.disconnect();
        this.printers.delete(printerId);
      }

      this.printerConfigs.delete(printerId);
      this.printerStatus.delete(printerId);
      
      // Cancel any queued jobs for this printer
      const printerJobs = this.queueManager.getPrinterQueue(printerId);
      for (const job of printerJobs) {
        await this.queueManager.cancelJob(job.id);
      }

      this.emit('printerRemoved', printerId);
      logger.info(`Successfully removed printer: ${printerId}`);
    } catch (error) {
      logger.error(`Failed to remove printer ${printerId}:`, error);
      throw error;
    }
  }

  public async connectPrinter(printerId: string): Promise<void> {
    const handler = this.printers.get(printerId);
    if (!handler) {
      throw new Error(`Printer ${printerId} not found`);
    }

    if (this.recoveryManager.isBlacklisted(printerId)) {
      throw new Error(`Printer ${printerId} is blacklisted due to errors`);
    }

    await handler.connect();
  }

  public async disconnectPrinter(printerId: string): Promise<void> {
    const handler = this.printers.get(printerId);
    if (!handler) {
      throw new Error(`Printer ${printerId} not found`);
    }

    await handler.disconnect();
  }

  public async sendCommand(printerId: string, command: PrinterCommand): Promise<string> {
    const handler = this.printers.get(printerId);
    if (!handler) {
      throw new Error(`Printer ${printerId} not found`);
    }

    return await handler.sendCommand(command);
  }

  public async getPrinterStatus(printerId: string): Promise<PrinterInfo> {
    const handler = this.printers.get(printerId);
    if (!handler) {
      throw new Error(`Printer ${printerId} not found`);
    }

    const status = await handler.getStatus();
    this.printerStatus.set(printerId, status);
    return status;
  }

  public getAllPrinterStatus(): PrinterInfo[] {
    return Array.from(this.printerStatus.values());
  }

  public getPrinterConfig(printerId: string): PrinterConfig | undefined {
    return this.printerConfigs.get(printerId);
  }

  public async addPrintJob(job: PrintJob, priority: number = 0): Promise<string> {
    // Validate printer exists
    if (!this.printers.has(job.printerId)) {
      throw new Error(`Printer ${job.printerId} not found`);
    }

    // Check if printer is available
    const status = this.printerStatus.get(job.printerId);
    if (status?.status === PrinterStatus.ERROR || this.recoveryManager.isBlacklisted(job.printerId)) {
      throw new Error(`Printer ${job.printerId} is not available for printing`);
    }

    return await this.queueManager.addJob(job, priority);
  }

  public async cancelPrintJob(jobId: string): Promise<void> {
    await this.queueManager.cancelJob(jobId);
  }

  public async pausePrintJob(jobId: string): Promise<void> {
    await this.queueManager.pauseJob(jobId);
  }

  public async resumePrintJob(jobId: string): Promise<void> {
    await this.queueManager.resumeJob(jobId);
  }

  public getPrintQueue(): PrintJob[] {
    return this.queueManager.getQueue();
  }

  public getPrinterQueue(printerId: string): PrintJob[] {
    return this.queueManager.getPrinterQueue(printerId);
  }

  public async uploadFile(printerId: string, fileName: string, fileBuffer: Buffer): Promise<string> {
    const handler = this.printers.get(printerId);
    if (!handler) {
      throw new Error(`Printer ${printerId} not found`);
    }

    if (handler instanceof NetworkPrinterHandler) {
      return await handler.uploadFile(fileName, fileBuffer);
    } else {
      // For serial printers, we would save the file locally
      // This is a simplified implementation
      throw new Error('File upload not supported for serial printers');
    }
  }

  public async startPrint(printerId: string, fileName: string): Promise<void> {
    const handler = this.printers.get(printerId);
    if (!handler) {
      throw new Error(`Printer ${printerId} not found`);
    }

    if (handler instanceof NetworkPrinterHandler) {
      await handler.startPrint(fileName);
    } else {
      // For serial printers, we would send G-code commands
      throw new Error('Direct print start not supported for serial printers - use print queue instead');
    }
  }

  public async pausePrint(printerId: string): Promise<void> {
    const handler = this.printers.get(printerId);
    if (!handler) {
      throw new Error(`Printer ${printerId} not found`);
    }

    if (handler instanceof NetworkPrinterHandler) {
      await handler.pausePrint();
    } else {
      await handler.sendCommand({ type: 'gcode', command: 'M25' }); // Pause SD print
    }
  }

  public async resumePrint(printerId: string): Promise<void> {
    const handler = this.printers.get(printerId);
    if (!handler) {
      throw new Error(`Printer ${printerId} not found`);
    }

    if (handler instanceof NetworkPrinterHandler) {
      await handler.resumePrint();
    } else {
      await handler.sendCommand({ type: 'gcode', command: 'M24' }); // Resume SD print
    }
  }

  public async cancelPrint(printerId: string): Promise<void> {
    const handler = this.printers.get(printerId);
    if (!handler) {
      throw new Error(`Printer ${printerId} not found`);
    }

    if (handler instanceof NetworkPrinterHandler) {
      await handler.cancelPrint();
    } else {
      await handler.sendCommand({ type: 'gcode', command: 'M25' }); // Pause first
      await handler.sendCommand({ type: 'gcode', command: 'M104 S0' }); // Turn off hotend
      await handler.sendCommand({ type: 'gcode', command: 'M140 S0' }); // Turn off bed
    }
  }

  public async setTemperature(printerId: string, hotend?: number, bed?: number): Promise<void> {
    const handler = this.printers.get(printerId);
    if (!handler) {
      throw new Error(`Printer ${printerId} not found`);
    }

    if (hotend !== undefined) {
      await handler.sendCommand({ 
        type: 'temperature', 
        command: 'setHotend', 
        parameters: { temperature: hotend } 
      });
    }

    if (bed !== undefined) {
      await handler.sendCommand({ 
        type: 'temperature', 
        command: 'setBed', 
        parameters: { temperature: bed } 
      });
    }
  }

  public async homeAxes(printerId: string, axes?: string[]): Promise<void> {
    const handler = this.printers.get(printerId);
    if (!handler) {
      throw new Error(`Printer ${printerId} not found`);
    }

    const axesParam = axes?.join('') || '';
    await handler.sendCommand({ type: 'gcode', command: `G28 ${axesParam}` });
  }

  public async move(printerId: string, x?: number, y?: number, z?: number, speed?: number): Promise<void> {
    const handler = this.printers.get(printerId);
    if (!handler) {
      throw new Error(`Printer ${printerId} not found`);
    }

    const parameters: Record<string, number> = {};
    if (x !== undefined) parameters.x = x;
    if (y !== undefined) parameters.y = y;
    if (z !== undefined) parameters.z = z;
    if (speed !== undefined) parameters.f = speed;

    await handler.sendCommand({ 
      type: 'movement', 
      command: 'move', 
      parameters 
    });
  }

  public static async discoverSerialPrinters(): Promise<SerialPortInfo[]> {
    return await SerialPrinterHandler.listSerialPorts();
  }

  public async discoverNetworkPrinters(): Promise<any[]> {
    // This would implement network discovery (mDNS, UPnP, etc.)
    // For now, returning empty array
    return [];
  }

  public getSystemStats(): any {
    return {
      printers: {
        total: this.printers.size,
        connected: Array.from(this.printerStatus.values()).filter(s => s.status !== PrinterStatus.OFFLINE).length,
        printing: Array.from(this.printerStatus.values()).filter(s => s.status === PrinterStatus.PRINTING).length,
        error: Array.from(this.printerStatus.values()).filter(s => s.status === PrinterStatus.ERROR).length
      },
      queue: this.queueManager.getQueueStats(),
      connections: this.eventBroadcaster.getConnectionStats()
    };
  }

  private createPrinterHandler(config: PrinterConfig): SerialPrinterHandler | NetworkPrinterHandler {
    switch (config.type) {
      case PrinterConnectionType.USB:
        if (!config.config.portPath) {
          throw new Error('Port path required for USB printer');
        }
        return new SerialPrinterHandler(
          config.id,
          config.config.portPath,
          config.config.baudRate || 115200
        );

      case PrinterConnectionType.NETWORK:
      case PrinterConnectionType.WIFI:
        if (!config.config.hostname || !config.config.port) {
          throw new Error('Hostname and port required for network printer');
        }
        
        const networkConfig: NetworkPrinterConfig = {
          hostname: config.config.hostname,
          port: config.config.port,
          protocol: config.config.protocol || 'http',
          apiKey: config.config.apiKey,
          endpoints: config.config.endpoints || {
            status: '/api/printer',
            command: '/api/printer/command',
            files: '/api/files',
            job: '/api/job'
          }
        };
        
        return new NetworkPrinterHandler(config.id, networkConfig);

      default:
        throw new Error(`Unsupported printer type: ${config.type}`);
    }
  }

  private setupPrinterEventHandlers(printerId: string, handler: SerialPrinterHandler | NetworkPrinterHandler): void {
    handler.on('connected', () => {
      logger.info(`Printer ${printerId} connected`);
      this.eventBroadcaster.emit('printerConnected', printerId);
      this.updatePrinterStatus(printerId);
    });

    handler.on('disconnected', () => {
      logger.info(`Printer ${printerId} disconnected`);
      this.eventBroadcaster.emit('printerDisconnected', printerId);
      this.updatePrinterStatus(printerId);
    });

    handler.on('error', async (data: { printerId: string; error: PrinterError }) => {
      logger.error(`Printer ${printerId} error:`, data.error);
      
      const recovered = await this.recoveryManager.handleError(printerId, data.error, {
        handler,
        currentJob: this.queueManager.getCurrentJob(printerId)
      });

      if (!recovered) {
        this.eventBroadcaster.broadcastPrinterError(printerId, data.error);
      }
    });

    handler.on('temperatureUpdate', (data: any) => {
      this.eventBroadcaster.broadcastTemperatureUpdate(printerId, data.temperature);
    });

    handler.on('positionUpdate', (data: any) => {
      this.eventBroadcaster.broadcastPositionUpdate(printerId, data.position);
    });

    handler.on('statusUpdate', (status: PrinterInfo) => {
      this.printerStatus.set(printerId, status);
      this.eventBroadcaster.broadcastPrinterStatus(status);
    });

    // Network printer specific events
    if (handler instanceof NetworkPrinterHandler) {
      handler.on('printStarted', (data: any) => {
        this.eventBroadcaster.emit('printStarted', { printerId, fileName: data.fileName });
      });

      handler.on('printPaused', () => {
        this.eventBroadcaster.emit('printPaused', { printerId });
      });

      handler.on('printResumed', () => {
        this.eventBroadcaster.emit('printResumed', { printerId });
      });

      handler.on('printCancelled', () => {
        this.eventBroadcaster.emit('printCancelled', { printerId });
      });
    }
  }

  private setupEventHandlers(): void {
    // Queue manager events
    this.queueManager.on('jobStarted', (job: PrintJob) => {
      this.eventBroadcaster.broadcastPrintJobUpdate(job);
      this.processPrintJob(job);
    });

    this.queueManager.on('jobCompleted', (job: PrintJob) => {
      this.eventBroadcaster.broadcastPrintJobUpdate(job);
    });

    this.queueManager.on('jobFailed', (data: { job: PrintJob; error: string }) => {
      this.eventBroadcaster.broadcastPrintJobUpdate(data.job);
    });

    this.queueManager.on('queueUpdated', () => {
      const queue = this.queueManager.getQueue();
      this.eventBroadcaster.broadcastQueueUpdate(queue);
    });

    // Recovery manager events
    this.recoveryManager.on('executeCommand', async (data: any) => {
      try {
        await this.sendCommand(data.printerId, {
          type: 'gcode',
          command: data.command,
          parameters: data.parameters
        });
      } catch (error) {
        logger.error(`Failed to execute recovery command:`, error);
      }
    });

    this.recoveryManager.on('resetPrinter', async (data: { printerId: string }) => {
      try {
        await this.disconnectPrinter(data.printerId);
        await new Promise(resolve => setTimeout(resolve, 5000));
        await this.connectPrinter(data.printerId);
      } catch (error) {
        logger.error(`Failed to reset printer ${data.printerId}:`, error);
      }
    });

    this.recoveryManager.on('pausePrint', async (data: { printerId: string }) => {
      try {
        await this.pausePrint(data.printerId);
      } catch (error) {
        logger.error(`Failed to pause print:`, error);
      }
    });

    this.recoveryManager.on('cancelPrint', async (data: { printerId: string }) => {
      try {
        await this.cancelPrint(data.printerId);
      } catch (error) {
        logger.error(`Failed to cancel print:`, error);
      }
    });

    this.recoveryManager.on('reconnectPrinter', async (data: { printerId: string }) => {
      try {
        await this.disconnectPrinter(data.printerId);
        await new Promise(resolve => setTimeout(resolve, 3000));
        await this.connectPrinter(data.printerId);
      } catch (error) {
        logger.error(`Failed to reconnect printer ${data.printerId}:`, error);
      }
    });

    this.recoveryManager.on('sendNotification', (data: any) => {
      this.eventBroadcaster.broadcastSystemMessage(data.message, data.level);
    });
  }

  private async processPrintJob(job: PrintJob): Promise<void> {
    // This would handle the actual printing process
    // For now, this is a simplified version
    logger.info(`Processing print job ${job.id} for printer ${job.printerId}`);
    
    // Simulate printing progress
    // In a real implementation, this would monitor the actual print progress
  }

  private startStatusUpdates(): void {
    this.statusUpdateInterval = setInterval(async () => {
      for (const [printerId, handler] of this.printers) {
        try {
          const status = await handler.getStatus();
          this.printerStatus.set(printerId, status);
          this.eventBroadcaster.broadcastPrinterStatus(status);
        } catch (error) {
          // Status update errors are handled by the individual handlers
        }
      }
    }, 30000); // Update every 30 seconds
  }

  private async updatePrinterStatus(printerId: string): Promise<void> {
    try {
      const status = await this.getPrinterStatus(printerId);
      this.eventBroadcaster.broadcastPrinterStatus(status);
    } catch (error) {
      logger.error(`Failed to update status for printer ${printerId}:`, error);
    }
  }

  public async cleanup(): Promise<void> {
    try {
      if (this.discoveryInterval) {
        clearInterval(this.discoveryInterval);
      }
      
      if (this.statusUpdateInterval) {
        clearInterval(this.statusUpdateInterval);
      }

      // Disconnect all printers
      for (const [printerId, handler] of this.printers) {
        try {
          await handler.disconnect();
        } catch (error) {
          logger.error(`Error disconnecting printer ${printerId}:`, error);
        }
      }

      await this.queueManager.cleanup();
      
      logger.info('PrinterManager cleaned up successfully');
    } catch (error) {
      logger.error('Error during PrinterManager cleanup:', error);
      throw error;
    }
  }
}
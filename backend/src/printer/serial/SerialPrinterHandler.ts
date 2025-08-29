import { EventEmitter } from 'events';
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { PrinterInfo, PrinterStatus, PrinterCommand, PrinterError, SerialPortInfo } from '../types.js';
import { logger } from '../../utils/logger.js';

export class SerialPrinterHandler extends EventEmitter {
  private port: SerialPort | null = null;
  private parser: ReadlineParser | null = null;
  private printerId: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private commandQueue: PrinterCommand[] = [];
  private isProcessingCommands = false;
  private responseTimeout = 10000;
  private pendingCommands = new Map<string, { resolve: Function; reject: Function; timeout: NodeJS.Timeout }>();

  constructor(
    printerId: string,
    private portPath: string,
    private baudRate: number = 115200
  ) {
    super();
    this.printerId = printerId;
    this.setupErrorHandling();
  }

  public async connect(): Promise<void> {
    try {
      logger.info(`Connecting to printer ${this.printerId} on ${this.portPath}`);
      
      this.port = new SerialPort({
        path: this.portPath,
        baudRate: this.baudRate,
        autoOpen: false
      });

      this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }));
      this.setupEventHandlers();
      
      await this.openPort();
      await this.initializePrinter();
      
      this.startHeartbeat();
      this.processCommandQueue();
      
      this.reconnectAttempts = 0;
      this.emit('connected', this.printerId);
      
      logger.info(`Successfully connected to printer ${this.printerId}`);
    } catch (error) {
      logger.error(`Failed to connect to printer ${this.printerId}:`, error);
      this.handleConnectionError(error);
    }
  }

  public async disconnect(): Promise<void> {
    try {
      this.stopHeartbeat();
      this.clearPendingCommands();
      
      if (this.port && this.port.isOpen) {
        await new Promise<void>((resolve, reject) => {
          this.port!.close((err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
      
      this.port = null;
      this.parser = null;
      this.emit('disconnected', this.printerId);
      
      logger.info(`Disconnected from printer ${this.printerId}`);
    } catch (error) {
      logger.error(`Error disconnecting from printer ${this.printerId}:`, error);
      throw error;
    }
  }

  public async sendCommand(command: PrinterCommand): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.port || !this.port.isOpen) {
        reject(new Error('Printer not connected'));
        return;
      }

      const commandId = `${Date.now()}-${Math.random()}`;
      const timeout = setTimeout(() => {
        this.pendingCommands.delete(commandId);
        reject(new Error(`Command timeout: ${command.command}`));
      }, this.responseTimeout);

      this.pendingCommands.set(commandId, { resolve, reject, timeout });
      
      const gcodeCommand = this.formatCommand(command);
      logger.debug(`Sending command to ${this.printerId}: ${gcodeCommand}`);
      
      this.port.write(`${gcodeCommand}\n`, (err) => {
        if (err) {
          clearTimeout(timeout);
          this.pendingCommands.delete(commandId);
          reject(err);
        }
      });
    });
  }

  public queueCommand(command: PrinterCommand): void {
    this.commandQueue.push(command);
    if (!this.isProcessingCommands) {
      this.processCommandQueue();
    }
  }

  public async getStatus(): Promise<PrinterInfo> {
    try {
      const responses = await Promise.all([
        this.sendCommand({ type: 'gcode', command: 'M105' }), // Temperature
        this.sendCommand({ type: 'gcode', command: 'M114' }), // Position
        this.sendCommand({ type: 'gcode', command: 'M119' })  // Endstops
      ]);

      return this.parseStatusResponse(responses);
    } catch (error) {
      logger.error(`Failed to get status from printer ${this.printerId}:`, error);
      throw error;
    }
  }

  public static async listSerialPorts(): Promise<SerialPortInfo[]> {
    try {
      const ports = await SerialPort.list();
      return ports.filter(port => 
        port.manufacturer?.toLowerCase().includes('arduino') ||
        port.manufacturer?.toLowerCase().includes('ch340') ||
        port.manufacturer?.toLowerCase().includes('ftdi') ||
        port.productId === '7523' || // Common 3D printer chips
        port.productId === '6001'
      ).map(port => ({
        path: port.path,
        manufacturer: port.manufacturer,
        serialNumber: port.serialNumber,
        pnpId: port.pnpId,
        locationId: port.locationId,
        productId: port.productId,
        vendorId: port.vendorId
      }));
    } catch (error) {
      logger.error('Failed to list serial ports:', error);
      throw error;
    }
  }

  private async openPort(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.port!.open((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private setupEventHandlers(): void {
    if (!this.port || !this.parser) return;

    this.port.on('error', (err) => {
      logger.error(`Serial port error for printer ${this.printerId}:`, err);
      this.handleConnectionError(err);
    });

    this.port.on('close', () => {
      logger.warn(`Serial port closed for printer ${this.printerId}`);
      this.emit('disconnected', this.printerId);
      this.attemptReconnect();
    });

    this.parser.on('data', (data: string) => {
      this.handleResponse(data);
    });
  }

  private handleResponse(data: string): void {
    logger.debug(`Response from ${this.printerId}: ${data}`);
    
    // Handle temperature reports
    if (data.includes('T:') || data.includes('B:')) {
      this.parseTemperatureResponse(data);
    }
    
    // Handle position reports
    if (data.includes('X:') && data.includes('Y:') && data.includes('Z:')) {
      this.parsePositionResponse(data);
    }
    
    // Handle errors
    if (data.startsWith('Error:') || data.includes('echo:Unknown command')) {
      this.handlePrinterError(data);
    }
    
    // Resolve pending commands
    if (data === 'ok' || data.includes('ok T:')) {
      this.resolvePendingCommand(data);
    }
  }

  private async initializePrinter(): Promise<void> {
    try {
      // Wait for printer boot
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Send initialization commands
      await this.sendCommand({ type: 'gcode', command: 'M115' }); // Get firmware info
      await this.sendCommand({ type: 'gcode', command: 'M105' }); // Get temperature
      await this.sendCommand({ type: 'gcode', command: 'G90' });  // Absolute positioning
      
      logger.info(`Printer ${this.printerId} initialized successfully`);
    } catch (error) {
      logger.error(`Failed to initialize printer ${this.printerId}:`, error);
      throw error;
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(async () => {
      try {
        await this.sendCommand({ type: 'gcode', command: 'M105' });
      } catch (error) {
        logger.error(`Heartbeat failed for printer ${this.printerId}:`, error);
      }
    }, 10000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private async processCommandQueue(): Promise<void> {
    if (this.isProcessingCommands || this.commandQueue.length === 0) return;
    
    this.isProcessingCommands = true;
    
    while (this.commandQueue.length > 0) {
      const command = this.commandQueue.shift();
      if (command) {
        try {
          await this.sendCommand(command);
          await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between commands
        } catch (error) {
          logger.error(`Failed to execute queued command for printer ${this.printerId}:`, error);
          this.emit('commandError', { printerId: this.printerId, command, error });
        }
      }
    }
    
    this.isProcessingCommands = false;
  }

  private formatCommand(command: PrinterCommand): string {
    switch (command.type) {
      case 'temperature':
        if (command.command === 'setHotend') {
          return `M104 S${command.parameters?.temperature}`;
        } else if (command.command === 'setBed') {
          return `M140 S${command.parameters?.temperature}`;
        }
        break;
      case 'movement':
        return `G1 ${Object.entries(command.parameters || {})
          .map(([axis, value]) => `${axis.toUpperCase()}${value}`)
          .join(' ')}`;
    }
    return command.command;
  }

  private parseTemperatureResponse(data: string): void {
    const hotendMatch = data.match(/T:([0-9.]+)\s+\/([0-9.]+)/);
    const bedMatch = data.match(/B:([0-9.]+)\s+\/([0-9.]+)/);
    
    if (hotendMatch || bedMatch) {
      this.emit('temperatureUpdate', {
        printerId: this.printerId,
        hotend: hotendMatch ? parseFloat(hotendMatch[1]) : 0,
        targetHotend: hotendMatch ? parseFloat(hotendMatch[2]) : 0,
        bed: bedMatch ? parseFloat(bedMatch[1]) : 0,
        targetBed: bedMatch ? parseFloat(bedMatch[2]) : 0
      });
    }
  }

  private parsePositionResponse(data: string): void {
    const xMatch = data.match(/X:([0-9.-]+)/);
    const yMatch = data.match(/Y:([0-9.-]+)/);
    const zMatch = data.match(/Z:([0-9.-]+)/);
    
    if (xMatch && yMatch && zMatch) {
      this.emit('positionUpdate', {
        printerId: this.printerId,
        x: parseFloat(xMatch[1]),
        y: parseFloat(yMatch[1]),
        z: parseFloat(zMatch[1])
      });
    }
  }

  private parseStatusResponse(responses: string[]): PrinterInfo {
    // This would parse the combined responses into a PrinterInfo object
    // Implementation depends on specific printer firmware responses
    return {
      id: this.printerId,
      name: `Printer ${this.printerId}`,
      type: 'FDM',
      connectionType: 'usb' as any,
      status: PrinterStatus.IDLE,
      temperature: {
        hotend: 0,
        bed: 0,
        targetHotend: 0,
        targetBed: 0
      },
      position: { x: 0, y: 0, z: 0 },
      progress: 0,
      lastUpdate: new Date()
    };
  }

  private handlePrinterError(data: string): void {
    const error: PrinterError = {
      code: 'PRINTER_ERROR',
      message: data,
      severity: 'error',
      timestamp: new Date(),
      recoverable: !data.includes('MINTEMP') && !data.includes('MAXTEMP')
    };
    
    this.emit('error', { printerId: this.printerId, error });
  }

  private resolvePendingCommand(response: string): void {
    const [commandId] = this.pendingCommands.keys();
    if (commandId) {
      const pending = this.pendingCommands.get(commandId);
      if (pending) {
        clearTimeout(pending.timeout);
        pending.resolve(response);
        this.pendingCommands.delete(commandId);
      }
    }
  }

  private clearPendingCommands(): void {
    for (const [commandId, pending] of this.pendingCommands) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Connection closed'));
    }
    this.pendingCommands.clear();
  }

  private handleConnectionError(error: any): void {
    this.emit('connectionError', { printerId: this.printerId, error });
    this.attemptReconnect();
  }

  private async attemptReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error(`Max reconnection attempts reached for printer ${this.printerId}`);
      return;
    }

    this.reconnectAttempts++;
    logger.info(`Attempting to reconnect to printer ${this.printerId} (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect().catch(err => {
        logger.error(`Reconnection attempt ${this.reconnectAttempts} failed:`, err);
      });
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  private setupErrorHandling(): void {
    this.on('error', (error) => {
      logger.error(`SerialPrinterHandler error for printer ${this.printerId}:`, error);
    });
    
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception in SerialPrinterHandler:', error);
      this.disconnect().catch(() => {});
    });
  }
}
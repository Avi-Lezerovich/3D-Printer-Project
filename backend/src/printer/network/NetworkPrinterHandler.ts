import { EventEmitter } from 'events';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { PrinterInfo, PrinterStatus, PrinterCommand, PrinterError, NetworkPrinterConfig } from '../types.js';
import { logger } from '../../utils/logger.js';

export class NetworkPrinterHandler extends EventEmitter {
  private httpClient: AxiosInstance;
  private printerId: string;
  private config: NetworkPrinterConfig;
  private statusPollInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 10000;
  private isConnected = false;
  private lastKnownStatus: PrinterInfo | null = null;

  constructor(printerId: string, config: NetworkPrinterConfig) {
    super();
    this.printerId = printerId;
    this.config = config;
    
    this.httpClient = axios.create({
      baseURL: `${config.protocol}://${config.hostname}:${config.port}`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'X-Api-Key': config.apiKey })
      }
    });

    this.setupHttpInterceptors();
  }

  public async connect(): Promise<void> {
    try {
      logger.info(`Connecting to network printer ${this.printerId} at ${this.config.hostname}:${this.config.port}`);
      
      await this.testConnection();
      await this.initializePrinter();
      
      this.isConnected = true;
      this.startStatusPolling();
      this.reconnectAttempts = 0;
      
      this.emit('connected', this.printerId);
      logger.info(`Successfully connected to network printer ${this.printerId}`);
    } catch (error) {
      logger.error(`Failed to connect to network printer ${this.printerId}:`, error);
      this.handleConnectionError(error);
    }
  }

  public async disconnect(): Promise<void> {
    try {
      this.isConnected = false;
      this.stopStatusPolling();
      
      this.emit('disconnected', this.printerId);
      logger.info(`Disconnected from network printer ${this.printerId}`);
    } catch (error) {
      logger.error(`Error disconnecting from network printer ${this.printerId}:`, error);
      throw error;
    }
  }

  public async sendCommand(command: PrinterCommand): Promise<string> {
    try {
      if (!this.isConnected) {
        throw new Error('Printer not connected');
      }

      logger.debug(`Sending command to ${this.printerId}: ${command.command}`);
      
      let response: AxiosResponse;
      
      switch (command.type) {
        case 'gcode':
          response = await this.sendGCodeCommand(command.command, command.parameters);
          break;
        case 'control':
          response = await this.sendControlCommand(command.command, command.parameters);
          break;
        case 'temperature':
          response = await this.sendTemperatureCommand(command.command, command.parameters);
          break;
        case 'movement':
          response = await this.sendMovementCommand(command.command, command.parameters);
          break;
        default:
          throw new Error(`Unsupported command type: ${command.type}`);
      }
      
      return this.parseCommandResponse(response.data);
    } catch (error) {
      logger.error(`Failed to send command to printer ${this.printerId}:`, error);
      throw error;
    }
  }

  public async getStatus(): Promise<PrinterInfo> {
    try {
      const response = await this.httpClient.get(this.config.endpoints.status);
      const status = this.parseStatusResponse(response.data);
      
      this.lastKnownStatus = status;
      return status;
    } catch (error) {
      logger.error(`Failed to get status from network printer ${this.printerId}:`, error);
      
      // Return last known status if available
      if (this.lastKnownStatus) {
        return {
          ...this.lastKnownStatus,
          status: PrinterStatus.OFFLINE,
          lastUpdate: new Date()
        };
      }
      
      throw error;
    }
  }

  public async uploadFile(fileName: string, fileBuffer: Buffer): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', new Blob([fileBuffer]), fileName);
      formData.append('filename', fileName);
      formData.append('path', 'local');
      
      const response = await this.httpClient.post(this.config.endpoints.files, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      logger.info(`File ${fileName} uploaded to printer ${this.printerId}`);
      return response.data.files?.local?.name || fileName;
    } catch (error) {
      logger.error(`Failed to upload file to printer ${this.printerId}:`, error);
      throw error;
    }
  }

  public async startPrint(fileName: string): Promise<void> {
    try {
      await this.httpClient.post(this.config.endpoints.files + `/${fileName}`, {
        command: 'select',
        print: true
      });
      
      logger.info(`Started printing ${fileName} on printer ${this.printerId}`);
      this.emit('printStarted', { printerId: this.printerId, fileName });
    } catch (error) {
      logger.error(`Failed to start print on printer ${this.printerId}:`, error);
      throw error;
    }
  }

  public async pausePrint(): Promise<void> {
    try {
      await this.httpClient.post(this.config.endpoints.job, {
        command: 'pause',
        action: 'pause'
      });
      
      logger.info(`Paused print on printer ${this.printerId}`);
      this.emit('printPaused', { printerId: this.printerId });
    } catch (error) {
      logger.error(`Failed to pause print on printer ${this.printerId}:`, error);
      throw error;
    }
  }

  public async resumePrint(): Promise<void> {
    try {
      await this.httpClient.post(this.config.endpoints.job, {
        command: 'pause',
        action: 'resume'
      });
      
      logger.info(`Resumed print on printer ${this.printerId}`);
      this.emit('printResumed', { printerId: this.printerId });
    } catch (error) {
      logger.error(`Failed to resume print on printer ${this.printerId}:`, error);
      throw error;
    }
  }

  public async cancelPrint(): Promise<void> {
    try {
      await this.httpClient.post(this.config.endpoints.job, {
        command: 'cancel'
      });
      
      logger.info(`Cancelled print on printer ${this.printerId}`);
      this.emit('printCancelled', { printerId: this.printerId });
    } catch (error) {
      logger.error(`Failed to cancel print on printer ${this.printerId}:`, error);
      throw error;
    }
  }

  private async testConnection(): Promise<void> {
    try {
      const response = await this.httpClient.get('/api/version');
      logger.debug(`Network printer ${this.printerId} version:`, response.data);
    } catch (error) {
      throw new Error(`Failed to connect to printer API: ${error.message}`);
    }
  }

  private async initializePrinter(): Promise<void> {
    try {
      // Get initial status
      await this.getStatus();
      
      // Additional initialization based on printer type
      logger.info(`Network printer ${this.printerId} initialized successfully`);
    } catch (error) {
      logger.error(`Failed to initialize network printer ${this.printerId}:`, error);
      throw error;
    }
  }

  private startStatusPolling(): void {
    this.statusPollInterval = setInterval(async () => {
      try {
        const status = await this.getStatus();
        this.emit('statusUpdate', status);
        
        // Check for status changes
        if (this.lastKnownStatus && this.lastKnownStatus.status !== status.status) {
          this.emit('statusChanged', {
            printerId: this.printerId,
            oldStatus: this.lastKnownStatus.status,
            newStatus: status.status
          });
        }
        
        // Emit specific events
        if (status.status === PrinterStatus.ERROR) {
          this.emit('error', {
            printerId: this.printerId,
            error: {
              code: 'PRINTER_ERROR',
              message: 'Printer reported error status',
              severity: 'error',
              timestamp: new Date(),
              recoverable: true
            }
          });
        }
      } catch (error) {
        logger.error(`Status polling failed for printer ${this.printerId}:`, error);
        this.handleConnectionError(error);
      }
    }, 5000); // Poll every 5 seconds
  }

  private stopStatusPolling(): void {
    if (this.statusPollInterval) {
      clearInterval(this.statusPollInterval);
      this.statusPollInterval = null;
    }
  }

  private async sendGCodeCommand(gcode: string, parameters?: Record<string, any>): Promise<AxiosResponse> {
    const commands = Array.isArray(gcode) ? gcode : [gcode];
    
    return this.httpClient.post(this.config.endpoints.command, {
      commands,
      parameters
    });
  }

  private async sendControlCommand(command: string, parameters?: Record<string, any>): Promise<AxiosResponse> {
    switch (command) {
      case 'connect':
        return this.httpClient.post('/api/connection', { command: 'connect' });
      case 'disconnect':
        return this.httpClient.post('/api/connection', { command: 'disconnect' });
      case 'home':
        return this.sendGCodeCommand(['G28']);
      default:
        throw new Error(`Unknown control command: ${command}`);
    }
  }

  private async sendTemperatureCommand(command: string, parameters?: Record<string, any>): Promise<AxiosResponse> {
    const { temperature, tool = 0 } = parameters || {};
    
    switch (command) {
      case 'setHotend':
        return this.sendGCodeCommand(`M104 T${tool} S${temperature}`);
      case 'setBed':
        return this.sendGCodeCommand(`M140 S${temperature}`);
      default:
        throw new Error(`Unknown temperature command: ${command}`);
    }
  }

  private async sendMovementCommand(command: string, parameters?: Record<string, any>): Promise<AxiosResponse> {
    const { x, y, z, e, f } = parameters || {};
    const coords = [];
    
    if (x !== undefined) coords.push(`X${x}`);
    if (y !== undefined) coords.push(`Y${y}`);
    if (z !== undefined) coords.push(`Z${z}`);
    if (e !== undefined) coords.push(`E${e}`);
    if (f !== undefined) coords.push(`F${f}`);
    
    return this.sendGCodeCommand(`G1 ${coords.join(' ')}`);
  }

  private parseStatusResponse(data: any): PrinterInfo {
    // Parse OctoPrint-style API response
    const state = data.state?.text || 'Unknown';
    const temperature = data.temperature || {};
    const progress = data.progress || {};
    
    let status: PrinterStatus;
    switch (state.toLowerCase()) {
      case 'printing':
        status = PrinterStatus.PRINTING;
        break;
      case 'paused':
        status = PrinterStatus.PAUSED;
        break;
      case 'operational':
        status = PrinterStatus.IDLE;
        break;
      case 'offline':
        status = PrinterStatus.OFFLINE;
        break;
      case 'error':
        status = PrinterStatus.ERROR;
        break;
      default:
        status = PrinterStatus.IDLE;
    }
    
    return {
      id: this.printerId,
      name: `Network Printer ${this.printerId}`,
      type: 'FDM',
      connectionType: 'network' as any,
      status,
      temperature: {
        hotend: temperature.tool0?.actual || 0,
        bed: temperature.bed?.actual || 0,
        targetHotend: temperature.tool0?.target || 0,
        targetBed: temperature.bed?.target || 0
      },
      position: {
        x: 0, // Position data might not be available in all APIs
        y: 0,
        z: 0
      },
      progress: progress.completion || 0,
      lastUpdate: new Date(),
      capabilities: {
        maxTempHotend: 300,
        maxTempBed: 100,
        buildVolume: { x: 220, y: 220, z: 250 }
      }
    };
  }

  private parseCommandResponse(data: any): string {
    if (typeof data === 'string') return data;
    if (data.result) return data.result;
    if (data.response) return data.response;
    return JSON.stringify(data);
  }

  private handleConnectionError(error: any): void {
    this.isConnected = false;
    this.emit('connectionError', { printerId: this.printerId, error });
    this.attemptReconnect();
  }

  private async attemptReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error(`Max reconnection attempts reached for network printer ${this.printerId}`);
      return;
    }

    this.reconnectAttempts++;
    logger.info(`Attempting to reconnect to network printer ${this.printerId} (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect().catch(err => {
        logger.error(`Reconnection attempt ${this.reconnectAttempts} failed:`, err);
      });
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  private setupHttpInterceptors(): void {
    this.httpClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
          this.handleConnectionError(error);
        }
        return Promise.reject(error);
      }
    );
  }
}
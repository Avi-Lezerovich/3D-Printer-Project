import { EventEmitter } from 'events';
import { Server as SocketIOServer } from 'socket.io';
import { PrinterManager } from '../printer/core/PrinterManager.js';
import { PrintQueueManager } from '../printer/queue/PrintQueueManager.js';
import { PrinterEventBroadcaster } from '../printer/realtime/PrinterEventBroadcaster.js';
import { DataProcessor } from '../realtime/DataProcessor.js';
import { FileProcessor } from '../background/FileProcessor.js';
import { PrintScheduler } from '../background/PrintScheduler.js';
import { logger } from '../utils/logger.js';

export interface IntegrationConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  processing: {
    dataBufferSize: number;
    processingInterval: number;
    metricsRetention: number;
  };
  scheduling: {
    optimizationEnabled: boolean;
    periodicOptimization: boolean;
  };
  broadcasting: {
    compressionEnabled: boolean;
    batchingEnabled: boolean;
    rateLimit: number;
  };
}

export class IntegrationOrchestrator extends EventEmitter {
  private printerManager: PrinterManager;
  private queueManager: PrintQueueManager;
  private eventBroadcaster: PrinterEventBroadcaster;
  private dataProcessor: DataProcessor;
  private fileProcessor: FileProcessor;
  private printScheduler: PrintScheduler;
  private config: IntegrationConfig;
  private isInitialized = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(io: SocketIOServer, config: IntegrationConfig) {
    super();
    this.config = config;

    // Initialize core components
    this.queueManager = new PrintQueueManager(config.redis);
    this.eventBroadcaster = new PrinterEventBroadcaster(io);
    this.printerManager = new PrinterManager(this.queueManager, this.eventBroadcaster);
    
    this.dataProcessor = new DataProcessor({
      bufferSize: config.processing.dataBufferSize,
      processingInterval: config.processing.processingInterval,
      metricsRetentionPeriod: config.processing.metricsRetention,
      anomalyThresholds: {
        temperatureVariation: 5.0,
        progressRateMin: 0.1,
        progressRateMax: 10.0
      }
    });

    this.fileProcessor = new FileProcessor(config.redis);
    this.printScheduler = new PrintScheduler(config.redis);

    this.setupIntegrations();
  }

  public async initialize(): Promise<void> {
    try {
      logger.info('Initializing 3D Printer Integration System...');

      // Configure components
      this.eventBroadcaster.configureBroadcasting({
        compressionEnabled: this.config.broadcasting.compressionEnabled,
        batchingEnabled: this.config.broadcasting.batchingEnabled
      });

      // Start health monitoring
      this.startHealthMonitoring();

      this.isInitialized = true;
      logger.info('Integration system initialized successfully');
      this.emit('initialized');
    } catch (error) {
      logger.error('Failed to initialize integration system:', error);
      throw error;
    }
  }

  private setupIntegrations(): void {
    // Printer Manager Events
    this.printerManager.on('printerConnected', (printerId) => {
      this.eventBroadcaster.broadcastPrinterEvent('connected', printerId, null);
      this.emit('printerConnected', printerId);
    });

    this.printerManager.on('printerDisconnected', (printerId) => {
      this.eventBroadcaster.broadcastPrinterEvent('disconnected', printerId, null);
      this.emit('printerDisconnected', printerId);
    });

    this.printerManager.on('printerStatusUpdate', (printerId, status) => {
      this.dataProcessor.processPrinterData(printerId, status);
      this.eventBroadcaster.broadcastPrinterEvent('statusUpdate', printerId, status);
    });

    this.printerManager.on('printStarted', (data) => {
      this.eventBroadcaster.broadcastPrintEvent('started', data.printerId, data);
    });

    this.printerManager.on('printCompleted', (data) => {
      this.eventBroadcaster.broadcastPrintEvent('completed', data.printerId, data);
      this.printScheduler.rescheduleJobs('print_completed').catch(error => {
        logger.error('Failed to reschedule jobs after print completion:', error);
      });
    });

    this.printerManager.on('printFailed', (data) => {
      this.eventBroadcaster.broadcastPrintEvent('failed', data.printerId, data);
      this.printScheduler.rescheduleJobs('print_failed', [data.jobId]).catch(error => {
        logger.error('Failed to reschedule jobs after print failure:', error);
      });
    });

    // Queue Manager Events
    this.queueManager.on('jobAdded', (job) => {
      this.eventBroadcaster.broadcastQueueEvent('jobAdded', job);
      this.printScheduler.scheduleJobs([job]).catch(error => {
        logger.error('Failed to schedule new job:', error);
      });
    });

    this.queueManager.on('jobStarted', (job) => {
      this.dataProcessor.processJobUpdate(job);
      this.eventBroadcaster.broadcastQueueEvent('jobStarted', job);
    });

    this.queueManager.on('jobProgress', (job) => {
      this.dataProcessor.processJobUpdate(job);
      this.eventBroadcaster.broadcastQueueEvent('jobProgress', job);
    });

    this.queueManager.on('jobCompleted', (job) => {
      this.eventBroadcaster.broadcastQueueEvent('jobCompleted', job);
    });

    this.queueManager.on('jobFailed', ({ job, error }) => {
      this.eventBroadcaster.broadcastQueueEvent('jobFailed', { job, error });
    });

    this.queueManager.on('queueUpdated', () => {
      const queue = this.queueManager.getQueue();
      this.eventBroadcaster.broadcastQueueEvent('queueUpdated', queue);
    });

    // Data Processor Events
    this.dataProcessor.on('processedData', (data) => {
      this.eventBroadcaster.broadcastDataUpdate(data);
    });

    this.dataProcessor.on('anomaliesDetected', ({ printerId, anomalies }) => {
      this.eventBroadcaster.broadcastAnomalies(printerId, anomalies);
      this.handleAnomalies(printerId, anomalies);
    });

    // File Processor Events
    this.fileProcessor.on('fileQueued', (job) => {
      this.eventBroadcaster.broadcastSystemAlert({
        type: 'file_processing',
        message: `File ${job.fileName} queued for processing`,
        severity: 'info',
        data: job
      });
    });

    this.fileProcessor.on('jobProgress', ({ jobId, fileName, progress }) => {
      this.eventBroadcaster.broadcastSystemAlert({
        type: 'file_progress',
        message: `Processing ${fileName}: ${progress}%`,
        severity: 'info',
        data: { jobId, fileName, progress }
      });
    });

    this.fileProcessor.on('fileProcessed', (result) => {
      this.eventBroadcaster.broadcastSystemAlert({
        type: 'file_processed',
        message: `File processing completed: ${result.id}`,
        severity: 'info',
        data: result
      });
    });

    this.fileProcessor.on('fileProcessingFailed', ({ data, error }) => {
      this.eventBroadcaster.broadcastSystemAlert({
        type: 'file_error',
        message: `File processing failed: ${data.fileName} - ${error}`,
        severity: 'error',
        data: { file: data, error }
      });
    });

    // Print Scheduler Events
    this.printScheduler.on('scheduleGenerated', (schedule) => {
      this.eventBroadcaster.broadcastSystemAlert({
        type: 'schedule_updated',
        message: `New print schedule generated with ${schedule.assignments.length} jobs`,
        severity: 'info',
        data: schedule
      });
    });

    this.printScheduler.on('schedulingFailed', ({ job, error }) => {
      this.eventBroadcaster.broadcastSystemAlert({
        type: 'scheduling_error',
        message: `Scheduling failed: ${error}`,
        severity: 'error',
        data: { job, error }
      });
    });

    // Event Broadcaster Events
    this.eventBroadcaster.on('clientDisconnected', ({ socketId }) => {
      logger.debug(`Client disconnected: ${socketId}`);
    });

    this.eventBroadcaster.on('eventBroadcast', ({ event, targetCount }) => {
      logger.debug(`Broadcasted ${event.type} to ${targetCount} clients`);
    });
  }

  private async handleAnomalies(printerId: string, anomalies: any[]): Promise<void> {
    try {
      // Handle high-severity anomalies
      const highSeverityAnomalies = anomalies.filter(a => a.severity === 'high');
      
      if (highSeverityAnomalies.length > 0) {
        logger.warn(`High severity anomalies detected on printer ${printerId}:`, highSeverityAnomalies);
        
        // Pause printer if critical temperature anomalies
        const tempAnomalies = highSeverityAnomalies.filter(a => 
          a.type === 'temperature_spike' || a.type === 'temperature_drop'
        );
        
        if (tempAnomalies.length > 0) {
          await this.printerManager.sendCommand(printerId, {
            type: 'control',
            command: 'pause',
            priority: 10
          });
          
          this.eventBroadcaster.broadcastSystemAlert({
            type: 'emergency_pause',
            message: `Printer ${printerId} paused due to temperature anomaly`,
            severity: 'high',
            data: { printerId, anomalies: tempAnomalies }
          });
        }
      }
    } catch (error) {
      logger.error(`Failed to handle anomalies for printer ${printerId}:`, error);
    }
  }

  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        logger.error('Health check failed:', error);
      }
    }, 30000); // Every 30 seconds
  }

  private async performHealthCheck(): Promise<void> {
    const health = {
      timestamp: new Date(),
      printerManager: {
        connectedPrinters: this.printerManager.getConnectedPrinters().length
      },
      queueManager: {
        stats: this.queueManager.getQueueStats()
      },
      dataProcessor: {
        // Add data processor health metrics
      },
      fileProcessor: {
        stats: await this.fileProcessor.getQueueStats()
      },
      printScheduler: {
        stats: await this.printScheduler.getQueueStats()
      },
      eventBroadcaster: {
        stats: this.eventBroadcaster.getConnectionStats()
      }
    };

    this.emit('healthCheck', health);
  }

  // Public API Methods
  public async addPrinter(config: any): Promise<void> {
    return this.printerManager.addPrinter(config);
  }

  public async removePrinter(printerId: string): Promise<void> {
    return this.printerManager.removePrinter(printerId);
  }

  public async addPrintJob(job: any): Promise<string> {
    return this.queueManager.addJob(job);
  }

  public async processFile(fileJob: any): Promise<string> {
    return this.fileProcessor.addFileForProcessing(fileJob);
  }

  public async scheduleJobs(jobs: any[], constraints?: any): Promise<string> {
    return this.printScheduler.scheduleJobs(jobs, constraints);
  }

  public async sendPrinterCommand(printerId: string, command: any): Promise<string> {
    return this.printerManager.sendCommand(printerId, command);
  }

  public async getPrinterStatus(printerId: string): Promise<any> {
    return this.printerManager.getPrinterStatus(printerId);
  }

  public getAllPrinterStatus(): Promise<any[]> {
    return this.printerManager.getAllPrinterStatus();
  }

  public getProcessedData(printerId: string): any {
    return this.dataProcessor.getProcessedData(printerId);
  }

  public getMetricsHistory(printerId: string, hours?: number): any[] {
    return this.dataProcessor.getMetricsHistory(printerId, hours);
  }

  public getQueue(): any[] {
    return this.queueManager.getQueue();
  }

  public getPrinterQueue(printerId: string): any[] {
    return this.queueManager.getPrinterQueue(printerId);
  }

  public getActiveSchedules(): any[] {
    return this.printScheduler.getAllActiveSchedules();
  }

  public getBroadcastingStats(): any {
    return this.eventBroadcaster.getConnectionStats();
  }

  public async getSystemHealth(): Promise<any> {
    return new Promise((resolve) => {
      this.performHealthCheck().then(() => {
        this.once('healthCheck', resolve);
      });
    });
  }

  public updateSchedulingConstraints(constraints: any): void {
    this.printScheduler.updateSchedulingConstraints(constraints);
  }

  public updatePrinterCapabilities(printerId: string, capabilities: any): void {
    this.printScheduler.updatePrinterCapabilities(printerId, capabilities);
  }

  public configureBroadcasting(config: any): void {
    this.eventBroadcaster.configureBroadcasting(config);
  }

  public async cleanup(): Promise<void> {
    try {
      logger.info('Cleaning up integration system...');

      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
        this.healthCheckInterval = null;
      }

      await Promise.all([
        this.printerManager.cleanup(),
        this.queueManager.cleanup(),
        this.dataProcessor.cleanup(),
        this.fileProcessor.cleanup(),
        this.printScheduler.cleanup(),
        this.eventBroadcaster.cleanup()
      ]);

      this.isInitialized = false;
      logger.info('Integration system cleaned up successfully');
    } catch (error) {
      logger.error('Failed to cleanup integration system:', error);
      throw error;
    }
  }

  public isReady(): boolean {
    return this.isInitialized;
  }
}

// Integration flow example usage
export const createIntegrationSystem = (io: SocketIOServer, config: IntegrationConfig) => {
  const orchestrator = new IntegrationOrchestrator(io, config);
  return orchestrator;
};
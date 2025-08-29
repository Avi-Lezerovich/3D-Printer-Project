import { EventEmitter } from 'events';
import { PrinterInfo, PrintJob, PrintJobStatus } from '../printer/types.js';
import { logger } from '../utils/logger.js';

export interface DataProcessorConfig {
  bufferSize: number;
  processingInterval: number;
  anomalyThresholds: {
    temperatureVariation: number;
    progressRateMin: number;
    progressRateMax: number;
  };
  metricsRetentionPeriod: number;
}

export interface ProcessedData {
  timestamp: Date;
  printerId: string;
  metrics: {
    temperature: {
      hotend: { current: number; target: number; variance: number };
      bed: { current: number; target: number; variance: number };
    };
    progress: {
      current: number;
      rate: number; // Progress per minute
      estimatedCompletion: Date | null;
    };
    performance: {
      layerTime: number;
      averageLayerTime: number;
      efficiency: number;
    };
  };
  anomalies: Anomaly[];
}

export interface Anomaly {
  type: 'temperature_spike' | 'temperature_drop' | 'progress_stall' | 'unusual_progress_rate';
  severity: 'low' | 'medium' | 'high';
  message: string;
  value: number;
  threshold: number;
  timestamp: Date;
}

export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  metadata?: Record<string, any>;
}

export class DataProcessor extends EventEmitter {
  private config: DataProcessorConfig;
  private dataBuffers = new Map<string, TimeSeriesData[]>();
  private lastProcessedData = new Map<string, ProcessedData>();
  private processingInterval: NodeJS.Timeout | null = null;
  private metricsHistory = new Map<string, ProcessedData[]>();

  constructor(config: DataProcessorConfig) {
    super();
    this.config = config;
    this.startProcessing();
  }

  public processPrinterData(printerId: string, data: PrinterInfo): void {
    try {
      // Store raw data in time series buffers
      this.storeTimeSeriesData(printerId, 'temperature_hotend', data.temperature.hotend);
      this.storeTimeSeriesData(printerId, 'temperature_bed', data.temperature.bed);
      this.storeTimeSeriesData(printerId, 'progress', data.progress);
      
      // Emit raw data event for immediate processing
      this.emit('rawData', { printerId, data });
    } catch (error) {
      logger.error(`Error processing printer data for ${printerId}:`, error);
    }
  }

  public processJobUpdate(job: PrintJob): void {
    try {
      this.storeTimeSeriesData(job.printerId, 'job_progress', job.progress, {
        jobId: job.id,
        status: job.status,
        remainingTime: job.remainingTime
      });

      this.emit('jobUpdate', job);
    } catch (error) {
      logger.error(`Error processing job update for ${job.id}:`, error);
    }
  }

  public getProcessedData(printerId: string): ProcessedData | undefined {
    return this.lastProcessedData.get(printerId);
  }

  public getMetricsHistory(printerId: string, hours: number = 24): ProcessedData[] {
    const history = this.metricsHistory.get(printerId) || [];
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return history.filter(data => data.timestamp >= cutoff);
  }

  public getTimeSeriesData(printerId: string, metric: string, hours: number = 1): TimeSeriesData[] {
    const key = `${printerId}:${metric}`;
    const data = this.dataBuffers.get(key) || [];
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return data.filter(point => point.timestamp >= cutoff);
  }

  public calculateAggregateMetrics(printerIds: string[]): any {
    const metrics = {
      totalPrinters: printerIds.length,
      activePrinters: 0,
      totalJobs: 0,
      averageProgress: 0,
      temperatureStats: {
        averageHotend: 0,
        averageBed: 0,
        hotendVariance: 0,
        bedVariance: 0
      },
      anomalyCount: 0
    };

    let totalProgress = 0;
    let totalHotend = 0;
    let totalBed = 0;
    let hotendTemps: number[] = [];
    let bedTemps: number[] = [];

    for (const printerId of printerIds) {
      const data = this.lastProcessedData.get(printerId);
      if (data) {
        if (data.metrics.progress.current > 0) {
          metrics.activePrinters++;
          totalProgress += data.metrics.progress.current;
        }
        
        totalHotend += data.metrics.temperature.hotend.current;
        totalBed += data.metrics.temperature.bed.current;
        hotendTemps.push(data.metrics.temperature.hotend.current);
        bedTemps.push(data.metrics.temperature.bed.current);
        
        metrics.anomalyCount += data.anomalies.length;
        metrics.totalJobs++;
      }
    }

    if (metrics.activePrinters > 0) {
      metrics.averageProgress = totalProgress / metrics.activePrinters;
    }

    if (printerIds.length > 0) {
      metrics.temperatureStats.averageHotend = totalHotend / printerIds.length;
      metrics.temperatureStats.averageBed = totalBed / printerIds.length;
      metrics.temperatureStats.hotendVariance = this.calculateVariance(hotendTemps);
      metrics.temperatureStats.bedVariance = this.calculateVariance(bedTemps);
    }

    return metrics;
  }

  private startProcessing(): void {
    this.processingInterval = setInterval(() => {
      this.processAllBuffers();
    }, this.config.processingInterval);
  }

  private processAllBuffers(): void {
    for (const [key] of this.dataBuffers) {
      const [printerId] = key.split(':');
      if (printerId && !this.lastProcessedData.has(printerId)) {
        continue; // Skip if we don't have enough data yet
      }
      
      try {
        this.processBuffer(printerId);
      } catch (error) {
        logger.error(`Error processing buffer for ${printerId}:`, error);
      }
    }
  }

  private processBuffer(printerId: string): void {
    const tempHotendData = this.getTimeSeriesData(printerId, 'temperature_hotend', 0.5);
    const tempBedData = this.getTimeSeriesData(printerId, 'temperature_bed', 0.5);
    const progressData = this.getTimeSeriesData(printerId, 'progress', 1);

    if (tempHotendData.length === 0 || tempBedData.length === 0) {
      return; // Not enough data to process
    }

    const latestHotend = tempHotendData[tempHotendData.length - 1];
    const latestBed = tempBedData[tempBedData.length - 1];
    const latestProgress = progressData[progressData.length - 1];

    // Calculate temperature variance
    const hotendVariance = this.calculateVariance(tempHotendData.map(d => d.value));
    const bedVariance = this.calculateVariance(tempBedData.map(d => d.value));

    // Calculate progress rate (progress per minute)
    let progressRate = 0;
    let estimatedCompletion: Date | null = null;
    
    if (progressData.length >= 2) {
      const timeSpan = (progressData[progressData.length - 1].timestamp.getTime() - 
                       progressData[0].timestamp.getTime()) / (1000 * 60); // minutes
      const progressChange = progressData[progressData.length - 1].value - progressData[0].value;
      
      if (timeSpan > 0) {
        progressRate = progressChange / timeSpan;
        
        // Estimate completion time
        if (progressRate > 0 && latestProgress) {
          const remainingProgress = 100 - latestProgress.value;
          const remainingMinutes = remainingProgress / progressRate;
          estimatedCompletion = new Date(Date.now() + remainingMinutes * 60 * 1000);
        }
      }
    }

    // Detect anomalies
    const anomalies = this.detectAnomalies(printerId, {
      hotendTemp: latestHotend?.value || 0,
      bedTemp: latestBed?.value || 0,
      hotendVariance,
      bedVariance,
      progressRate,
      currentProgress: latestProgress?.value || 0
    });

    // Create processed data
    const processedData: ProcessedData = {
      timestamp: new Date(),
      printerId,
      metrics: {
        temperature: {
          hotend: {
            current: latestHotend?.value || 0,
            target: 0, // Would need to be passed from printer data
            variance: hotendVariance
          },
          bed: {
            current: latestBed?.value || 0,
            target: 0, // Would need to be passed from printer data
            variance: bedVariance
          }
        },
        progress: {
          current: latestProgress?.value || 0,
          rate: progressRate,
          estimatedCompletion
        },
        performance: {
          layerTime: 0, // Would need layer-specific data
          averageLayerTime: 0,
          efficiency: this.calculateEfficiency(progressRate)
        }
      },
      anomalies
    };

    // Store processed data
    this.lastProcessedData.set(printerId, processedData);
    
    // Store in history
    const history = this.metricsHistory.get(printerId) || [];
    history.push(processedData);
    
    // Limit history size based on retention period
    const cutoff = new Date(Date.now() - this.config.metricsRetentionPeriod);
    const filteredHistory = history.filter(data => data.timestamp >= cutoff);
    this.metricsHistory.set(printerId, filteredHistory);

    // Emit processed data
    this.emit('processedData', processedData);

    // Emit anomalies if any
    if (anomalies.length > 0) {
      this.emit('anomaliesDetected', { printerId, anomalies });
    }
  }

  private storeTimeSeriesData(printerId: string, metric: string, value: number, metadata?: Record<string, any>): void {
    const key = `${printerId}:${metric}`;
    
    if (!this.dataBuffers.has(key)) {
      this.dataBuffers.set(key, []);
    }
    
    const buffer = this.dataBuffers.get(key)!;
    buffer.push({
      timestamp: new Date(),
      value,
      metadata
    });

    // Limit buffer size
    if (buffer.length > this.config.bufferSize) {
      buffer.splice(0, buffer.length - this.config.bufferSize);
    }
  }

  private detectAnomalies(printerId: string, data: {
    hotendTemp: number;
    bedTemp: number;
    hotendVariance: number;
    bedVariance: number;
    progressRate: number;
    currentProgress: number;
  }): Anomaly[] {
    const anomalies: Anomaly[] = [];
    const thresholds = this.config.anomalyThresholds;

    // Temperature variance anomalies
    if (data.hotendVariance > thresholds.temperatureVariation) {
      anomalies.push({
        type: 'temperature_spike',
        severity: data.hotendVariance > thresholds.temperatureVariation * 2 ? 'high' : 'medium',
        message: `Hotend temperature variance (${data.hotendVariance.toFixed(2)}°C) exceeds threshold`,
        value: data.hotendVariance,
        threshold: thresholds.temperatureVariation,
        timestamp: new Date()
      });
    }

    if (data.bedVariance > thresholds.temperatureVariation) {
      anomalies.push({
        type: 'temperature_spike',
        severity: data.bedVariance > thresholds.temperatureVariation * 2 ? 'high' : 'medium',
        message: `Bed temperature variance (${data.bedVariance.toFixed(2)}°C) exceeds threshold`,
        value: data.bedVariance,
        threshold: thresholds.temperatureVariation,
        timestamp: new Date()
      });
    }

    // Progress rate anomalies
    if (data.currentProgress > 0 && data.currentProgress < 100) {
      if (data.progressRate < thresholds.progressRateMin) {
        anomalies.push({
          type: 'progress_stall',
          severity: data.progressRate === 0 ? 'high' : 'medium',
          message: `Progress rate (${data.progressRate.toFixed(2)}%/min) below minimum threshold`,
          value: data.progressRate,
          threshold: thresholds.progressRateMin,
          timestamp: new Date()
        });
      }

      if (data.progressRate > thresholds.progressRateMax) {
        anomalies.push({
          type: 'unusual_progress_rate',
          severity: 'medium',
          message: `Progress rate (${data.progressRate.toFixed(2)}%/min) above maximum threshold`,
          value: data.progressRate,
          threshold: thresholds.progressRateMax,
          timestamp: new Date()
        });
      }
    }

    return anomalies;
  }

  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length);
  }

  private calculateEfficiency(progressRate: number): number {
    // Simple efficiency calculation based on expected progress rate
    const expectedRate = 1.0; // 1% per minute as baseline
    return Math.min(100, (progressRate / expectedRate) * 100);
  }

  public cleanup(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }

    this.dataBuffers.clear();
    this.lastProcessedData.clear();
    this.metricsHistory.clear();
    
    logger.info('Data processor cleaned up');
  }
}
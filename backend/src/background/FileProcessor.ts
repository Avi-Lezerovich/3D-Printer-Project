import { Queue, Job, Worker } from 'bullmq';
import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';
import { logger } from '../utils/logger.js';

export interface FileProcessingJob {
  id: string;
  filePath: string;
  fileName: string;
  fileType: 'gcode' | 'stl' | 'obj' | '3mf' | 'amf';
  uploadedBy?: string;
  uploadedAt: Date;
  metadata?: {
    originalSize: number;
    mimeType?: string;
  };
}

export interface ProcessedFileResult {
  id: string;
  processedPath: string;
  thumbnailPath?: string;
  metadata: {
    layerHeight?: number;
    printTime?: number;
    filamentUsed?: number;
    layerCount?: number;
    boundingBox?: {
      x: { min: number; max: number };
      y: { min: number; max: number };
      z: { min: number; max: number };
    };
  };
  gcodeAnalysis?: {
    totalLines: number;
    estimatedPrintTime: number;
    filamentLength: number;
    temperatures: {
      hotend: number[];
      bed: number[];
    };
  };
  processingTime: number;
  status: 'completed' | 'failed';
  error?: string;
}

export class FileProcessor extends EventEmitter {
  private queue: Queue<FileProcessingJob>;
  private worker: Worker<FileProcessingJob, ProcessedFileResult>;
  private processingDirectory: string;
  private thumbnailDirectory: string;
  private maxFileSize: number;
  private supportedFormats: Set<string>;

  constructor(redisConfig?: any) {
    super();
    
    this.processingDirectory = process.env.PROCESSING_DIR || './uploads/processing';
    this.thumbnailDirectory = process.env.THUMBNAIL_DIR || './uploads/thumbnails';
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '500000000'); // 500MB default
    this.supportedFormats = new Set(['gcode', 'stl', 'obj', '3mf', 'amf']);

    this.queue = new Queue<FileProcessingJob>('file-processing', {
      connection: redisConfig || {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379')
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000
        },
        removeOnComplete: 50,
        removeOnFail: 20
      }
    });

    this.worker = new Worker<FileProcessingJob, ProcessedFileResult>(
      'file-processing',
      this.processFile.bind(this),
      {
        connection: redisConfig || {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379')
        },
        concurrency: parseInt(process.env.FILE_PROCESSOR_CONCURRENCY || '3')
      }
    );

    this.setupWorkerHandlers();
    this.ensureDirectories();
  }

  public async addFileForProcessing(job: FileProcessingJob): Promise<string> {
    try {
      // Validate file
      await this.validateFile(job);

      // Add to processing queue
      const bullJob = await this.queue.add('process', job, {
        priority: this.getJobPriority(job.fileType),
        delay: 0
      });

      logger.info(`Added file ${job.fileName} to processing queue with job ID: ${bullJob.id}`);
      this.emit('fileQueued', job);

      return bullJob.id!;
    } catch (error) {
      logger.error(`Failed to queue file ${job.fileName} for processing:`, error);
      throw error;
    }
  }

  public async getJobStatus(jobId: string): Promise<any> {
    try {
      const job = await this.queue.getJob(jobId);
      if (!job) {
        throw new Error(`Job ${jobId} not found`);
      }

      return {
        id: job.id,
        data: job.data,
        progress: job.progress,
        state: await job.getState(),
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
        failedReason: job.failedReason,
        returnvalue: job.returnvalue
      };
    } catch (error) {
      logger.error(`Failed to get job status for ${jobId}:`, error);
      throw error;
    }
  }

  public async cancelJob(jobId: string): Promise<void> {
    try {
      const job = await this.queue.getJob(jobId);
      if (job) {
        await job.remove();
        logger.info(`Cancelled processing job ${jobId}`);
        this.emit('jobCancelled', { jobId });
      }
    } catch (error) {
      logger.error(`Failed to cancel job ${jobId}:`, error);
      throw error;
    }
  }

  private async processFile(job: Job<FileProcessingJob>): Promise<ProcessedFileResult> {
    const startTime = Date.now();
    const { data } = job;

    try {
      logger.info(`Processing file: ${data.fileName} (${data.fileType})`);
      
      // Update progress
      await job.updateProgress(10);

      // Read and analyze file
      const fileContent = await fs.readFile(data.filePath);
      await job.updateProgress(30);

      let result: ProcessedFileResult = {
        id: data.id,
        processedPath: data.filePath,
        metadata: {},
        processingTime: 0,
        status: 'completed'
      };

      // Process based on file type
      switch (data.fileType) {
        case 'gcode':
          result = await this.processGCodeFile(job, fileContent);
          break;
        case 'stl':
          result = await this.processSTLFile(job, fileContent);
          break;
        case 'obj':
          result = await this.processOBJFile(job, fileContent);
          break;
        case '3mf':
          result = await this.process3MFFile(job, fileContent);
          break;
        case 'amf':
          result = await this.processAMFFile(job, fileContent);
          break;
        default:
          throw new Error(`Unsupported file type: ${data.fileType}`);
      }

      await job.updateProgress(90);

      // Generate thumbnail if possible
      if (['stl', 'obj'].includes(data.fileType)) {
        result.thumbnailPath = await this.generateThumbnail(data, fileContent);
      }

      result.processingTime = Date.now() - startTime;
      await job.updateProgress(100);

      logger.info(`Successfully processed file: ${data.fileName} in ${result.processingTime}ms`);
      this.emit('fileProcessed', result);

      return result;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorResult: ProcessedFileResult = {
        id: data.id,
        processedPath: data.filePath,
        metadata: {},
        processingTime,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error)
      };

      logger.error(`Failed to process file ${data.fileName}:`, error);
      this.emit('fileProcessingFailed', { data, error: errorResult.error });

      return errorResult;
    }
  }

  private async processGCodeFile(job: Job<FileProcessingJob>, content: Buffer): Promise<ProcessedFileResult> {
    const lines = content.toString().split('\n');
    const analysis = {
      totalLines: lines.length,
      estimatedPrintTime: 0,
      filamentLength: 0,
      temperatures: {
        hotend: [] as number[],
        bed: [] as number[]
      }
    };

    let layerCount = 0;
    let currentZ = 0;
    let maxZ = 0;
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity;

    await job.updateProgress(40);

    // Analyze G-code
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith(';LAYER:') || line.includes('layer')) {
        layerCount++;
      }

      if (line.startsWith('G1') || line.startsWith('G0')) {
        // Extract coordinates
        const xMatch = line.match(/X([-+]?[0-9]*\.?[0-9]+)/);
        const yMatch = line.match(/Y([-+]?[0-9]*\.?[0-9]+)/);
        const zMatch = line.match(/Z([-+]?[0-9]*\.?[0-9]+)/);
        const eMatch = line.match(/E([-+]?[0-9]*\.?[0-9]+)/);

        if (xMatch) {
          const x = parseFloat(xMatch[1]);
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
        }

        if (yMatch) {
          const y = parseFloat(yMatch[1]);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }

        if (zMatch) {
          const z = parseFloat(zMatch[1]);
          currentZ = z;
          minZ = Math.min(minZ, z);
          maxZ = Math.max(maxZ, z);
        }

        if (eMatch && parseFloat(eMatch[1]) > 0) {
          analysis.filamentLength += parseFloat(eMatch[1]);
        }
      }

      // Extract temperature commands
      if (line.startsWith('M104') || line.startsWith('M109')) {
        const tempMatch = line.match(/S(\d+)/);
        if (tempMatch) {
          analysis.temperatures.hotend.push(parseInt(tempMatch[1]));
        }
      }

      if (line.startsWith('M140') || line.startsWith('M190')) {
        const tempMatch = line.match(/S(\d+)/);
        if (tempMatch) {
          analysis.temperatures.bed.push(parseInt(tempMatch[1]));
        }
      }

      // Estimate print time from time comments
      if (line.includes('TIME:') || line.includes('estimated printing time')) {
        const timeMatch = line.match(/(\d+)/);
        if (timeMatch) {
          analysis.estimatedPrintTime = parseInt(timeMatch[1]);
        }
      }

      // Progress update every 1000 lines
      if (i % 1000 === 0) {
        const progress = 40 + Math.floor((i / lines.length) * 40);
        await job.updateProgress(progress);
      }
    }

    return {
      id: job.data.id,
      processedPath: job.data.filePath,
      metadata: {
        layerCount: layerCount || undefined,
        printTime: analysis.estimatedPrintTime || undefined,
        filamentUsed: analysis.filamentLength || undefined,
        boundingBox: {
          x: { min: minX === Infinity ? 0 : minX, max: maxX === -Infinity ? 0 : maxX },
          y: { min: minY === Infinity ? 0 : minY, max: maxY === -Infinity ? 0 : maxY },
          z: { min: minZ === Infinity ? 0 : minZ, max: maxZ }
        }
      },
      gcodeAnalysis: analysis,
      processingTime: 0,
      status: 'completed'
    };
  }

  private async processSTLFile(job: Job<FileProcessingJob>, content: Buffer): Promise<ProcessedFileResult> {
    // Basic STL analysis
    let triangleCount = 0;
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    // Check if binary or ASCII STL
    const isBinary = !content.toString('utf8', 0, 100).toLowerCase().includes('solid');

    await job.updateProgress(50);

    if (isBinary) {
      // Binary STL format
      const triangleCountBuffer = content.slice(80, 84);
      triangleCount = triangleCountBuffer.readUInt32LE(0);

      // Process triangles to find bounding box
      let offset = 84;
      for (let i = 0; i < triangleCount && offset + 50 <= content.length; i++) {
        // Skip normal vector (12 bytes)
        offset += 12;
        
        // Read 3 vertices (9 floats, 36 bytes total)
        for (let v = 0; v < 3; v++) {
          const x = content.readFloatLE(offset);
          const y = content.readFloatLE(offset + 4);
          const z = content.readFloatLE(offset + 8);
          
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
          minZ = Math.min(minZ, z);
          maxZ = Math.max(maxZ, z);
          
          offset += 12;
        }
        
        // Skip attribute byte count (2 bytes)
        offset += 2;

        // Progress update
        if (i % 1000 === 0) {
          const progress = 50 + Math.floor((i / triangleCount) * 30);
          await job.updateProgress(progress);
        }
      }
    } else {
      // ASCII STL format - simplified parsing
      const lines = content.toString().split('\n');
      const vertexRegex = /vertex\s+([-+]?[0-9]*\.?[0-9]+)\s+([-+]?[0-9]*\.?[0-9]+)\s+([-+]?[0-9]*\.?[0-9]+)/;
      
      lines.forEach((line, index) => {
        const match = line.match(vertexRegex);
        if (match) {
          const x = parseFloat(match[1]);
          const y = parseFloat(match[2]);
          const z = parseFloat(match[3]);
          
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
          minZ = Math.min(minZ, z);
          maxZ = Math.max(maxZ, z);
        }

        if (line.includes('facet normal')) {
          triangleCount++;
        }

        if (index % 1000 === 0) {
          const progress = 50 + Math.floor((index / lines.length) * 30);
          job.updateProgress(progress);
        }
      });
    }

    return {
      id: job.data.id,
      processedPath: job.data.filePath,
      metadata: {
        boundingBox: {
          x: { min: minX === Infinity ? 0 : minX, max: maxX === -Infinity ? 0 : maxX },
          y: { min: minY === Infinity ? 0 : minY, max: maxY === -Infinity ? 0 : maxY },
          z: { min: minZ === Infinity ? 0 : minZ, max: maxZ === -Infinity ? 0 : maxZ }
        }
      },
      processingTime: 0,
      status: 'completed'
    };
  }

  private async processOBJFile(job: Job<FileProcessingJob>, content: Buffer): Promise<ProcessedFileResult> {
    // Basic OBJ file analysis
    const lines = content.toString().split('\n');
    let vertexCount = 0;
    let faceCount = 0;
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    await job.updateProgress(60);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('v ')) {
        // Vertex
        const parts = line.split(/\s+/);
        if (parts.length >= 4) {
          const x = parseFloat(parts[1]);
          const y = parseFloat(parts[2]);
          const z = parseFloat(parts[3]);
          
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
          minZ = Math.min(minZ, z);
          maxZ = Math.max(maxZ, z);
          
          vertexCount++;
        }
      } else if (line.startsWith('f ')) {
        // Face
        faceCount++;
      }

      if (i % 1000 === 0) {
        const progress = 60 + Math.floor((i / lines.length) * 20);
        await job.updateProgress(progress);
      }
    }

    return {
      id: job.data.id,
      processedPath: job.data.filePath,
      metadata: {
        boundingBox: {
          x: { min: minX === Infinity ? 0 : minX, max: maxX === -Infinity ? 0 : maxX },
          y: { min: minY === Infinity ? 0 : minY, max: maxY === -Infinity ? 0 : maxY },
          z: { min: minZ === Infinity ? 0 : minZ, max: maxZ === -Infinity ? 0 : maxZ }
        }
      },
      processingTime: 0,
      status: 'completed'
    };
  }

  private async process3MFFile(job: Job<FileProcessingJob>, content: Buffer): Promise<ProcessedFileResult> {
    // 3MF files are ZIP archives - simplified processing
    await job.updateProgress(70);
    
    return {
      id: job.data.id,
      processedPath: job.data.filePath,
      metadata: {},
      processingTime: 0,
      status: 'completed'
    };
  }

  private async processAMFFile(job: Job<FileProcessingJob>, content: Buffer): Promise<ProcessedFileResult> {
    // AMF files are XML-based - simplified processing
    await job.updateProgress(70);
    
    return {
      id: job.data.id,
      processedPath: job.data.filePath,
      metadata: {},
      processingTime: 0,
      status: 'completed'
    };
  }

  private async generateThumbnail(data: FileProcessingJob, content: Buffer): Promise<string> {
    try {
      // This would integrate with a 3D model thumbnail generator
      // For now, return a placeholder path
      const thumbnailPath = path.join(this.thumbnailDirectory, `${data.id}_thumbnail.png`);
      
      // Create a simple placeholder thumbnail
      await fs.writeFile(thumbnailPath, Buffer.from('placeholder thumbnail'));
      
      return thumbnailPath;
    } catch (error) {
      logger.error(`Failed to generate thumbnail for ${data.fileName}:`, error);
      return '';
    }
  }

  private async validateFile(job: FileProcessingJob): Promise<void> {
    // Check file exists
    try {
      const stats = await fs.stat(job.filePath);
      
      if (stats.size > this.maxFileSize) {
        throw new Error(`File size ${stats.size} exceeds maximum allowed size ${this.maxFileSize}`);
      }

      if (!this.supportedFormats.has(job.fileType)) {
        throw new Error(`Unsupported file type: ${job.fileType}`);
      }
    } catch (error) {
      throw new Error(`File validation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private getJobPriority(fileType: string): number {
    // Higher priority for G-code files as they're ready to print
    const priorities: Record<string, number> = {
      'gcode': 10,
      'stl': 5,
      'obj': 5,
      '3mf': 7,
      'amf': 3
    };
    
    return priorities[fileType] || 1;
  }

  private setupWorkerHandlers(): void {
    this.worker.on('completed', (job, result) => {
      logger.info(`File processing completed: ${job.data.fileName}`);
      this.emit('jobCompleted', { job: job.data, result });
    });

    this.worker.on('failed', (job, error) => {
      logger.error(`File processing failed: ${job?.data?.fileName || 'unknown'}`, error);
      this.emit('jobFailed', { job: job?.data, error: error.message });
    });

    this.worker.on('progress', (job, progress) => {
      this.emit('jobProgress', { 
        jobId: job.id, 
        fileName: job.data.fileName,
        progress 
      });
    });

    this.worker.on('error', (error) => {
      logger.error('File processor worker error:', error);
      this.emit('workerError', error);
    });
  }

  private async ensureDirectories(): Promise<void> {
    try {
      await fs.mkdir(this.processingDirectory, { recursive: true });
      await fs.mkdir(this.thumbnailDirectory, { recursive: true });
    } catch (error) {
      logger.error('Failed to create directories:', error);
      throw error;
    }
  }

  public async getQueueStats(): Promise<any> {
    const waiting = await this.queue.getWaiting();
    const active = await this.queue.getActive();
    const completed = await this.queue.getCompleted();
    const failed = await this.queue.getFailed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      total: waiting.length + active.length + completed.length + failed.length
    };
  }

  public async cleanup(): Promise<void> {
    await this.worker.close();
    await this.queue.close();
    logger.info('File processor cleaned up');
  }
}
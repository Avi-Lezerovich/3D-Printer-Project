import { Server as SocketIOServer } from 'socket.io';
import { PrinterManager } from '../PrinterManager.js';
import { PrinterConnectionType, PrintJobStatus } from '../types.js';

// Example of how to integrate the 3D printer system into your application
export class PrinterSystemExample {
  private printerManager: PrinterManager;

  constructor(io: SocketIOServer) {
    // Initialize the printer manager with Socket.io server
    this.printerManager = new PrinterManager(io, {
      host: 'localhost',
      port: 6379
    });

    this.setupExamplePrinters();
    this.setupExampleJobs();
  }

  private async setupExamplePrinters(): Promise<void> {
    try {
      // Add a USB-connected printer (e.g., Ender 3)
      await this.printerManager.addPrinter({
        id: 'ender3-usb',
        name: 'Ender 3 Pro (USB)',
        type: PrinterConnectionType.USB,
        config: {
          portPath: '/dev/ttyUSB0', // On Windows: 'COM3'
          baudRate: 115200
        },
        enabled: true,
        autoConnect: true
      });

      // Add a network printer (e.g., OctoPrint instance)
      await this.printerManager.addPrinter({
        id: 'prusa-mk3s-octoprint',
        name: 'Prusa MK3S (OctoPrint)',
        type: PrinterConnectionType.NETWORK,
        config: {
          hostname: '192.168.1.100',
          port: 80,
          protocol: 'http',
          apiKey: 'your-octoprint-api-key',
          endpoints: {
            status: '/api/printer',
            command: '/api/printer/command',
            files: '/api/files/local',
            job: '/api/job'
          }
        },
        enabled: true,
        autoConnect: true
      });

      console.log('Example printers added successfully');
    } catch (error) {
      console.error('Failed to setup example printers:', error);
    }
  }

  private async setupExampleJobs(): Promise<void> {
    try {
      // Wait a bit for printers to connect
      setTimeout(async () => {
        // Add example print jobs
        const job1 = await this.printerManager.addPrintJob({
          id: 'job-1',
          printerId: 'ender3-usb',
          fileName: 'benchy.gcode',
          filePath: '/prints/benchy.gcode',
          status: PrintJobStatus.QUEUED,
          progress: 0,
          estimatedTime: 3600, // 1 hour
          remainingTime: 3600,
          priority: 5,
          settings: {
            temperature: {
              hotend: 210,
              bed: 60
            },
            speed: 100,
            quality: 'normal'
          },
          metadata: {
            layerHeight: 0.2,
            infill: 15,
            supports: false,
            estimatedFilament: 15.5
          }
        }, 5);

        const job2 = await this.printerManager.addPrintJob({
          id: 'job-2',
          printerId: 'prusa-mk3s-octoprint',
          fileName: 'miniature.gcode',
          filePath: '/prints/miniature.gcode',
          status: PrintJobStatus.QUEUED,
          progress: 0,
          estimatedTime: 7200, // 2 hours
          remainingTime: 7200,
          priority: 3,
          settings: {
            temperature: {
              hotend: 215,
              bed: 60
            },
            speed: 80,
            quality: 'high'
          },
          metadata: {
            layerHeight: 0.15,
            infill: 20,
            supports: true,
            estimatedFilament: 28.3
          }
        }, 3);

        console.log(`Added print jobs: ${job1}, ${job2}`);
      }, 5000);
    } catch (error) {
      console.error('Failed to setup example jobs:', error);
    }
  }

  // Example API methods for frontend integration
  public async handlePrinterControl(printerId: string, action: string, parameters?: any): Promise<any> {
    switch (action) {
      case 'connect':
        return await this.printerManager.connectPrinter(printerId);
      
      case 'disconnect':
        return await this.printerManager.disconnectPrinter(printerId);
      
      case 'home':
        return await this.printerManager.homeAxes(printerId, parameters?.axes);
      
      case 'setTemperature':
        return await this.printerManager.setTemperature(
          printerId, 
          parameters?.hotend, 
          parameters?.bed
        );
      
      case 'move':
        return await this.printerManager.move(
          printerId,
          parameters?.x,
          parameters?.y,
          parameters?.z,
          parameters?.speed
        );
      
      case 'pausePrint':
        return await this.printerManager.pausePrint(printerId);
      
      case 'resumePrint':
        return await this.printerManager.resumePrint(printerId);
      
      case 'cancelPrint':
        return await this.printerManager.cancelPrint(printerId);
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  public async handleQueueOperation(operation: string, parameters?: any): Promise<any> {
    switch (operation) {
      case 'addJob':
        return await this.printerManager.addPrintJob(parameters.job, parameters.priority);
      
      case 'cancelJob':
        return await this.printerManager.cancelPrintJob(parameters.jobId);
      
      case 'pauseJob':
        return await this.printerManager.pausePrintJob(parameters.jobId);
      
      case 'resumeJob':
        return await this.printerManager.resumePrintJob(parameters.jobId);
      
      case 'getQueue':
        return this.printerManager.getPrintQueue();
      
      case 'getPrinterQueue':
        return this.printerManager.getPrinterQueue(parameters.printerId);
      
      default:
        throw new Error(`Unknown queue operation: ${operation}`);
    }
  }

  public async handleFileOperation(printerId: string, operation: string, parameters?: any): Promise<any> {
    switch (operation) {
      case 'upload':
        return await this.printerManager.uploadFile(
          printerId,
          parameters.fileName,
          parameters.fileBuffer
        );
      
      case 'startPrint':
        return await this.printerManager.startPrint(printerId, parameters.fileName);
      
      default:
        throw new Error(`Unknown file operation: ${operation}`);
    }
  }

  public getSystemStatus(): any {
    return {
      ...this.printerManager.getSystemStats(),
      timestamp: new Date().toISOString()
    };
  }

  public async discoverPrinters(): Promise<any> {
    const [serialPrinters, networkPrinters] = await Promise.all([
      PrinterManager.discoverSerialPrinters(),
      this.printerManager.discoverNetworkPrinters()
    ]);

    return {
      serial: serialPrinters,
      network: networkPrinters
    };
  }
}

// Example Express.js route integration
export function createPrinterRoutes(printerSystem: PrinterSystemExample) {
  const express = require('express');
  const router = express.Router();

  // Get all printer status
  router.get('/printers', (req, res) => {
    const printers = printerSystem.printerManager.getAllPrinterStatus();
    res.json(printers);
  });

  // Control a specific printer
  router.post('/printers/:id/control', async (req, res) => {
    try {
      const { id } = req.params;
      const { action, parameters } = req.body;
      
      const result = await printerSystem.handlePrinterControl(id, action, parameters);
      res.json({ success: true, result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // Get print queue
  router.get('/queue', (req, res) => {
    const queue = printerSystem.printerManager.getPrintQueue();
    res.json(queue);
  });

  // Queue operations
  router.post('/queue/:operation', async (req, res) => {
    try {
      const { operation } = req.params;
      const result = await printerSystem.handleQueueOperation(operation, req.body);
      res.json({ success: true, result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // File operations
  router.post('/printers/:id/files/:operation', async (req, res) => {
    try {
      const { id, operation } = req.params;
      const result = await printerSystem.handleFileOperation(id, operation, req.body);
      res.json({ success: true, result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // System status
  router.get('/system/status', (req, res) => {
    const status = printerSystem.getSystemStatus();
    res.json(status);
  });

  // Discover printers
  router.get('/discover', async (req, res) => {
    try {
      const printers = await printerSystem.discoverPrinters();
      res.json(printers);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}

// Example Socket.io event handlers
export function setupSocketHandlers(io: SocketIOServer, printerSystem: PrinterSystemExample) {
  io.on('connection', (socket) => {
    console.log('Client connected to printer system');

    // Handle printer control commands
    socket.on('printerControl', async (data, callback) => {
      try {
        const result = await printerSystem.handlePrinterControl(
          data.printerId, 
          data.action, 
          data.parameters
        );
        callback({ success: true, result });
      } catch (error) {
        callback({ success: false, error: error.message });
      }
    });

    // Handle queue operations
    socket.on('queueOperation', async (data, callback) => {
      try {
        const result = await printerSystem.handleQueueOperation(
          data.operation, 
          data.parameters
        );
        callback({ success: true, result });
      } catch (error) {
        callback({ success: false, error: error.message });
      }
    });

    // Handle file uploads
    socket.on('fileUpload', async (data, callback) => {
      try {
        const result = await printerSystem.handleFileOperation(
          data.printerId,
          'upload',
          {
            fileName: data.fileName,
            fileBuffer: Buffer.from(data.fileData, 'base64')
          }
        );
        callback({ success: true, result });
      } catch (error) {
        callback({ success: false, error: error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected from printer system');
    });
  });
}
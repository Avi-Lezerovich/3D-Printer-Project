import { Server as SocketIOServer } from 'socket.io';
import PrinterConnection from './printerConnection';
import CommandQueue from './commandQueue';

interface PrinterStatus {
  temperature: {
    hotend: { current: number; target: number };
    bed: { current: number; target: number };
  };
  position: { x: number; y: number; z: number };
  fanSpeed: number;
  printerState: string; // e.g., "IDLE", "PRINTING", "PAUSED", "ERROR"
}

class StatusMonitor {
  private io: SocketIOServer;
  private printerConnection: PrinterConnection;
  private commandQueue: CommandQueue;
  private status: PrinterStatus = {
    temperature: { hotend: { current: 0, target: 0 }, bed: { current: 0, target: 0 } },
    position: { x: 0, y: 0, z: 0 },
    fanSpeed: 0,
    printerState: "DISCONNECTED",
  };
  private pollingInterval: NodeJS.Timeout | null = null;

  constructor(io: SocketIOServer, printerConnection: PrinterConnection, commandQueue: CommandQueue) {
    this.io = io;
    this.printerConnection = printerConnection;
    this.commandQueue = commandQueue;

    this.printerConnection.on('connected', () => {
      this.status.printerState = "IDLE";
      this.broadcastStatus();
      this.startPolling();
    });

    this.printerConnection.on('disconnected', () => {
      this.status.printerState = "DISCONNECTED";
      this.broadcastStatus();
      this.stopPolling();
    });

    this.printerConnection.on('data', this.handlePrinterData.bind(this));
  }

  private startPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    this.pollingInterval = setInterval(() => {
      this.requestPrinterStatus();
    }, 2000); // Poll every 2 seconds
  }

  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  private async requestPrinterStatus(): Promise<void> {
    if (!this.printerConnection.isConnected) {
      return;
    }
    // Request temperature and position from printer
    // M105: Get Extruder Temperature
    // M155 S2: Automatically send temperatures every 2 seconds
    // M114: Get Current Position
    try {
      await this.commandQueue.enqueue("M105");
      await this.commandQueue.enqueue("M114");
    } catch (error) {
      console.error("Error requesting printer status:", error);
    }
  }

  private handlePrinterData(data: string): void {
    // Parse temperature data (e.g., "T:200.00 /200.00 B:60.00 /60.00")
    const tempMatch = data.match(/T:([\d.]+) \/([\d.]+) B:([\d.]+) \/([\d.]+)/);
    if (tempMatch) {
      this.status.temperature.hotend.current = parseFloat(tempMatch[1]);
      this.status.temperature.hotend.target = parseFloat(tempMatch[2]);
      this.status.temperature.bed.current = parseFloat(tempMatch[3]);
      this.status.temperature.bed.target = parseFloat(tempMatch[4]);
      this.broadcastStatus();
    }

    // Parse position data (e.g., "X:0.00 Y:0.00 Z:0.00 E:0.00 Count X:0 Y:0 Z:0")
    const posMatch = data.match(/X:([\d.]+) Y:([\d.]+) Z:([\d.]+)/);
    if (posMatch) {
      this.status.position.x = parseFloat(posMatch[1]);
      this.status.position.y = parseFloat(posMatch[2]);
      this.status.position.z = parseFloat(posMatch[3]);
      this.broadcastStatus();
    }

    // Update printer state based on other responses or internal logic
    if (data.includes("ok")) {
      // Generic 'ok' response, can be used to confirm commands
    }

    // Example: if a print job is active, update progress
    // This would typically come from a more sophisticated G-code parser or print job manager
  }

  public getStatus(): PrinterStatus {
    return this.status;
  }

  private broadcastStatus(): void {
    this.io.emit('printer:status', this.status);
  }
}

export default StatusMonitor;

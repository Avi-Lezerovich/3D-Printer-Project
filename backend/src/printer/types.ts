export enum PrinterConnectionType {
  USB = 'usb',
  NETWORK = 'network',
  WIFI = 'wifi'
}

export enum PrinterStatus {
  IDLE = 'idle',
  PRINTING = 'printing',
  PAUSED = 'paused',
  STOPPED = 'stopped',
  HEATING = 'heating',
  COOLING = 'cooling',
  ERROR = 'error',
  OFFLINE = 'offline',
  CONNECTING = 'connecting'
}

export enum PrintJobStatus {
  QUEUED = 'queued',
  PREPARING = 'preparing',
  PRINTING = 'printing',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface PrinterInfo {
  id: string;
  name: string;
  type: string;
  connectionType: PrinterConnectionType;
  address?: string;
  port?: number;
  baudRate?: number;
  status: PrinterStatus;
  temperature: {
    hotend: number;
    bed: number;
    targetHotend: number;
    targetBed: number;
  };
  position: {
    x: number;
    y: number;
    z: number;
  };
  progress: number;
  lastUpdate: Date;
  capabilities?: {
    maxTempHotend: number;
    maxTempBed: number;
    buildVolume: {
      x: number;
      y: number;
      z: number;
    };
  };
}

export interface PrintJob {
  id: string;
  printerId: string;
  fileName: string;
  filePath: string;
  gcode?: string;
  status: PrintJobStatus;
  progress: number;
  estimatedTime: number;
  remainingTime: number;
  startTime?: Date;
  endTime?: Date;
  priority: number;
  settings: {
    temperature: {
      hotend: number;
      bed: number;
    };
    speed: number;
    quality: 'draft' | 'normal' | 'high';
  };
  metadata?: {
    layerHeight: number;
    infill: number;
    supports: boolean;
    estimatedFilament: number;
  };
}

export interface PrinterCommand {
  type: 'gcode' | 'control' | 'temperature' | 'movement';
  command: string;
  parameters?: Record<string, any>;
  priority?: number;
}

export interface PrinterError {
  code: string;
  message: string;
  severity: 'warning' | 'error' | 'critical';
  timestamp: Date;
  context?: Record<string, any>;
  recoverable: boolean;
}

export interface SerialPortInfo {
  path: string;
  manufacturer?: string;
  serialNumber?: string;
  pnpId?: string;
  locationId?: string;
  productId?: string;
  vendorId?: string;
}

export interface NetworkPrinterConfig {
  hostname: string;
  port: number;
  protocol: 'http' | 'https' | 'tcp';
  apiKey?: string;
  endpoints: {
    status: string;
    command: string;
    files: string;
    job: string;
  };
}
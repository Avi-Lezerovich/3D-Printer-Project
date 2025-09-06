import { SerialPort, ReadlineParser } from 'serialport';
import { EventEmitter } from 'events';

interface PrinterConnectionEvents {
  connected: [];
  disconnected: [];
  error: [Error];
  data: [string];
}

declare interface PrinterConnection {
  on<U extends keyof PrinterConnectionEvents>(event: U, listener: (...args: PrinterConnectionEvents[U]) => void): this;
  emit<U extends keyof PrinterConnectionEvents>(event: U, ...args: PrinterConnectionEvents[U]): boolean;
}

class PrinterConnection extends EventEmitter {
  private port: SerialPort | null = null;
  private parser: ReadlineParser | null = null;
  private path: string;
  private baudRate: number;
  private reconnectInterval: NodeJS.Timeout | null = null;

  constructor(path: string, baudRate: number) {
    super();
    this.path = path;
    this.baudRate = baudRate;
  }

  public async connect(): Promise<void> {
    if (this.port && this.port.isOpen) {
      console.log('Already connected to printer.');
      return;
    }

    console.log(`Attempting to connect to printer at ${this.path} with baud rate ${this.baudRate}...`);
    this.port = new SerialPort({ path: this.path, baudRate: this.baudRate });
    this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\n' }));

    this.port.on('open', () => {
      console.log('Printer connected.');
      this.emit('connected');
      if (this.reconnectInterval) {
        clearInterval(this.reconnectInterval);
        this.reconnectInterval = null;
      }
    });

    this.port.on('data', (data) => {
      this.emit('data', data.toString().trim());
    });

    this.port.on('close', () => {
      console.log('Printer disconnected.');
      this.emit('disconnected');
      this.startReconnect();
    });

    this.port.on('error', (err) => {
      console.error('Printer connection error:', err.message);
      this.emit('error', err);
      this.disconnect(); // Attempt to clean up before reconnecting
      this.startReconnect();
    });
  }

  public disconnect(): void {
    if (this.port && this.port.isOpen) {
      this.port.close((err) => {
        if (err) {
          console.error('Error closing port:', err.message);
        }
      });
    }
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    this.port = null;
    this.parser = null;
  }

  private startReconnect(): void {
    if (!this.reconnectInterval) {
      this.reconnectInterval = setInterval(() => {
        console.log('Attempting to reconnect...');
        this.connect();
      }, 5000); // Attempt to reconnect every 5 seconds
    }
  }

  public sendGcode(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.port || !this.port.isOpen) {
        return reject(new Error('Printer not connected.'));
      }
      this.port.write(command + '\n', (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  public get isConnected(): boolean {
    return this.port ? this.port.isOpen : false;
  }
}

export default PrinterConnection;

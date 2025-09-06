import PrinterConnection from './printerConnection';

interface Command {
  command: string;
  resolve: () => void;
  reject: (error: Error) => void;
  priority: number; // Lower number means higher priority
}

class CommandQueue {
  private printerConnection: PrinterConnection;
  private queue: Command[] = [];
  private isProcessing: boolean = false;

  constructor(printerConnection: PrinterConnection) {
    this.printerConnection = printerConnection;
    this.printerConnection.on('data', this.handlePrinterResponse.bind(this));
  }

  public enqueue(command: string, priority: number = 0): Promise<void> {
    return new Promise((resolve, reject) => {
      this.queue.push({ command, resolve, reject, priority });
      this.queue.sort((a, b) => a.priority - b.priority);
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const command = this.queue[0];

    try {
      await this.printerConnection.sendGcode(command.command);
      // For now, we assume success after sending. Realistically, we'd wait for a printer response.
      // The handlePrinterResponse method would be responsible for resolving/rejecting based on actual printer feedback.
      // For a basic implementation, we'll resolve immediately after sending.
      command.resolve();
      this.queue.shift(); // Remove the processed command
    } catch (error: any) {
      console.error('Error sending command:', error.message);
      command.reject(error);
      this.queue.shift(); // Remove the failed command
    } finally {
      this.isProcessing = false;
      this.processQueue(); // Process next command
    }
  }

  private handlePrinterResponse(data: string): void {
    // This method would be more complex in a real scenario, parsing printer responses
    // and matching them to sent commands to resolve/reject promises.
    // For now, it just logs the data.
    console.log('Printer response:', data);

    // In a more advanced implementation, if a command was waiting for a specific response,
    // this is where it would be resolved or rejected.
  }

  public clearQueue(): void {
    this.queue = [];
    this.isProcessing = false;
  }
}

export default CommandQueue;

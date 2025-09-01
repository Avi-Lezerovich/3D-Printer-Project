import type { 
  IPrinterService, 
  ServiceResult, 
  ServiceContext,
  ValidationResult 
} from '../../../shared/interfaces/service.interface.js';
import { 
  Printer, 
  CreatePrinterData, 
  UpdatePrinterData, 
  PrinterStatus,
  PrinterCommand,
  CommandResult
} from '../../../shared/types/domain.types.js';
import type { IPrinterRepository } from '../../../shared/interfaces/repository.interface.js';
import type { ILogger } from '../../../infrastructure/logging/Logger.js';
import type { IEventPublisher } from '../../../shared/interfaces/service.interface.js';

/**
 * Printer Service
 * Handles printer management, status updates, and command execution
 */
export class PrinterService implements IPrinterService {
  constructor(
    private readonly printerRepository: IPrinterRepository,
    private readonly eventPublisher: IEventPublisher,
    private readonly logger: ILogger
  ) {}

  async getById(id: string): Promise<Printer | null> {
    try {
      this.logger.debug(`Getting printer by ID: ${id}`);
      return await this.printerRepository.findById(id);
    } catch (error) {
      this.logger.error(`Failed to get printer by ID: ${id}`, error as Error);
      throw error;
    }
  }

  async getMany(filters?: any, options?: any): Promise<ServiceResult<Printer[]>> {
    try {
      const printers = await this.printerRepository.findMany(filters, options);
      return {
        success: true,
        data: printers,
        metadata: {
          timestamp: new Date()
        }
      };
    } catch (error) {
      this.logger.error('Failed to get printers', error as Error);
      return {
        success: false,
        error: {
          code: 'GET_PRINTERS_FAILED',
          message: 'Failed to retrieve printers'
        },
        metadata: {
          timestamp: new Date()
        }
      };
    }
  }

  async create(data: CreatePrinterData, context?: ServiceContext): Promise<ServiceResult<Printer>> {
    try {
      const validation = await this.validateCreate(data);
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Printer data validation failed',
            details: validation.errors
          },
          metadata: {
            timestamp: new Date()
          }
        };
      }

      // Check if printer with same serial number exists
      const existingPrinter = await this.printerRepository.findBySerialNumber(data.serialNumber);
      if (existingPrinter) {
        return {
          success: false,
          error: {
            code: 'PRINTER_EXISTS',
            message: 'Printer with this serial number already exists'
          },
          metadata: {
            timestamp: new Date()
          }
        };
      }

      const printer = await this.printerRepository.create(data);
      this.logger.info(`Printer created: ${printer.id}`, { printerId: printer.id, context });

      // Publish printer created event
      await this.eventPublisher.publish({
        id: `printer-created-${Date.now()}`,
        type: 'printer.created',
        aggregateId: printer.id,
        aggregateType: 'printer',
        data: { printer },
        metadata: {
          userId: context?.userId,
          timestamp: new Date(),
          version: 1
        }
      });

      return {
        success: true,
        data: printer,
        metadata: {
          timestamp: new Date()
        }
      };
    } catch (error) {
      this.logger.error('Failed to create printer', error as Error, { data, context });
      return {
        success: false,
        error: {
          code: 'CREATE_PRINTER_FAILED',
          message: 'Failed to create printer'
        },
        metadata: {
          timestamp: new Date()
        }
      };
    }
  }

  async update(id: string, data: UpdatePrinterData, context?: ServiceContext): Promise<ServiceResult<Printer>> {
    try {
      const validation = await this.validateUpdate(id, data);
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Update data validation failed',
            details: validation.errors
          },
          metadata: {
            timestamp: new Date()
          }
        };
      }

      const printer = await this.printerRepository.update(id, data);
      if (!printer) {
        return {
          success: false,
          error: {
            code: 'PRINTER_NOT_FOUND',
            message: 'Printer not found'
          },
          metadata: {
            timestamp: new Date()
          }
        };
      }

      this.logger.info(`Printer updated: ${id}`, { printerId: id, context });

      // Publish printer updated event
      await this.eventPublisher.publish({
        id: `printer-updated-${Date.now()}`,
        type: 'printer.updated',
        aggregateId: id,
        aggregateType: 'printer',
        data: { printer, changes: data },
        metadata: {
          userId: context?.userId,
          timestamp: new Date(),
          version: 1
        }
      });

      return {
        success: true,
        data: printer,
        metadata: {
          timestamp: new Date()
        }
      };
    } catch (error) {
      this.logger.error(`Failed to update printer: ${id}`, error as Error, { data, context });
      return {
        success: false,
        error: {
          code: 'UPDATE_PRINTER_FAILED',
          message: 'Failed to update printer'
        },
        metadata: {
          timestamp: new Date()
        }
      };
    }
  }

  async delete(id: string, context?: ServiceContext): Promise<ServiceResult<boolean>> {
    try {
      const validation = await this.validateDelete(id);
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Delete validation failed',
            details: validation.errors
          },
          metadata: {
            timestamp: new Date()
          }
        };
      }

      const success = await this.printerRepository.delete(id);
      if (!success) {
        return {
          success: false,
          error: {
            code: 'PRINTER_NOT_FOUND',
            message: 'Printer not found'
          },
          metadata: {
            timestamp: new Date()
          }
        };
      }

      this.logger.info(`Printer deleted: ${id}`, { printerId: id, context });

      // Publish printer deleted event
      await this.eventPublisher.publish({
        id: `printer-deleted-${Date.now()}`,
        type: 'printer.deleted',
        aggregateId: id,
        aggregateType: 'printer',
        data: { printerId: id },
        metadata: {
          userId: context?.userId,
          timestamp: new Date(),
          version: 1
        }
      });

      return {
        success: true,
        data: true,
        metadata: {
          timestamp: new Date()
        }
      };
    } catch (error) {
      this.logger.error(`Failed to delete printer: ${id}`, error as Error, { context });
      return {
        success: false,
        error: {
          code: 'DELETE_PRINTER_FAILED',
          message: 'Failed to delete printer'
        },
        metadata: {
          timestamp: new Date()
        }
      };
    }
  }

  async getStatus(printerId: string): Promise<ServiceResult<PrinterStatus>> {
    try {
      const printer = await this.printerRepository.findById(printerId);
      if (!printer) {
        return {
          success: false,
          error: {
            code: 'PRINTER_NOT_FOUND',
            message: 'Printer not found'
          },
          metadata: {
            timestamp: new Date()
          }
        };
      }

      return {
        success: true,
        data: printer.status,
        metadata: {
          timestamp: new Date()
        }
      };
    } catch (error) {
      this.logger.error(`Failed to get printer status: ${printerId}`, error as Error);
      return {
        success: false,
        error: {
          code: 'GET_STATUS_FAILED',
          message: 'Failed to get printer status'
        },
        metadata: {
          timestamp: new Date()
        }
      };
    }
  }

  async updateStatus(printerId: string, status: PrinterStatus, context?: ServiceContext): Promise<ServiceResult<Printer>> {
    try {
      const printer = await this.printerRepository.findById(printerId);
      if (!printer) {
        return {
          success: false,
          error: {
            code: 'PRINTER_NOT_FOUND',
            message: 'Printer not found'
          },
          metadata: {
            timestamp: new Date()
          }
        };
      }

      const previousStatus = printer.status;
      await this.printerRepository.updateStatus(printerId, status, {
        previousStatus,
        updatedBy: context?.userId,
        timestamp: new Date().toISOString()
      });

      const updatedPrinter = await this.printerRepository.findById(printerId);
      if (!updatedPrinter) {
        throw new Error('Failed to retrieve updated printer');
      }

      this.logger.info(`Printer status updated: ${printerId} from ${previousStatus} to ${status}`, {
        printerId,
        previousStatus,
        newStatus: status,
        context
      });

      // Publish status change event
      await this.eventPublisher.publish({
        id: `printer-status-changed-${Date.now()}`,
        type: 'printer.status.changed',
        aggregateId: printerId,
        aggregateType: 'printer',
        data: {
          printerId,
          previousStatus,
          newStatus: status,
          timestamp: new Date()
        },
        metadata: {
          userId: context?.userId,
          timestamp: new Date(),
          version: 1
        }
      });

      return {
        success: true,
        data: updatedPrinter,
        metadata: {
          timestamp: new Date()
        }
      };
    } catch (error) {
      this.logger.error(`Failed to update printer status: ${printerId}`, error as Error, { status, context });
      return {
        success: false,
        error: {
          code: 'UPDATE_STATUS_FAILED',
          message: 'Failed to update printer status'
        },
        metadata: {
          timestamp: new Date()
        }
      };
    }
  }

  async sendCommand(printerId: string, command: PrinterCommand, context?: ServiceContext): Promise<ServiceResult<CommandResult>> {
    try {
      const printer = await this.printerRepository.findById(printerId);
      if (!printer) {
        return {
          success: false,
          error: {
            code: 'PRINTER_NOT_FOUND',
            message: 'Printer not found'
          },
          metadata: {
            timestamp: new Date()
          }
        };
      }

      // Validate command based on current printer status
      const commandValidation = this.validateCommand(printer.status, command);
      if (!commandValidation.success) {
        return {
          success: false,
          error: {
            code: 'INVALID_COMMAND',
            message: commandValidation.message || 'Invalid command for current printer state'
          },
          metadata: {
            timestamp: new Date()
          }
        };
      }

      // TODO: Implement actual command sending to printer hardware
      // This would typically involve serial communication or network protocols
      const result: CommandResult = {
        success: true,
        message: `Command ${command.type} executed successfully`,
        data: {
          commandId: `cmd-${Date.now()}`,
          executedAt: new Date()
        }
      };

      this.logger.info(`Command sent to printer: ${printerId}`, {
        printerId,
        command: command.type,
        context
      });

      // Publish command executed event
      await this.eventPublisher.publish({
        id: `printer-command-executed-${Date.now()}`,
        type: 'printer.command.executed',
        aggregateId: printerId,
        aggregateType: 'printer',
        data: {
          printerId,
          command,
          result,
          timestamp: new Date()
        },
        metadata: {
          userId: context?.userId,
          timestamp: new Date(),
          version: 1
        }
      });

      return {
        success: true,
        data: result,
        metadata: {
          timestamp: new Date()
        }
      };
    } catch (error) {
      this.logger.error(`Failed to send command to printer: ${printerId}`, error as Error, { command, context });
      return {
        success: false,
        error: {
          code: 'COMMAND_FAILED',
          message: 'Failed to send command to printer'
        },
        metadata: {
          timestamp: new Date()
        }
      };
    }
  }

  async getAvailablePrinters(): Promise<ServiceResult<Printer[]>> {
    try {
      const availableStatuses = [PrinterStatus.IDLE, PrinterStatus.PRINTING, PrinterStatus.PAUSED];
      const printers = await this.printerRepository.findByStatus(PrinterStatus.IDLE);
      
      return {
        success: true,
        data: printers,
        metadata: {
          timestamp: new Date()
        }
      };
    } catch (error) {
      this.logger.error('Failed to get available printers', error as Error);
      return {
        success: false,
        error: {
          code: 'GET_AVAILABLE_PRINTERS_FAILED',
          message: 'Failed to get available printers'
        },
        metadata: {
          timestamp: new Date()
        }
      };
    }
  }

  async validateCreate(data: CreatePrinterData): Promise<ValidationResult> {
    const errors = [];

    if (!data.name) {
      errors.push({
        field: 'name',
        code: 'REQUIRED',
        message: 'Printer name is required'
      });
    }

    if (!data.serialNumber) {
      errors.push({
        field: 'serialNumber',
        code: 'REQUIRED',
        message: 'Serial number is required'
      });
    }

    if (!data.model) {
      errors.push({
        field: 'model',
        code: 'REQUIRED',
        message: 'Printer model is required'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async validateUpdate(id: string, data: UpdatePrinterData): Promise<ValidationResult> {
    const errors = [];

    if (!id) {
      errors.push({
        field: 'id',
        code: 'REQUIRED',
        message: 'Printer ID is required'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async validateDelete(id: string): Promise<ValidationResult> {
    const errors = [];

    if (!id) {
      errors.push({
        field: 'id',
        code: 'REQUIRED',
        message: 'Printer ID is required'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private validateCommand(currentStatus: PrinterStatus, command: PrinterCommand): { success: boolean; message?: string } {
    const { type } = command;

    switch (type) {
      case 'start':
        if (currentStatus !== PrinterStatus.IDLE && currentStatus !== PrinterStatus.PAUSED) {
          return { success: false, message: 'Can only start printing when printer is idle or paused' };
        }
        break;
      
      case 'stop':
      case 'pause':
        if (currentStatus !== PrinterStatus.PRINTING) {
          return { success: false, message: 'Can only stop/pause when printer is printing' };
        }
        break;
      
      case 'resume':
        if (currentStatus !== PrinterStatus.PAUSED) {
          return { success: false, message: 'Can only resume when printer is paused' };
        }
        break;
      
      case 'emergency_stop':
        // Emergency stop should always be allowed
        break;
      
      case 'home':
        if (currentStatus === PrinterStatus.PRINTING) {
          return { success: false, message: 'Cannot home printer while printing' };
        }
        break;
      
      default:
        return { success: false, message: 'Unknown command type' };
    }

    return { success: true };
  }
}

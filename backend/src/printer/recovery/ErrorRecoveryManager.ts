import { EventEmitter } from 'events';
import { PrinterError, PrinterInfo, PrinterStatus, PrintJob, PrintJobStatus } from '../types.js';
import { logger } from '../../utils/logger.js';

interface RecoveryStrategy {
  errorCode: string;
  maxAttempts: number;
  backoffDelay: number;
  actions: RecoveryAction[];
  condition?: (error: PrinterError, context: any) => boolean;
}

interface RecoveryAction {
  type: 'command' | 'reset' | 'pause' | 'cancel' | 'reconnect' | 'notification';
  command?: string;
  parameters?: Record<string, any>;
  delay?: number;
  critical?: boolean;
}

interface ErrorContext {
  printerId: string;
  job?: PrintJob;
  printerStatus?: PrinterInfo;
  consecutiveErrors: number;
  lastErrorTime: Date;
  recoveryAttempts: number;
}

export class ErrorRecoveryManager extends EventEmitter {
  private recoveryStrategies = new Map<string, RecoveryStrategy>();
  private errorHistory = new Map<string, PrinterError[]>(); // printerId -> errors
  private recoveryAttempts = new Map<string, number>(); // printerId -> attempts
  private blacklistedPrinters = new Set<string>();
  private errorThresholds = {
    maxConsecutiveErrors: 5,
    blacklistThreshold: 10,
    cooldownPeriod: 300000 // 5 minutes
  };

  constructor() {
    super();
    this.initializeDefaultStrategies();
  }

  public async handleError(printerId: string, error: PrinterError, context?: any): Promise<boolean> {
    try {
      logger.warn(`Handling error for printer ${printerId}: ${error.message}`);

      // Update error history
      this.updateErrorHistory(printerId, error);

      // Check if printer should be blacklisted
      if (this.shouldBlacklistPrinter(printerId)) {
        this.blacklistPrinter(printerId);
        return false;
      }

      // Find appropriate recovery strategy
      const strategy = this.findRecoveryStrategy(error, context);
      if (!strategy) {
        logger.warn(`No recovery strategy found for error ${error.code}`);
        return false;
      }

      // Check if we've exceeded max attempts for this strategy
      const attempts = this.recoveryAttempts.get(`${printerId}-${error.code}`) || 0;
      if (attempts >= strategy.maxAttempts) {
        logger.error(`Max recovery attempts exceeded for printer ${printerId}, error ${error.code}`);
        this.emit('recoveryFailed', { printerId, error, strategy });
        return false;
      }

      // Execute recovery strategy
      const success = await this.executeRecoveryStrategy(printerId, strategy, error, context);
      
      if (success) {
        this.resetRecoveryAttempts(printerId, error.code);
        this.emit('recoverySuccess', { printerId, error, strategy });
      } else {
        this.incrementRecoveryAttempts(printerId, error.code);
        this.emit('recoveryFailed', { printerId, error, strategy });
      }

      return success;
    } catch (recoveryError) {
      logger.error(`Recovery process failed for printer ${printerId}:`, recoveryError);
      this.emit('recoveryError', { printerId, originalError: error, recoveryError });
      return false;
    }
  }

  public addRecoveryStrategy(strategy: RecoveryStrategy): void {
    this.recoveryStrategies.set(strategy.errorCode, strategy);
    logger.debug(`Added recovery strategy for error code: ${strategy.errorCode}`);
  }

  public removeRecoveryStrategy(errorCode: string): void {
    this.recoveryStrategies.delete(errorCode);
    logger.debug(`Removed recovery strategy for error code: ${errorCode}`);
  }

  public isBlacklisted(printerId: string): boolean {
    return this.blacklistedPrinters.has(printerId);
  }

  public blacklistPrinter(printerId: string): void {
    this.blacklistedPrinters.add(printerId);
    logger.warn(`Printer ${printerId} has been blacklisted due to excessive errors`);
    this.emit('printerBlacklisted', { printerId });

    // Schedule removal from blacklist
    setTimeout(() => {
      this.removeFromBlacklist(printerId);
    }, this.errorThresholds.cooldownPeriod);
  }

  public removeFromBlacklist(printerId: string): void {
    if (this.blacklistedPrinters.has(printerId)) {
      this.blacklistedPrinters.delete(printerId);
      this.clearErrorHistory(printerId);
      logger.info(`Printer ${printerId} removed from blacklist`);
      this.emit('printerWhitelisted', { printerId });
    }
  }

  public getErrorHistory(printerId: string): PrinterError[] {
    return this.errorHistory.get(printerId) || [];
  }

  public getRecoveryStats(printerId: string): any {
    const errors = this.errorHistory.get(printerId) || [];
    const stats = {
      totalErrors: errors.length,
      errorTypes: {} as Record<string, number>,
      recentErrors: errors.filter(e => 
        Date.now() - e.timestamp.getTime() < 3600000 // Last hour
      ).length,
      isBlacklisted: this.isBlacklisted(printerId),
      lastError: errors[errors.length - 1]?.timestamp
    };

    errors.forEach(error => {
      stats.errorTypes[error.code] = (stats.errorTypes[error.code] || 0) + 1;
    });

    return stats;
  }

  public clearErrorHistory(printerId: string): void {
    this.errorHistory.delete(printerId);
    this.recoveryAttempts.forEach((_, key) => {
      if (key.startsWith(`${printerId}-`)) {
        this.recoveryAttempts.delete(key);
      }
    });
    logger.debug(`Cleared error history for printer ${printerId}`);
  }

  private initializeDefaultStrategies(): void {
    // Temperature errors
    this.addRecoveryStrategy({
      errorCode: 'MINTEMP_ERROR',
      maxAttempts: 3,
      backoffDelay: 30000,
      actions: [
        { type: 'command', command: 'M104 S0', delay: 1000 }, // Turn off hotend
        { type: 'command', command: 'M140 S0', delay: 1000 }, // Turn off bed
        { type: 'pause', delay: 5000 },
        { type: 'notification', parameters: { message: 'Temperature sensor error detected' } }
      ]
    });

    this.addRecoveryStrategy({
      errorCode: 'MAXTEMP_ERROR',
      maxAttempts: 2,
      backoffDelay: 60000,
      actions: [
        { type: 'command', command: 'M104 S0', critical: true }, // Emergency stop heating
        { type: 'command', command: 'M140 S0', critical: true },
        { type: 'command', command: 'M112', critical: true }, // Emergency stop
        { type: 'cancel', critical: true },
        { type: 'notification', parameters: { message: 'Critical temperature error - print cancelled' } }
      ]
    });

    // Communication errors
    this.addRecoveryStrategy({
      errorCode: 'COMMUNICATION_ERROR',
      maxAttempts: 5,
      backoffDelay: 10000,
      actions: [
        { type: 'reconnect', delay: 5000 },
        { type: 'command', command: 'M115', delay: 2000 }, // Get firmware info
        { type: 'notification', parameters: { message: 'Attempting to restore communication' } }
      ]
    });

    // Bed leveling errors
    this.addRecoveryStrategy({
      errorCode: 'BED_LEVELING_FAILED',
      maxAttempts: 3,
      backoffDelay: 15000,
      actions: [
        { type: 'command', command: 'G28', delay: 3000 }, // Home all axes
        { type: 'command', command: 'G29', delay: 10000 }, // Auto bed leveling
        { type: 'notification', parameters: { message: 'Retrying bed leveling' } }
      ]
    });

    // Filament errors
    this.addRecoveryStrategy({
      errorCode: 'FILAMENT_RUNOUT',
      maxAttempts: 1,
      backoffDelay: 0,
      actions: [
        { type: 'pause', critical: true },
        { type: 'notification', parameters: { message: 'Filament runout detected - print paused' } }
      ]
    });

    // Power loss recovery
    this.addRecoveryStrategy({
      errorCode: 'POWER_LOSS',
      maxAttempts: 1,
      backoffDelay: 30000,
      actions: [
        { type: 'reconnect', delay: 10000 },
        { type: 'command', command: 'M1000', delay: 5000 }, // Resume from power loss (if supported)
        { type: 'notification', parameters: { message: 'Attempting power loss recovery' } }
      ]
    });

    // Generic printer error
    this.addRecoveryStrategy({
      errorCode: 'PRINTER_ERROR',
      maxAttempts: 2,
      backoffDelay: 20000,
      actions: [
        { type: 'reset', delay: 5000 },
        { type: 'command', command: 'M999', delay: 3000 }, // Reset after emergency stop
        { type: 'notification', parameters: { message: 'Attempting printer reset' } }
      ]
    });
  }

  private updateErrorHistory(printerId: string, error: PrinterError): void {
    if (!this.errorHistory.has(printerId)) {
      this.errorHistory.set(printerId, []);
    }

    const history = this.errorHistory.get(printerId)!;
    history.push(error);

    // Keep only last 50 errors
    if (history.length > 50) {
      history.shift();
    }
  }

  private shouldBlacklistPrinter(printerId: string): boolean {
    const history = this.errorHistory.get(printerId) || [];
    
    // Check total error count
    if (history.length >= this.errorThresholds.blacklistThreshold) {
      return true;
    }

    // Check consecutive errors in short time period
    const recentErrors = history.filter(error => 
      Date.now() - error.timestamp.getTime() < 300000 // Last 5 minutes
    );

    return recentErrors.length >= this.errorThresholds.maxConsecutiveErrors;
  }

  private findRecoveryStrategy(error: PrinterError, context?: any): RecoveryStrategy | null {
    // Try exact match first
    let strategy = this.recoveryStrategies.get(error.code);
    
    if (strategy && strategy.condition && !strategy.condition(error, context)) {
      strategy = null;
    }

    // Try pattern matching for generic strategies
    if (!strategy) {
      for (const [code, s] of this.recoveryStrategies) {
        if (code.includes('*') || error.code.includes(code) || error.message.toLowerCase().includes(code.toLowerCase())) {
          if (!s.condition || s.condition(error, context)) {
            strategy = s;
            break;
          }
        }
      }
    }

    return strategy;
  }

  private async executeRecoveryStrategy(
    printerId: string,
    strategy: RecoveryStrategy,
    error: PrinterError,
    context?: any
  ): Promise<boolean> {
    try {
      logger.info(`Executing recovery strategy for printer ${printerId}, error ${error.code}`);

      // Apply backoff delay
      if (strategy.backoffDelay > 0) {
        const attempts = this.recoveryAttempts.get(`${printerId}-${error.code}`) || 0;
        const delay = strategy.backoffDelay * Math.pow(1.5, attempts);
        await this.sleep(delay);
      }

      // Execute recovery actions
      for (const action of strategy.actions) {
        try {
          await this.executeRecoveryAction(printerId, action, context);
          
          // Add delay between actions if specified
          if (action.delay) {
            await this.sleep(action.delay);
          }
        } catch (actionError) {
          logger.error(`Recovery action failed:`, actionError);
          
          // If this is a critical action, fail the entire recovery
          if (action.critical) {
            throw actionError;
          }
        }
      }

      logger.info(`Recovery strategy executed successfully for printer ${printerId}`);
      return true;
    } catch (strategyError) {
      logger.error(`Recovery strategy failed for printer ${printerId}:`, strategyError);
      return false;
    }
  }

  private async executeRecoveryAction(printerId: string, action: RecoveryAction, context?: any): Promise<void> {
    switch (action.type) {
      case 'command':
        if (action.command) {
          this.emit('executeCommand', {
            printerId,
            command: action.command,
            parameters: action.parameters
          });
        }
        break;

      case 'reset':
        this.emit('resetPrinter', { printerId });
        break;

      case 'pause':
        this.emit('pausePrint', { printerId });
        break;

      case 'cancel':
        this.emit('cancelPrint', { printerId });
        break;

      case 'reconnect':
        this.emit('reconnectPrinter', { printerId });
        break;

      case 'notification':
        this.emit('sendNotification', {
          printerId,
          message: action.parameters?.message || 'Recovery action executed',
          level: action.parameters?.level || 'warning'
        });
        break;

      default:
        logger.warn(`Unknown recovery action type: ${action.type}`);
    }
  }

  private incrementRecoveryAttempts(printerId: string, errorCode: string): void {
    const key = `${printerId}-${errorCode}`;
    const current = this.recoveryAttempts.get(key) || 0;
    this.recoveryAttempts.set(key, current + 1);
  }

  private resetRecoveryAttempts(printerId: string, errorCode: string): void {
    const key = `${printerId}-${errorCode}`;
    this.recoveryAttempts.delete(key);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
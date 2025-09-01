import type {
  IServiceFactory,
  IUserService,
  IPrinterService,
  IProjectService,
  ICacheService,
  IAuditService,
  INotificationService,
  IFileStorageService,
  IJobService,
  IEventPublisher
} from '../shared/interfaces/service.interface.js';
import type { IRepositoryFactory } from '../shared/interfaces/repository.interface.js';
import type { ILogger } from '../infrastructure/logging/Logger.js';

import { AuthService } from '../domains/auth/services/auth.service.js';
import { PrinterService } from '../domains/printer/services/printer.service.js';

/**
 * Service Factory Implementation
 * Creates and manages service instances with dependency injection
 */
export class ServiceFactory implements IServiceFactory {
  private userService?: IUserService;
  private printerService?: IPrinterService;
  private projectService?: IProjectService;
  private cacheService?: ICacheService;
  private auditService?: IAuditService;
  private notificationService?: INotificationService;
  private fileStorageService?: IFileStorageService;
  private jobService?: IJobService;

  constructor(
    private readonly repositoryFactory: IRepositoryFactory,
    private readonly eventPublisher: IEventPublisher,
    private readonly logger: ILogger
  ) {}

  // Domain Services
  getUserService(): IUserService {
    if (!this.userService) {
      this.userService = new AuthService(
        this.repositoryFactory.getUserRepository(),
        this.logger
      );
    }
    return this.userService;
  }

  getPrinterService(): IPrinterService {
    if (!this.printerService) {
      this.printerService = new PrinterService(
        this.repositoryFactory.getPrinterRepository(),
        this.eventPublisher,
        this.logger
      );
    }
    return this.printerService;
  }

  getProjectService(): IProjectService {
    if (!this.projectService) {
      // TODO: Implement ProjectService
      throw new Error('ProjectService not implemented yet');
    }
    return this.projectService;
  }

  // Infrastructure Services
  getCacheService(): ICacheService {
    if (!this.cacheService) {
      // TODO: Implement Redis-based CacheService
      throw new Error('CacheService not implemented yet');
    }
    return this.cacheService;
  }

  getAuditService(): IAuditService {
    if (!this.auditService) {
      // TODO: Implement AuditService
      throw new Error('AuditService not implemented yet');
    }
    return this.auditService;
  }

  getNotificationService(): INotificationService {
    if (!this.notificationService) {
      // TODO: Implement NotificationService
      throw new Error('NotificationService not implemented yet');
    }
    return this.notificationService;
  }

  getFileStorageService(): IFileStorageService {
    if (!this.fileStorageService) {
      // TODO: Implement FileStorageService
      throw new Error('FileStorageService not implemented yet');
    }
    return this.fileStorageService;
  }

  getJobService(): IJobService {
    if (!this.jobService) {
      // TODO: Implement JobService with Bull Queue or similar
      throw new Error('JobService not implemented yet');
    }
    return this.jobService;
  }

  getEventPublisher(): IEventPublisher {
    return this.eventPublisher;
  }

  /**
   * Health check for all services
   */
  async healthCheck(): Promise<{ [key: string]: boolean }> {
    const health = {
      userService: false,
      printerService: false,
      projectService: false,
      cacheService: false,
      auditService: false,
      notificationService: false,
      fileStorageService: false,
      jobService: false,
      eventPublisher: true // Always available
    };

    try {
      // Test user service
      try {
        await this.getUserService().getMany();
        health.userService = true;
      } catch (error) {
        this.logger.warn('UserService health check failed', { error });
      }

      // Test printer service - only if repository is implemented
      try {
        // await this.getPrinterService().getMany();
        // health.printerService = true;
      } catch (error) {
        this.logger.warn('PrinterService health check failed', { error });
      }

      // TODO: Add health checks for other services when implemented

    } catch (error) {
      this.logger.error('Service factory health check failed', error as Error);
    }

    return health;
  }

  /**
   * Initialize all services
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing service factory...');

      // Pre-load critical services
      this.getUserService();
      // this.getPrinterService(); // Enable when repository is implemented

      this.logger.info('Service factory initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize service factory', error as Error);
      throw error;
    }
  }

  /**
   * Cleanup all services
   */
  async cleanup(): Promise<void> {
    try {
      this.logger.info('Cleaning up service factory...');

      // Clear event publisher
      this.eventPublisher.clear();

      // Reset service instances
      this.userService = undefined;
      this.printerService = undefined;
      this.projectService = undefined;
      this.cacheService = undefined;
      this.auditService = undefined;
      this.notificationService = undefined;
      this.fileStorageService = undefined;
      this.jobService = undefined;

      this.logger.info('Service factory cleanup completed');
    } catch (error) {
      this.logger.error('Error during service factory cleanup', error as Error);
      throw error;
    }
  }
}

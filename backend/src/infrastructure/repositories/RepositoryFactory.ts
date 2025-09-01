import type { 
  IRepositoryFactory,
  IUserRepository,
  IPrinterRepository,
  IProjectRepository,
  IAuditLogRepository
} from '../../shared/interfaces/repository.interface.js';
import { PrismaUserRepository } from './PrismaUserRepository.js';
// import { PrismaPrinterRepository } from './PrismaPrinterRepository.js';
// import { PrismaProjectRepository } from './PrismaProjectRepository.js';
// import { PrismaAuditLogRepository } from './PrismaAuditLogRepository.js';
import type { ILogger } from '../logging/Logger.js';

/**
 * Repository Factory Implementation
 * Creates and manages repository instances with dependency injection
 */
export class RepositoryFactory implements IRepositoryFactory {
  private userRepository?: IUserRepository;
  private printerRepository?: IPrinterRepository;
  private projectRepository?: IProjectRepository;
  private auditLogRepository?: IAuditLogRepository;

  constructor(
    private readonly prisma: any, // PrismaClient type would be imported in real implementation
    private readonly logger: ILogger
  ) {}

  getUserRepository(): IUserRepository {
    if (!this.userRepository) {
      this.userRepository = new PrismaUserRepository(this.prisma, this.logger);
    }
    return this.userRepository;
  }

  getPrinterRepository(): IPrinterRepository {
    if (!this.printerRepository) {
      // TODO: Implement PrismaPrinterRepository
      throw new Error('PrinterRepository not implemented yet');
    }
    return this.printerRepository;
  }

  getProjectRepository(): IProjectRepository {
    if (!this.projectRepository) {
      // TODO: Implement PrismaProjectRepository  
      throw new Error('ProjectRepository not implemented yet');
    }
    return this.projectRepository;
  }

  getAuditLogRepository(): IAuditLogRepository {
    if (!this.auditLogRepository) {
      // TODO: Implement PrismaAuditLogRepository
      throw new Error('AuditLogRepository not implemented yet');
    }
    return this.auditLogRepository;
  }

  /**
   * Close all repository connections and cleanup resources
   */
  async close(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      this.logger.info('Repository factory closed and Prisma disconnected');
    } catch (error) {
      this.logger.error('Error closing repository factory', error as Error);
      throw error;
    }
  }

  /**
   * Health check for all repositories
   */
  async healthCheck(): Promise<{ [key: string]: boolean }> {
    const health = {
      database: false,
      userRepository: false,
      printerRepository: false,
      projectRepository: false,
      auditLogRepository: false
    };

    try {
      // Test database connection
      await this.prisma.$queryRaw`SELECT 1`;
      health.database = true;

      // Test user repository
      try {
        await this.getUserRepository().count();
        health.userRepository = true;
      } catch (error) {
        this.logger.warn('UserRepository health check failed', { error });
      }

      // TODO: Add health checks for other repositories when implemented
      
    } catch (error) {
      this.logger.error('Database health check failed', error as Error);
    }

    return health;
  }
}

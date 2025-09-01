import type { Express } from 'express';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import { AppConfig } from '../infrastructure/config/AppConfig.js';
import { LoggerFactory, type ILogger } from '../infrastructure/logging/Logger.js';
import { RepositoryFactory } from '../infrastructure/repositories/RepositoryFactory.js';
import { ServiceFactory } from './ServiceFactory.js';
import { EventPublisher } from '../infrastructure/events/EventPublisher.js';

/**
 * Application Bootstrap
 * Sets up Express server with all middleware, routes, and dependencies
 */
export class Application {
  private app: Express;
  private logger: ILogger;
  private config: AppConfig;
  private repositoryFactory?: RepositoryFactory;
  private serviceFactory?: ServiceFactory;
  private eventPublisher?: EventPublisher;

  constructor() {
    this.config = AppConfig.getInstance();
    this.logger = LoggerFactory.createFromEnv('Application');
    this.app = express();
    
    this.setupMiddleware();
  }

  /**
   * Initialize the application with all dependencies
   */
  public async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing application...');

      // Initialize infrastructure
      await this.initializeInfrastructure();

      // Setup routes
      this.setupRoutes();

      // Setup error handling
      this.setupErrorHandling();

      this.logger.info('Application initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize application', error as Error);
      throw error;
    }
  }

  /**
   * Start the HTTP server
   */
  public async start(): Promise<void> {
    try {
      const server = this.app.listen(this.config.port, () => {
        this.logger.info(`Server started on port ${this.config.port}`, {
          env: this.config.env,
          port: this.config.port
        });
      });

      // Graceful shutdown handling
      this.setupGracefulShutdown(server);

      return new Promise((resolve) => {
        server.on('listening', resolve);
      });
    } catch (error) {
      this.logger.error('Failed to start server', error as Error);
      throw error;
    }
  }

  /**
   * Get the Express app instance
   */
  public getApp(): Express {
    return this.app;
  }

  /**
   * Health check endpoint
   */
  public async getHealth(): Promise<{
    status: 'healthy' | 'unhealthy';
    timestamp: Date;
    uptime: number;
    version: string;
    environment: string;
    dependencies: Record<string, boolean>;
  }> {
    const startTime = Date.now();
    let dependencyHealth: Record<string, boolean> = {};

    try {
      // Check repository health
      if (this.repositoryFactory) {
        dependencyHealth = await this.repositoryFactory.healthCheck();
      }

      const responseTime = Date.now() - startTime;
      const allHealthy = Object.values(dependencyHealth).every(healthy => healthy);

      return {
        status: allHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: this.config.env,
        dependencies: dependencyHealth
      };
    } catch (error) {
      this.logger.error('Health check failed', error as Error);
      return {
        status: 'unhealthy',
        timestamp: new Date(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: this.config.env,
        dependencies: dependencyHealth
      };
    }
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: this.config.isDevelopment() ? false : undefined
    }));

    // CORS
    this.app.use(cors({
      origin: this.config.cors.origins,
      credentials: this.config.cors.credentials,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
    }));

    // Compression
    this.app.use(compression());

    // Rate limiting
    const limiter = rateLimit({
      windowMs: this.config.rateLimit.windowMs,
      max: this.config.rateLimit.maxRequests,
      message: {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests, please try again later'
        }
      },
      standardHeaders: true,
      legacyHeaders: false
    });
    this.app.use('/api', limiter);

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request ID middleware
    this.app.use((req, res, next) => {
      req.id = Math.random().toString(36).substring(2, 15);
      res.setHeader('X-Request-ID', req.id);
      next();
    });

    // Logging middleware
    this.app.use((req, res, next) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        this.logger.info(`${req.method} ${req.url}`, {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration,
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          requestId: req.id
        });
      });
      
      next();
    });
  }

  /**
   * Initialize infrastructure components
   */
  private async initializeInfrastructure(): Promise<void> {
    try {
      // TODO: Initialize Prisma client
      const prisma = {}; // Placeholder for PrismaClient

      // Initialize event publisher
      this.eventPublisher = new EventPublisher();

      // Initialize repository factory
      this.repositoryFactory = new RepositoryFactory(
        prisma,
        LoggerFactory.createFromEnv('RepositoryFactory')
      );

      // Initialize service factory
      this.serviceFactory = new ServiceFactory(
        this.repositoryFactory,
        this.eventPublisher,
        LoggerFactory.createFromEnv('ServiceFactory')
      );

      this.logger.info('Infrastructure initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize infrastructure', error as Error);
      throw error;
    }
  }

  /**
   * Setup application routes
   */
  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', async (req, res) => {
      try {
        const health = await this.getHealth();
        res.status(health.status === 'healthy' ? 200 : 503).json(health);
      } catch (error) {
        res.status(500).json({
          status: 'unhealthy',
          error: 'Health check failed'
        });
      }
    });

    // API routes
    this.app.use('/api/v1', (req, res) => {
      res.json({ message: 'API v1 - Routes will be implemented in next phase' });
    });

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        name: '3D Printer Control API',
        version: process.env.npm_package_version || '1.0.0',
        environment: this.config.env,
        timestamp: new Date().toISOString()
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Route ${req.method} ${req.originalUrl} not found`
        }
      });
    });
  }

  /**
   * Setup error handling middleware
   */
  private setupErrorHandling(): void {
    // Error handler middleware
    this.app.use((error: any, req: any, res: any, next: any) => {
      this.logger.error('Unhandled error', error, {
        method: req.method,
        url: req.url,
        requestId: req.id,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });

      // Don't expose internal errors in production
      const isDevelopment = this.config.isDevelopment();
      
      res.status(error.status || 500).json({
        success: false,
        error: {
          code: error.code || 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Internal server error',
          ...(isDevelopment && { stack: error.stack })
        },
        requestId: req.id
      });
    });
  }

  /**
   * Setup graceful shutdown handling
   */
  private setupGracefulShutdown(server: any): void {
    const shutdown = async (signal: string) => {
      this.logger.info(`Received ${signal}, starting graceful shutdown`);

      // Stop accepting new connections
      server.close(async () => {
        this.logger.info('HTTP server closed');

        try {
          // Close database connections
          if (this.repositoryFactory) {
            await this.repositoryFactory.close();
          }

          // Clear event publisher
          if (this.eventPublisher) {
            this.eventPublisher.clear();
          }

          this.logger.info('Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          this.logger.error('Error during shutdown', error as Error);
          process.exit(1);
        }
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        this.logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    // Handle different termination signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGUSR2', () => shutdown('SIGUSR2')); // nodemon

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.logger.error('Uncaught exception', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      this.logger.error('Unhandled promise rejection', reason as Error, { promise });
      process.exit(1);
    });
  }
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      id?: string;
      user?: {
        id: string;
        role: string;
        email: string;
      };
    }
  }
}

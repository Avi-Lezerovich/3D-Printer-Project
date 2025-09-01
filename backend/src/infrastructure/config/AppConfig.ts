import type {
  DatabaseConfig,
  CacheConfig,
  AuthConfig,
  FileStorageConfig
} from '../../shared/types/domain.types.js';

/**
 * Application Configuration
 * Centralized configuration management with environment variables
 */
export class AppConfig {
  private static instance: AppConfig;
  
  public readonly env: string;
  public readonly port: number;
  public readonly database: DatabaseConfig;
  public readonly cache: CacheConfig;
  public readonly auth: AuthConfig;
  public readonly fileStorage: FileStorageConfig;
  public readonly cors: {
    origins: string[];
    credentials: boolean;
  };
  public readonly rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  public readonly logging: {
    level: string;
    format: 'console' | 'structured';
  };

  private constructor() {
    // Environment
    this.env = process.env.NODE_ENV || 'development';
    this.port = parseInt(process.env.PORT || '3000', 10);

    // Database Configuration
    this.database = {
      url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/printer_db',
      maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10', 10),
      connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '60000', 10),
      queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000', 10)
    };

    // Cache Configuration (Redis)
    this.cache = {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      ttl: parseInt(process.env.CACHE_TTL || '3600', 10), // 1 hour
      maxMemory: process.env.REDIS_MAX_MEMORY || '128mb',
      keyPrefix: process.env.CACHE_KEY_PREFIX || 'printer_app:'
    };

    // Authentication Configuration
    this.auth = {
      jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
      jwtExpiration: process.env.JWT_EXPIRATION || '1h',
      refreshTokenExpiration: process.env.REFRESH_TOKEN_EXPIRATION || '7d',
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10)
    };

    // File Storage Configuration
    this.fileStorage = {
      type: (process.env.FILE_STORAGE_TYPE as 'local' | 's3' | 'gcs') || 'local',
      path: process.env.FILE_STORAGE_PATH || './uploads',
      bucket: process.env.FILE_STORAGE_BUCKET,
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
      allowedMimeTypes: (process.env.ALLOWED_MIME_TYPES || 'application/octet-stream,model/stl,text/plain')
        .split(',')
        .map(type => type.trim())
    };

    // CORS Configuration
    this.cors = {
      origins: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173')
        .split(',')
        .map(origin => origin.trim()),
      credentials: process.env.CORS_CREDENTIALS === 'true'
    };

    // Rate Limiting Configuration
    this.rateLimit = {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
    };

    // Logging Configuration
    this.logging = {
      level: process.env.LOG_LEVEL || (this.env === 'production' ? 'info' : 'debug'),
      format: (process.env.LOG_FORMAT as 'console' | 'structured') || 
               (this.env === 'production' ? 'structured' : 'console')
    };

    this.validate();
  }

  /**
   * Get singleton instance of AppConfig
   */
  public static getInstance(): AppConfig {
    if (!AppConfig.instance) {
      AppConfig.instance = new AppConfig();
    }
    return AppConfig.instance;
  }

  /**
   * Validate configuration values
   */
  private validate(): void {
    const errors: string[] = [];

    // Validate required environment variables
    if (!this.database.url) {
      errors.push('DATABASE_URL is required');
    }

    if (this.env === 'production') {
      if (this.auth.jwtSecret === 'your-super-secret-jwt-key-change-in-production') {
        errors.push('JWT_SECRET must be changed in production');
      }

      if (this.auth.jwtSecret.length < 32) {
        errors.push('JWT_SECRET should be at least 32 characters long');
      }
    }

    if (this.port < 1 || this.port > 65535) {
      errors.push('PORT must be between 1 and 65535');
    }

    if (this.database.maxConnections < 1) {
      errors.push('DB_MAX_CONNECTIONS must be at least 1');
    }

    if (this.fileStorage.maxFileSize < 1) {
      errors.push('MAX_FILE_SIZE must be at least 1 byte');
    }

    if (errors.length > 0) {
      throw new Error(`Configuration validation failed:\\n${errors.join('\\n')}`);
    }
  }

  /**
   * Check if running in development mode
   */
  public isDevelopment(): boolean {
    return this.env === 'development';
  }

  /**
   * Check if running in production mode
   */
  public isProduction(): boolean {
    return this.env === 'production';
  }

  /**
   * Check if running in test mode
   */
  public isTest(): boolean {
    return this.env === 'test';
  }

  /**
   * Get configuration as JSON object (for debugging)
   */
  public toJSON(): Record<string, unknown> {
    return {
      env: this.env,
      port: this.port,
      database: {
        ...this.database,
        url: this.database.url.replace(/:[^:@]*@/, ':****@') // Hide password
      },
      cache: {
        ...this.cache,
        url: this.cache.url.replace(/:[^:@]*@/, ':****@') // Hide password if any
      },
      auth: {
        ...this.auth,
        jwtSecret: '****' // Hide secret
      },
      fileStorage: this.fileStorage,
      cors: this.cors,
      rateLimit: this.rateLimit,
      logging: this.logging
    };
  }

  /**
   * Get database connection string for Prisma
   */
  public getDatabaseUrl(): string {
    return this.database.url;
  }

  /**
   * Get Redis connection string
   */
  public getCacheUrl(): string {
    return this.cache.url;
  }

  /**
   * Check if a file type is allowed
   */
  public isAllowedFileType(mimeType: string): boolean {
    return this.fileStorage.allowedMimeTypes.includes(mimeType);
  }

  /**
   * Check if file size is within limits
   */
  public isAllowedFileSize(size: number): boolean {
    return size <= this.fileStorage.maxFileSize;
  }

  /**
   * Check if origin is allowed for CORS
   */
  public isAllowedOrigin(origin: string): boolean {
    return this.cors.origins.includes(origin) || this.cors.origins.includes('*');
  }
}

// Export singleton instance
export const config = AppConfig.getInstance();

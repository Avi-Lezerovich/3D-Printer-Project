# Backend Development Guide

This guide provides comprehensive information for developing and maintaining the backend API of the 3D Printer Project.

## 🎯 Backend Overview

The backend is a modern Node.js API server built with:

- **Node.js 18+**: Latest LTS version with ES modules
- **Express 5**: Modern Express framework
- **TypeScript**: Type-safe development
- **Zod**: Runtime schema validation
- **JWT**: JSON Web Token authentication
- **Socket.IO**: Real-time communication
- **Pino**: Structured logging
- **Redis**: Caching and session storage
- **PostgreSQL**: Primary database (via Prisma)
- **Vitest**: Testing framework

## 📁 Project Structure

```
backend/src/
├── routes/              # API route handlers
│   ├── auth.ts         # Authentication endpoints
│   ├── projects.ts     # Project management endpoints
│   ├── project-management.ts # Task management endpoints
│   └── index.ts        # Route aggregation
├── middleware/          # Express middleware
│   ├── auth.ts         # JWT authentication middleware
│   ├── validate.ts     # Input validation middleware
│   ├── rateLimit.ts    # Rate limiting middleware
│   ├── error.ts        # Error handling middleware
│   └── cors.ts         # CORS configuration
├── services/            # Business logic layer
│   ├── authService.ts  # Authentication business logic
│   ├── taskService.ts  # Task management business logic
│   ├── projectService.ts # Project management business logic
│   └── emailService.ts # Email notification service
├── repositories/        # Data access layer
│   ├── userRepository.ts
│   ├── taskRepository.ts
│   ├── projectRepository.ts
│   └── base/           # Base repository patterns
├── utils/               # Utility functions
│   ├── logger.ts       # Logging configuration
│   ├── validation.ts   # Validation helpers
│   ├── encryption.ts   # Encryption utilities
│   └── constants.ts    # Application constants
├── config/              # Configuration management
│   ├── database.ts     # Database configuration
│   ├── redis.ts        # Redis configuration
│   ├── jwt.ts          # JWT configuration
│   └── index.ts        # Centralized config
├── types/               # TypeScript type definitions
│   ├── auth.ts         # Authentication types
│   ├── api.ts          # API request/response types
│   ├── database.ts     # Database model types
│   └── global.ts       # Global type definitions
├── schemas/             # Zod validation schemas
│   ├── authSchemas.ts  # Authentication validation
│   ├── taskSchemas.ts  # Task validation
│   └── projectSchemas.ts # Project validation
├── __tests__/           # Test files
│   ├── auth.test.ts
│   ├── projects.test.ts
│   └── integration/    # Integration tests
├── openapi.ts           # OpenAPI specification
└── index.ts             # Application entry point
```

## 🔧 Core Architecture

### Layered Architecture Pattern

The backend follows a clean layered architecture:

```typescript
// Request Flow:
// Router → Middleware → Controller → Service → Repository → Database

// Example: Task Creation Flow
Route Handler (Controller) → TaskService → TaskRepository → Database
```

### Dependency Injection Pattern

```typescript
// src/services/taskService.ts
import { TaskRepository } from '../repositories/taskRepository';
import { UserRepository } from '../repositories/userRepository';
import { NotificationService } from './notificationService';

export class TaskService {
  constructor(
    private taskRepository: TaskRepository,
    private userRepository: UserRepository,
    private notificationService: NotificationService
  ) {}

  async createTask(data: CreateTaskData, userId: string): Promise<Task> {
    // Validate user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('USER_NOT_FOUND', 'User not found', 404);
    }

    // Create task
    const task = await this.taskRepository.create({
      ...data,
      ownerId: userId,
      status: 'todo',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Send notification (async, non-blocking)
    this.notificationService.sendTaskCreated(task, user).catch(
      (error) => logger.warn('Failed to send task notification:', error)
    );

    return task;
  }
}
```

### Repository Pattern

```typescript
// src/repositories/base/baseRepository.ts
export abstract class BaseRepository<T, CreateData, UpdateData> {
  constructor(protected db: DatabaseClient) {}

  abstract tableName: string;

  async findById(id: string): Promise<T | null> {
    const result = await this.db.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async create(data: CreateData): Promise<T> {
    const fields = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

    const result = await this.db.query(
      `INSERT INTO ${this.tableName} (${fields}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    return result.rows[0];
  }

  async update(id: string, data: UpdateData): Promise<T | null> {
    const entries = Object.entries(data);
    const setClause = entries.map(([key], i) => `${key} = $${i + 2}`).join(', ');
    const values = [id, ...entries.map(([, value]) => value)];

    const result = await this.db.query(
      `UPDATE ${this.tableName} SET ${setClause} WHERE id = $1 RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.query(
      `DELETE FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return result.rowCount > 0;
  }
}

// src/repositories/taskRepository.ts
export class TaskRepository extends BaseRepository<Task, CreateTaskData, UpdateTaskData> {
  tableName = 'tasks';

  async findByStatus(status: TaskStatus): Promise<Task[]> {
    const result = await this.db.query(
      'SELECT * FROM tasks WHERE status = $1 ORDER BY created_at DESC',
      [status]
    );
    return result.rows;
  }

  async findByAssignee(assigneeId: string): Promise<Task[]> {
    const result = await this.db.query(
      'SELECT * FROM tasks WHERE assignee_id = $1 ORDER BY priority DESC, due_date ASC',
      [assigneeId]
    );
    return result.rows;
  }
}
```

## 🔐 Authentication & Authorization

### JWT Implementation

```typescript
// src/services/authService.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AppError } from '../errors/AppError';

export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private tokenBlacklist: Set<string> = new Set()
  ) {}

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('INVALID_CREDENTIALS', 'Invalid credentials', 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new AppError('INVALID_CREDENTIALS', 'Invalid credentials', 401);
    }

    const tokens = this.generateTokens(user);
    
    // Update last login
    await this.userRepository.update(user.id, { lastLoginAt: new Date() });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async register(userData: RegisterData): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new AppError('USER_EXISTS', 'User already exists', 409);
    }

    const passwordHash = await bcrypt.hash(userData.password, 12);
    const user = await this.userRepository.create({
      ...userData,
      passwordHash,
      role: userData.role || 'user',
    });

    return this.sanitizeUser(user);
  }

  private generateTokens(user: User): { accessToken: string; refreshToken: string } {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    if (this.tokenBlacklist.has(refreshToken)) {
      throw new AppError('INVALID_TOKEN', 'Token is blacklisted', 401);
    }

    try {
      const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as JwtPayload;
      const user = await this.userRepository.findById(payload.userId);
      
      if (!user) {
        throw new AppError('USER_NOT_FOUND', 'User not found', 401);
      }

      // Blacklist old refresh token
      this.tokenBlacklist.add(refreshToken);

      return this.generateTokens(user);
    } catch (error) {
      throw new AppError('INVALID_TOKEN', 'Invalid or expired token', 401);
    }
  }

  private sanitizeUser(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}
```

### Authorization Middleware

```typescript
// src/middleware/authMiddleware.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies?.accessToken || 
                req.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(new AppError('NO_TOKEN', 'Access token required', 401));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    (req as AuthenticatedRequest).user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (error) {
    return next(new AppError('INVALID_TOKEN', 'Invalid or expired token', 401));
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;
    
    if (!user) {
      return next(new AppError('UNAUTHORIZED', 'Authentication required', 401));
    }

    if (!roles.includes(user.role)) {
      return next(new AppError('FORBIDDEN', 'Insufficient permissions', 403));
    }

    next();
  };
};

export const requireOwnership = (resourceIdParam: string = 'id') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = (req as AuthenticatedRequest).user;
    const resourceId = req.params[resourceIdParam];

    // Admin users can access any resource
    if (user.role === 'admin') {
      return next();
    }

    try {
      // Check if user owns the resource
      const resource = await getResourceWithOwner(resourceId);
      if (resource.ownerId !== user.userId) {
        return next(new AppError('FORBIDDEN', 'Access denied', 403));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
```

## ✅ Input Validation

### Zod Schemas

```typescript
// src/schemas/taskSchemas.ts
import { z } from 'zod';

export const CreateTaskSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  
  status: z.enum(['todo', 'in-progress', 'done'])
    .default('todo'),
  
  priority: z.enum(['low', 'medium', 'high'])
    .default('medium'),
  
  assigneeId: z.string()
    .uuid('Invalid assignee ID format')
    .optional(),
  
  projectId: z.string()
    .uuid('Invalid project ID format')
    .optional(),
  
  dueDate: z.string()
    .datetime('Invalid date format')
    .optional()
    .transform((val) => val ? new Date(val) : undefined),
});

export const UpdateTaskSchema = CreateTaskSchema.partial();

export const TaskQuerySchema = z.object({
  page: z.string()
    .optional()
    .transform((val) => val ? parseInt(val, 10) : 1),
  
  limit: z.string()
    .optional()
    .transform((val) => val ? Math.min(parseInt(val, 10), 100) : 20),
  
  status: z.enum(['todo', 'in-progress', 'done']).optional(),
  
  priority: z.enum(['low', 'medium', 'high']).optional(),
  
  assigneeId: z.string().uuid().optional(),
  
  search: z.string()
    .max(100, 'Search query too long')
    .optional(),
});

export type CreateTaskData = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskData = z.infer<typeof UpdateTaskSchema>;
export type TaskQueryParams = z.infer<typeof TaskQuerySchema>;
```

### Validation Middleware

```typescript
// src/middleware/validateMiddleware.ts
import { ZodSchema, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.body);
      (req as any).validatedBody = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.reduce((acc, err) => {
          acc[err.path.join('.')] = err.message;
          return acc;
        }, {} as Record<string, string>);

        return next(new AppError('VALIDATION_ERROR', 'Validation failed', 400, details));
      }
      next(error);
    }
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.query);
      (req as any).validatedQuery = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.reduce((acc, err) => {
          acc[err.path.join('.')] = err.message;
          return acc;
        }, {} as Record<string, string>);

        return next(new AppError('VALIDATION_ERROR', 'Query validation failed', 400, details));
      }
      next(error);
    }
  };
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.params);
      (req as any).validatedParams = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.reduce((acc, err) => {
          acc[err.path.join('.')] = err.message;
          return acc;
        }, {} as Record<string, string>);

        return next(new AppError('VALIDATION_ERROR', 'Parameter validation failed', 400, details));
      }
      next(error);
    }
  };
}
```

## 🔄 Real-time Communication

### Socket.IO Implementation

```typescript
// src/realtime/socketManager.ts
import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

export class SocketManager {
  private io: SocketServer;
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(server: HttpServer) {
    this.io = new SocketServer(server, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
        credentials: true,
      },
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware(): void {
    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        (socket as any).user = decoded;
        next();
      } catch (error) {
        next(new Error('Invalid authentication token'));
      }
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      const user = (socket as any).user;
      logger.info(`User ${user.email} connected`, { userId: user.userId, socketId: socket.id });

      // Track connected user
      this.connectedUsers.set(user.userId, socket.id);

      // Join user to their personal room
      socket.join(`user:${user.userId}`);

      // Handle joining project rooms
      socket.on('join-project', (projectId: string) => {
        socket.join(`project:${projectId}`);
        logger.debug(`User ${user.userId} joined project ${projectId}`);
      });

      // Handle leaving project rooms
      socket.on('leave-project', (projectId: string) => {
        socket.leave(`project:${projectId}`);
        logger.debug(`User ${user.userId} left project ${projectId}`);
      });

      // Handle task updates
      socket.on('task-update', (data: { taskId: string; updates: any }) => {
        // Broadcast to project members
        socket.to(`project:${data.taskId}`).emit('task-updated', data);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.connectedUsers.delete(user.userId);
        logger.info(`User ${user.email} disconnected`, { userId: user.userId });
      });
    });
  }

  // Emit events to specific users or rooms
  emitToUser(userId: string, event: string, data: any): void {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  emitToProject(projectId: string, event: string, data: any): void {
    this.io.to(`project:${projectId}`).emit(event, data);
  }

  emitToAll(event: string, data: any): void {
    this.io.emit(event, data);
  }

  getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}

// Usage in routes
export const notifyTaskCreated = (task: Task): void => {
  const socketManager = SocketManager.getInstance();
  
  // Notify task assignee
  if (task.assigneeId) {
    socketManager.emitToUser(task.assigneeId, 'task-assigned', task);
  }
  
  // Notify project members
  if (task.projectId) {
    socketManager.emitToProject(task.projectId, 'task-created', task);
  }
};
```

## 📊 Caching Strategy

### Redis Caching

```typescript
// src/services/cacheService.ts
import Redis from 'ioredis';
import { logger } from '../utils/logger';

export class CacheService {
  private redis: Redis;

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl, {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.redis.on('error', (error) => {
      logger.error('Redis connection error:', error);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error:', { key, error });
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
    } catch (error) {
      logger.error('Cache set error:', { key, error });
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      logger.error('Cache delete error:', { key, error });
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      logger.error('Cache pattern invalidation error:', { pattern, error });
    }
  }

  // Caching decorator for methods
  cached<T>(
    keyGenerator: (...args: any[]) => string,
    ttlSeconds: number = 300
  ) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
      const originalMethod = descriptor.value;

      descriptor.value = async function (...args: any[]): Promise<T> {
        const cacheKey = keyGenerator(...args);
        
        // Try to get from cache
        const cached = await this.cacheService.get<T>(cacheKey);
        if (cached) {
          logger.debug('Cache hit:', { key: cacheKey });
          return cached;
        }

        // Execute original method
        const result = await originalMethod.apply(this, args);
        
        // Cache the result
        await this.cacheService.set(cacheKey, result, ttlSeconds);
        logger.debug('Cache miss, stored result:', { key: cacheKey });
        
        return result;
      };

      return descriptor;
    };
  }
}

// Usage example
export class TaskService {
  constructor(
    private taskRepository: TaskRepository,
    private cacheService: CacheService
  ) {}

  @cached((userId: string) => `user:${userId}:tasks`, 300)
  async getUserTasks(userId: string): Promise<Task[]> {
    return this.taskRepository.findByUserId(userId);
  }

  async createTask(data: CreateTaskData): Promise<Task> {
    const task = await this.taskRepository.create(data);
    
    // Invalidate related cache
    await this.cacheService.invalidatePattern(`user:${data.assigneeId}:*`);
    await this.cacheService.invalidatePattern(`project:${data.projectId}:*`);
    
    return task;
  }
}
```

## 🚨 Error Handling

### Centralized Error Handling

```typescript
// src/errors/AppError.ts
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, any>;
  public readonly isOperational: boolean = true;

  constructor(
    code: string,
    message: string,
    statusCode: number = 500,
    details?: Record<string, any>
  ) {
    super(message);
    
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'AppError';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Predefined error creators
export const badRequest = (message: string, details?: Record<string, any>) =>
  new AppError('BAD_REQUEST', message, 400, details);

export const unauthorized = (message: string = 'Unauthorized') =>
  new AppError('UNAUTHORIZED', message, 401);

export const forbidden = (message: string = 'Forbidden') =>
  new AppError('FORBIDDEN', message, 403);

export const notFound = (message: string = 'Not found') =>
  new AppError('NOT_FOUND', message, 404);

export const conflict = (message: string, details?: Record<string, any>) =>
  new AppError('CONFLICT', message, 409, details);

export const tooManyRequests = (message: string = 'Too many requests') =>
  new AppError('TOO_MANY_REQUESTS', message, 429);

export const internalServerError = (message: string = 'Internal server error') =>
  new AppError('INTERNAL_SERVER_ERROR', message, 500);
```

### Error Middleware

```typescript
// src/middleware/errorMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = err;

  // Convert known errors to AppError
  if (!(error instanceof AppError)) {
    if (error.name === 'ValidationError') {
      error = badRequest('Validation error', { originalError: error.message });
    } else if (error.name === 'CastError') {
      error = badRequest('Invalid ID format');
    } else if (error.name === 'MongoError' && (error as any).code === 11000) {
      error = conflict('Duplicate field value');
    } else {
      error = internalServerError();
    }
  }

  const appError = error as AppError;

  // Log error
  const logData = {
    error: {
      code: appError.code,
      message: appError.message,
      details: appError.details,
      stack: appError.stack,
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.userId,
    },
  };

  if (appError.statusCode >= 500) {
    logger.error('Server error:', logData);
  } else {
    logger.warn('Client error:', logData);
  }

  // Send error response
  const errorResponse = {
    error: {
      code: appError.code,
      message: appError.message,
      details: appError.details,
      timestamp: new Date().toISOString(),
      path: req.path,
    },
  };

  res.status(appError.statusCode).json(errorResponse);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  const error = notFound(`Route ${req.originalUrl} not found`);
  res.status(error.statusCode).json({
    error: {
      code: error.code,
      message: error.message,
      timestamp: new Date().toISOString(),
      path: req.path,
    },
  });
};
```

## 🧪 Testing

### Unit Testing

```typescript
// src/__tests__/services/taskService.test.ts
import { TaskService } from '../../services/taskService';
import { TaskRepository } from '../../repositories/taskRepository';
import { UserRepository } from '../../repositories/userRepository';
import { NotificationService } from '../../services/notificationService';
import { AppError } from '../../errors/AppError';

// Mock dependencies
const mockTaskRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
} as jest.Mocked<TaskRepository>;

const mockUserRepository = {
  findById: jest.fn(),
} as jest.Mocked<UserRepository>;

const mockNotificationService = {
  sendTaskCreated: jest.fn(),
} as jest.Mocked<NotificationService>;

describe('TaskService', () => {
  let taskService: TaskService;

  beforeEach(() => {
    taskService = new TaskService(
      mockTaskRepository,
      mockUserRepository,
      mockNotificationService
    );
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    const mockUser = {
      id: 'user-1',
      email: 'user@example.com',
      name: 'Test User',
    };

    const mockTaskData = {
      title: 'Test Task',
      description: 'Test Description',
      priority: 'medium' as const,
    };

    it('should create task successfully', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(mockUser);
      const expectedTask = {
        id: 'task-1',
        ...mockTaskData,
        ownerId: mockUser.id,
        status: 'todo' as const,
      };
      mockTaskRepository.create.mockResolvedValue(expectedTask);
      mockNotificationService.sendTaskCreated.mockResolvedValue(undefined);

      // Act
      const result = await taskService.createTask(mockTaskData, mockUser.id);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(mockTaskRepository.create).toHaveBeenCalledWith({
        ...mockTaskData,
        ownerId: mockUser.id,
        status: 'todo',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(result).toEqual(expectedTask);
    });

    it('should throw error if user not found', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        taskService.createTask(mockTaskData, 'invalid-user-id')
      ).rejects.toThrow(AppError);
      
      expect(mockTaskRepository.create).not.toHaveBeenCalled();
    });

    it('should handle notification failure gracefully', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(mockUser);
      const expectedTask = {
        id: 'task-1',
        ...mockTaskData,
        ownerId: mockUser.id,
        status: 'todo' as const,
      };
      mockTaskRepository.create.mockResolvedValue(expectedTask);
      mockNotificationService.sendTaskCreated.mockRejectedValue(new Error('Notification failed'));

      // Act
      const result = await taskService.createTask(mockTaskData, mockUser.id);

      // Assert
      expect(result).toEqual(expectedTask);
      // Task should be created even if notification fails
    });
  });
});
```

### Integration Testing

```typescript
// src/__tests__/integration/tasks.test.ts
import request from 'supertest';
import { app } from '../../app';
import { setupTestDatabase, cleanupTestDatabase } from '../helpers/database';
import { createTestUser, generateAuthToken } from '../helpers/auth';

describe('Tasks API Integration', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    await setupTestDatabase();
    const user = await createTestUser();
    userId = user.id;
    authToken = generateAuthToken(user);
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  afterEach(async () => {
    // Clean up tasks created during tests
    await request(app)
      .get('/api/v1/project-management/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .then(async (response) => {
        const tasks = response.body.tasks;
        for (const task of tasks) {
          await request(app)
            .delete(`/api/v1/project-management/tasks/${task.id}`)
            .set('Authorization', `Bearer ${authToken}`);
        }
      });
  });

  describe('POST /api/v1/project-management/tasks', () => {
    it('should create task with valid data', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'medium',
        status: 'todo',
      };

      const response = await request(app)
        .post('/api/v1/project-management/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body.task).toMatchObject({
        id: expect.any(String),
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        status: taskData.status,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        title: '', // Empty title should fail validation
        priority: 'invalid-priority',
      };

      const response = await request(app)
        .post('/api/v1/project-management/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toMatchObject({
        code: 'VALIDATION_ERROR',
        message: expect.any(String),
        details: expect.any(Object),
      });
    });

    it('should return 401 without authentication', async () => {
      const taskData = {
        title: 'Test Task',
        priority: 'medium',
      };

      await request(app)
        .post('/api/v1/project-management/tasks')
        .send(taskData)
        .expect(401);
    });
  });

  describe('GET /api/v1/project-management/tasks', () => {
    beforeEach(async () => {
      // Create test tasks
      const tasks = [
        { title: 'Task 1', priority: 'high', status: 'todo' },
        { title: 'Task 2', priority: 'medium', status: 'in-progress' },
        { title: 'Task 3', priority: 'low', status: 'done' },
      ];

      for (const task of tasks) {
        await request(app)
          .post('/api/v1/project-management/tasks')
          .set('Authorization', `Bearer ${authToken}`)
          .send(task);
      }
    });

    it('should return paginated tasks', async () => {
      const response = await request(app)
        .get('/api/v1/project-management/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 2 })
        .expect(200);

      expect(response.body).toMatchObject({
        tasks: expect.any(Array),
        pagination: {
          page: 1,
          limit: 2,
          total: expect.any(Number),
          totalPages: expect.any(Number),
        },
      });

      expect(response.body.tasks).toHaveLength(2);
    });

    it('should filter tasks by status', async () => {
      const response = await request(app)
        .get('/api/v1/project-management/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ status: 'todo' })
        .expect(200);

      expect(response.body.tasks).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ status: 'todo' })
        ])
      );
    });
  });
});
```

## 📈 Performance Optimization

### Database Optimization

```typescript
// Database indexes for common queries
// Add to migration files:

// Tasks table indexes
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

// Composite indexes for complex queries
CREATE INDEX idx_tasks_status_priority ON tasks(status, priority);
CREATE INDEX idx_tasks_assignee_status ON tasks(assignee_id, status);

// Projects table indexes
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);
```

### Query Optimization

```typescript
// src/repositories/taskRepository.ts
export class TaskRepository extends BaseRepository<Task, CreateTaskData, UpdateTaskData> {
  // Optimized query with proper indexing
  async findTasksWithPagination(
    filters: TaskFilters,
    pagination: PaginationOptions
  ): Promise<{ tasks: Task[]; total: number }> {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;
    
    // Build WHERE clause dynamically
    const whereConditions: string[] = ['1=1']; // Base condition
    const params: any[] = [];
    
    if (filters.status) {
      whereConditions.push(`status = $${params.length + 1}`);
      params.push(filters.status);
    }
    
    if (filters.assigneeId) {
      whereConditions.push(`assignee_id = $${params.length + 1}`);
      params.push(filters.assigneeId);
    }
    
    if (filters.priority) {
      whereConditions.push(`priority = $${params.length + 1}`);
      params.push(filters.priority);
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // Get total count (for pagination)
    const countResult = await this.db.query(
      `SELECT COUNT(*) as total FROM tasks WHERE ${whereClause}`,
      params
    );
    
    // Get paginated data with limit and offset
    const dataResult = await this.db.query(
      `
        SELECT * FROM tasks 
        WHERE ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `,
      [...params, limit, offset]
    );
    
    return {
      tasks: dataResult.rows,
      total: parseInt(countResult.rows[0].total),
    };
  }
  
  // Use EXPLAIN ANALYZE to optimize queries
  async analyzeQuery(query: string, params: any[]): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      const result = await this.db.query(`EXPLAIN ANALYZE ${query}`, params);
      console.log('Query Analysis:', result.rows);
    }
  }
}
```

### Memory Management

```typescript
// src/utils/memoryManager.ts
export class MemoryManager {
  private static instance: MemoryManager;
  private memoryThreshold = 0.85; // 85% memory usage threshold
  
  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  startMonitoring(): void {
    setInterval(() => {
      this.checkMemoryUsage();
    }, 30000); // Check every 30 seconds
  }

  private checkMemoryUsage(): void {
    const usage = process.memoryUsage();
    const totalMemory = require('os').totalmem();
    const memoryUsagePercent = usage.heapUsed / totalMemory;

    if (memoryUsagePercent > this.memoryThreshold) {
      logger.warn('High memory usage detected', {
        heapUsed: usage.heapUsed,
        heapTotal: usage.heapTotal,
        external: usage.external,
        rss: usage.rss,
        usagePercent: memoryUsagePercent,
      });

      // Trigger garbage collection if available
      if (global.gc) {
        global.gc();
        logger.info('Garbage collection triggered');
      }
    }
  }

  // Helper for monitoring async operations
  async monitorAsyncOperation<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    const startMemory = process.memoryUsage().heapUsed;
    const startTime = Date.now();

    try {
      const result = await operation();
      const endMemory = process.memoryUsage().heapUsed;
      const duration = Date.now() - startTime;
      
      logger.debug('Operation completed', {
        operation: operationName,
        duration,
        memoryDelta: endMemory - startMemory,
      });

      return result;
    } catch (error) {
      logger.error('Operation failed', {
        operation: operationName,
        error: error.message,
      });
      throw error;
    }
  }
}
```

This comprehensive backend development guide provides everything needed to build, maintain, and scale the API server for the 3D Printer Project while following industry best practices.
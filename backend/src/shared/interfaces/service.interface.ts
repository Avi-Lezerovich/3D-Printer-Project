import type {
  User,
  Printer,
  Project,
  ProjectFile,
  PrintJob,
  PrinterStatus,
  PrinterCommand,
  CreateUserData,
  UpdateUserData,
  CreatePrinterData,
  UpdatePrinterData,
  CreateProjectData,
  UpdateProjectData,
  AuthenticationResult,
  CommandResult,
  FileUpload,
  FileMetadata
} from '../types/domain.types.js';

/**
 * Base Service Interface
 * Provides common patterns for all domain services
 */
export interface IBaseService<T, TCreateData = Partial<T>, TUpdateData = Partial<T>> {
  // Core operations
  getById(id: string): Promise<T | null>;
  getMany(filters?: ServiceFilters<T>, options?: ServiceOptions): Promise<ServiceResult<T[]>>;
  create(data: TCreateData, context?: ServiceContext): Promise<ServiceResult<T>>;
  update(id: string, data: TUpdateData, context?: ServiceContext): Promise<ServiceResult<T>>;
  delete(id: string, context?: ServiceContext): Promise<ServiceResult<boolean>>;

  // Business logic validation
  validateCreate(data: TCreateData): Promise<ValidationResult>;
  validateUpdate(id: string, data: TUpdateData): Promise<ValidationResult>;
  validateDelete(id: string): Promise<ValidationResult>;
}

/**
 * Service Context - provides execution context for operations
 */
export interface ServiceContext {
  userId?: string;
  userRole?: string;
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

/**
 * Service Result - standardized return type for all service operations
 */
export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: ServiceError;
  metadata?: ServiceMetadata;
}

/**
 * Service Error - standardized error information
 */
export interface ServiceError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, unknown> | ValidationError[];
}

/**
 * Service Metadata - additional information about the operation
 */
export interface ServiceMetadata {
  requestId?: string;
  timestamp: Date;
  executionTime?: number;
  cacheHit?: boolean;
  warnings?: string[];
}

/**
 * Service Filters - standardized filtering for queries
 */
export interface ServiceFilters<T> {
  where?: Partial<T>;
  search?: string;
  dateRange?: {
    field: keyof T;
    start: Date;
    end: Date;
  };
}

/**
 * Service Options - standardized options for operations
 */
export interface ServiceOptions {
  limit?: number;
  offset?: number;
  orderBy?: Array<{
    field: string;
    direction: 'asc' | 'desc';
  }>;
  include?: string[];
  useCache?: boolean;
  cacheTimeout?: number;
}

/**
 * Validation Result - result of business rule validation
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  value?: unknown;
}

/**
 * Domain Event - for publishing domain events
 */
export interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  aggregateType: string;
  data: Record<string, unknown>;
  metadata: {
    userId?: string;
    timestamp: Date;
    version: number;
  };
}

/**
 * Event Publisher Interface
 */
export interface IEventPublisher {
  publish(event: DomainEvent): Promise<void>;
  publishMany(events: DomainEvent[]): Promise<void>;
}

/**
 * Cache Service Interface
 */
export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  deletePattern(pattern: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  increment(key: string, by?: number): Promise<number>;
  expire(key: string, ttlSeconds: number): Promise<void>;
}

/**
 * Audit Service Interface
 */
export interface IAuditService {
  logAction(action: AuditAction): Promise<void>;
  logActions(actions: AuditAction[]): Promise<void>;
}

export interface AuditAction {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  context?: ServiceContext;
}

/**
 * Notification Service Interface
 */
export interface INotificationService {
  sendEmail(to: string, subject: string, content: string, context?: ServiceContext): Promise<ServiceResult<boolean>>;
  sendPush(userId: string, title: string, message: string, context?: ServiceContext): Promise<ServiceResult<boolean>>;
  sendWebSocket(userId: string, event: string, data: unknown, context?: ServiceContext): Promise<ServiceResult<boolean>>;
}

/**
 * File Storage Service Interface
 */
export interface IFileStorageService {
  upload(file: FileUpload, path: string, context?: ServiceContext): Promise<ServiceResult<FileMetadata>>;
  download(filePath: string, context?: ServiceContext): Promise<ServiceResult<Buffer>>;
  delete(filePath: string, context?: ServiceContext): Promise<ServiceResult<boolean>>;
  exists(filePath: string): Promise<boolean>;
  generateSignedUrl(filePath: string, expirationMinutes?: number): Promise<string>;
}

/**
 * Background Job Service Interface
 */
export interface IJobService {
  enqueue<T>(jobType: string, data: T, options?: JobOptions): Promise<ServiceResult<string>>;
  getJob(jobId: string): Promise<JobStatus | null>;
  cancelJob(jobId: string): Promise<ServiceResult<boolean>>;
  retryJob(jobId: string): Promise<ServiceResult<boolean>>;
}

export interface JobOptions {
  delay?: number;
  attempts?: number;
  priority?: number;
  removeOnComplete?: number;
  removeOnFail?: number;
}

export interface JobStatus {
  id: string;
  type: string;
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'cancelled';
  progress?: number;
  data: unknown;
  result?: unknown;
  error?: string;
  createdAt: Date;
  processedAt?: Date;
  completedAt?: Date;
}

/**
 * Service Factory Interface
 * Provides access to all services through dependency injection
 */
export interface IServiceFactory {
  // Domain services
  getUserService(): IUserService;
  getPrinterService(): IPrinterService;
  getProjectService(): IProjectService;
  
  // Infrastructure services
  getCacheService(): ICacheService;
  getAuditService(): IAuditService;
  getNotificationService(): INotificationService;
  getFileStorageService(): IFileStorageService;
  getJobService(): IJobService;
  getEventPublisher(): IEventPublisher;
}

// Domain-specific service interfaces (examples)
export interface IUserService extends IBaseService<User, CreateUserData, UpdateUserData> {
  authenticate(email: string, password: string): Promise<ServiceResult<AuthenticationResult>>;
  refreshToken(refreshToken: string): Promise<ServiceResult<AuthenticationResult>>;
  resetPassword(email: string): Promise<ServiceResult<boolean>>;
  updateProfile(userId: string, data: UpdateUserData, context?: ServiceContext): Promise<ServiceResult<User>>;
}

export interface IPrinterService extends IBaseService<Printer, CreatePrinterData, UpdatePrinterData> {
  getStatus(printerId: string): Promise<ServiceResult<PrinterStatus>>;
  updateStatus(printerId: string, status: PrinterStatus, context?: ServiceContext): Promise<ServiceResult<Printer>>;
  sendCommand(printerId: string, command: PrinterCommand, context?: ServiceContext): Promise<ServiceResult<CommandResult>>;
  getAvailablePrinters(): Promise<ServiceResult<Printer[]>>;
}

export interface IProjectService extends IBaseService<Project, CreateProjectData, UpdateProjectData> {
  getUserProjects(userId: string, options?: ServiceOptions): Promise<ServiceResult<Project[]>>;
  addFile(projectId: string, file: FileUpload, context?: ServiceContext): Promise<ServiceResult<ProjectFile>>;
  removeFile(projectId: string, fileId: string, context?: ServiceContext): Promise<ServiceResult<boolean>>;
  startPrint(projectId: string, printerId: string, context?: ServiceContext): Promise<ServiceResult<PrintJob>>;
}

// Additional types for domain services
export interface PrinterCommandExtended extends PrinterCommand {
  priority?: number;
  scheduledAt?: Date;
}

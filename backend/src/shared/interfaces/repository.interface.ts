/**
 * Base Repository Interface
 * Provides common CRUD operations for all repositories
 */
export interface IBaseRepository<T, TCreateData = Partial<T>, TUpdateData = Partial<T>> {
  // Read operations
  findById(id: string): Promise<T | null>;
  findMany(filters?: Partial<T>, options?: FindManyOptions): Promise<T[]>;
  findOne(filters: Partial<T>): Promise<T | null>;
  exists(filters: Partial<T>): Promise<boolean>;
  count(filters?: Partial<T>): Promise<number>;

  // Write operations  
  create(data: TCreateData): Promise<T>;
  createMany(data: TCreateData[]): Promise<T[]>;
  update(id: string, data: TUpdateData): Promise<T | null>;
  updateMany(filters: Partial<T>, data: TUpdateData): Promise<number>;
  delete(id: string): Promise<boolean>;
  deleteMany(filters: Partial<T>): Promise<number>;

  // Transaction support
  executeInTransaction<R>(operation: (transaction: unknown) => Promise<R>): Promise<R>;
}

export interface FindManyOptions {
  limit?: number;
  offset?: number;
  orderBy?: Array<{
    field: string;
    direction: 'asc' | 'desc';
  }>;
  include?: string[];
}

/**
 * Repository Factory Interface
 * Provides access to all repositories through dependency injection
 */
export interface IRepositoryFactory {
  getUserRepository(): IUserRepository;
  getPrinterRepository(): IPrinterRepository;
  getProjectRepository(): IProjectRepository;
  getAuditLogRepository(): IAuditLogRepository;
}

// Domain-specific repository interfaces will extend IBaseRepository
export interface IUserRepository extends IBaseRepository<User, CreateUserData, UpdateUserData> {
  findByEmail(email: string): Promise<User | null>;
  findByApiKey(apiKey: string): Promise<User | null>;
  updateLastLogin(id: string): Promise<void>;
}

export interface IPrinterRepository extends IBaseRepository<Printer, CreatePrinterData, UpdatePrinterData> {
  findBySerialNumber(serialNumber: string): Promise<Printer | null>;
  findByStatus(status: PrinterStatus): Promise<Printer[]>;
  updateStatus(id: string, status: PrinterStatus, metadata?: object): Promise<void>;
}

export interface IProjectRepository extends IBaseRepository<Project, CreateProjectData, UpdateProjectData> {
  findByUserId(userId: string): Promise<Project[]>;
  findByStatus(status: ProjectStatus): Promise<Project[]>;
  findWithFiles(id: string): Promise<Project | null>;
}

export interface IAuditLogRepository extends IBaseRepository<AuditLog, CreateAuditLogData> {
  findByUserId(userId: string, limit?: number): Promise<AuditLog[]>;
  findByAction(action: string, limit?: number): Promise<AuditLog[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<AuditLog[]>;
}

// Types (these would normally come from your domain models)
export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  apiKey?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Printer {
  id: string;
  name: string;
  serialNumber: string;
  model: string;
  status: PrinterStatus;
  metadata: object;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  userId: string;
  status: ProjectStatus;
  files: ProjectFile[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata: object;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
}

// Enums
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  VIEWER = 'viewer'
}

export enum PrinterStatus {
  IDLE = 'idle',
  PRINTING = 'printing',
  PAUSED = 'paused',
  ERROR = 'error',
  OFFLINE = 'offline',
  MAINTENANCE = 'maintenance'
}

export enum ProjectStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

// Create/Update data types
export type CreateUserData = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastLogin'>;
export type UpdateUserData = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>;

export type CreatePrinterData = Omit<Printer, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdatePrinterData = Partial<Omit<Printer, 'id' | 'createdAt' | 'updatedAt'>>;

export type CreateProjectData = Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'files'>;
export type UpdateProjectData = Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'files'>>;

export type CreateAuditLogData = Omit<AuditLog, 'id' | 'createdAt'>;

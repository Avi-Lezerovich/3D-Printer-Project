/**
 * Domain Models and Types
 * Shared types across all backend modules
 */

// User Domain
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

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  VIEWER = 'viewer'
}

export type CreateUserData = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastLogin'>;
export type UpdateUserData = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>;

// Printer Domain
export interface Printer {
  id: string;
  name: string;
  serialNumber: string;
  model: string;
  status: PrinterStatus;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export enum PrinterStatus {
  IDLE = 'idle',
  PRINTING = 'printing',
  PAUSED = 'paused',
  ERROR = 'error',
  OFFLINE = 'offline',
  MAINTENANCE = 'maintenance'
}

export type CreatePrinterData = Omit<Printer, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdatePrinterData = Partial<Omit<Printer, 'id' | 'createdAt' | 'updatedAt'>>;

// Project Domain
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

export enum ProjectStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
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

export type CreateProjectData = Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'files'>;
export type UpdateProjectData = Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'files'>>;

// Audit Domain
export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export type CreateAuditLogData = Omit<AuditLog, 'id' | 'createdAt'>;

// Print Job Domain
export interface PrintJob {
  id: string;
  projectId: string;
  printerId: string;
  status: PrintJobStatus;
  startedAt?: Date;
  completedAt?: Date;
  estimatedDuration?: number;
  actualDuration?: number;
  progress?: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export enum PrintJobStatus {
  QUEUED = 'queued',
  PRINTING = 'printing',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Authentication
export interface AuthenticationResult {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  user: User;
}

// Printer Commands
export interface PrinterCommand {
  type: PrinterCommandType;
  parameters?: Record<string, unknown>;
}

export enum PrinterCommandType {
  START = 'start',
  STOP = 'stop',
  PAUSE = 'pause',
  RESUME = 'resume',
  HOME = 'home',
  EMERGENCY_STOP = 'emergency_stop'
}

export interface CommandResult {
  success: boolean;
  message?: string;
  data?: unknown;
}

// Common utility types
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

// Configuration types
export interface DatabaseConfig {
  url: string;
  maxConnections: number;
  connectionTimeout: number;
  queryTimeout: number;
}

export interface CacheConfig {
  url: string;
  ttl: number;
  maxMemory: string;
  keyPrefix: string;
}

export interface AuthConfig {
  jwtSecret: string;
  jwtExpiration: string;
  refreshTokenExpiration: string;
  bcryptRounds: number;
}

export interface FileStorageConfig {
  type: 'local' | 's3' | 'gcs';
  path?: string;
  bucket?: string;
  maxFileSize: number;
  allowedMimeTypes: string[];
}

// Event types
export interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  aggregateType: string;
  data: Record<string, unknown>;
  metadata: EventMetadata;
}

export interface EventMetadata {
  userId?: string;
  timestamp: Date;
  version: number;
  correlationId?: string;
  causationId?: string;
}

// WebSocket types
export interface WebSocketMessage {
  type: string;
  payload: unknown;
  timestamp: Date;
  userId?: string;
}

export interface WebSocketEvent {
  event: string;
  room?: string;
  data: unknown;
}

// Health check types
export interface HealthCheck {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: Date;
  responseTime?: number;
  details?: Record<string, unknown>;
}

export interface SystemHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  checks: HealthCheck[];
  timestamp: Date;
  version: string;
  uptime: number;
}

// Rate limiting types
export interface RateLimit {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// File storage types
export interface FileUpload {
  filename: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
}

export interface FileMetadata {
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
  checksum?: string;
}

// Monitoring types
export interface MetricData {
  name: string;
  value: number;
  unit?: string;
  tags?: Record<string, string>;
  timestamp: Date;
}

export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
  userId?: string;
  requestId?: string;
}

import type { Request, Response, NextFunction } from 'express';

/**
 * ILogger interface - simplified for this example
 */
export interface ILogger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, error?: Error, context?: Record<string, unknown>): void;
}

/**
 * Service Result interface
 */
export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code?: string;
    message?: string;
    field?: string;
    details?: unknown;
  };
  metadata?: {
    timestamp: Date;
    [key: string]: unknown;
  };
}

/**
 * Base Controller Class
 * Provides common functionality for all API controllers
 */
export abstract class BaseController {
  constructor(protected readonly logger: ILogger) {}

  /**
   * Handle service result and send appropriate HTTP response
   */
  protected handleServiceResult<T>(
    res: Response,
    result: ServiceResult<T>,
    successStatus: number = 200,
    errorStatus?: number
  ): void {
    if (result.success && result.data !== undefined) {
      res.status(successStatus).json({
        success: true,
        data: result.data,
        metadata: result.metadata
      });
    } else {
      const status = errorStatus || this.getErrorStatus(result.error?.code);
      res.status(status).json({
        success: false,
        error: {
          code: result.error?.code || 'UNKNOWN_ERROR',
          message: result.error?.message || 'An unknown error occurred',
          field: result.error?.field,
          details: result.error?.details
        },
        metadata: result.metadata
      });
    }
  }

  /**
   * Handle async route methods and catch errors
   */
  protected asyncHandler(
    handler: (req: Request, res: Response, next: NextFunction) => Promise<void>
  ) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(handler(req, res, next)).catch(next);
    };
  }

  /**
   * Extract pagination parameters from request
   */
  protected getPaginationParams(req: Request): { limit: number; offset: number } {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;

    return { limit, offset };
  }

  /**
   * Extract sort parameters from request
   */
  protected getSortParams(req: Request): Array<{ field: string; direction: 'asc' | 'desc' }> {
    const sortBy = req.query.sortBy as string;
    const sortOrder = req.query.sortOrder as string;

    if (!sortBy) {
      return [];
    }

    return [{
      field: sortBy,
      direction: sortOrder === 'desc' ? 'desc' : 'asc'
    }];
  }

  /**
   * Create service context from request
   */
  protected createServiceContext(req: AuthenticatedRequest): ServiceContext {
    return {
      userId: req.user?.id,
      userRole: req.user?.role,
      requestId: req.requestId,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date()
    };
  }

  /**
   * Validate required fields in request body
   */
  protected validateRequiredFields(
    body: Record<string, unknown>,
    fields: string[]
  ): { isValid: boolean; missing: string[] } {
    const missing = fields.filter(field => 
      body[field] === undefined || body[field] === null || body[field] === ''
    );

    return {
      isValid: missing.length === 0,
      missing
    };
  }

  /**
   * Send validation error response
   */
  protected sendValidationError(
    res: Response,
    missing: string[],
    message: string = 'Missing required fields'
  ): void {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message,
        details: { missing }
      }
    });
  }

  /**
   * Send not found response
   */
  protected sendNotFound(res: Response, resource: string = 'Resource'): void {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `${resource} not found`
      }
    });
  }

  /**
   * Send success response with data
   */
  protected sendSuccess<T>(
    res: Response, 
    data: T, 
    status: number = 200, 
    message?: string
  ): void {
    res.status(status).json({
      success: true,
      data,
      message,
      timestamp: new Date()
    });
  }

  /**
   * Send error response
   */
  protected sendError(
    res: Response,
    status: number,
    code: string,
    message: string,
    details?: unknown
  ): void {
    res.status(status).json({
      success: false,
      error: {
        code,
        message,
        details
      },
      timestamp: new Date()
    });
  }

  /**
   * Map error codes to HTTP status codes
   */
  private getErrorStatus(errorCode?: string): number {
    const statusMap: Record<string, number> = {
      'VALIDATION_FAILED': 400,
      'VALIDATION_ERROR': 400,
      'INVALID_CREDENTIALS': 401,
      'UNAUTHORIZED': 401,
      'FORBIDDEN': 403,
      'NOT_FOUND': 404,
      'USER_NOT_FOUND': 404,
      'PRINTER_NOT_FOUND': 404,
      'PROJECT_NOT_FOUND': 404,
      'USER_EXISTS': 409,
      'PRINTER_EXISTS': 409,
      'CONFLICT': 409,
      'INVALID_COMMAND': 422,
      'UNPROCESSABLE_ENTITY': 422,
      'INTERNAL_SERVER_ERROR': 500,
      'CREATE_FAILED': 500,
      'UPDATE_FAILED': 500,
      'DELETE_FAILED': 500
    };

    return statusMap[errorCode || ''] || 500;
  }
}

/**
 * Extended Request interface with user information
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
  };
  requestId?: string;
}

/**
 * Service Context interface
 */
export interface ServiceContext {
  userId?: string;
  userRole?: string;
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

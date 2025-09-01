import type { 
  IUserService, 
  ServiceResult, 
  ServiceContext,
  ValidationResult 
} from '../../../shared/interfaces/service.interface.js';
import type { 
  User, 
  CreateUserData, 
  UpdateUserData, 
  AuthenticationResult 
} from '../../../shared/types/domain.types.js';
import type { IUserRepository } from '../../../shared/interfaces/repository.interface.js';
import type { ILogger } from '../../../infrastructure/logging/Logger.js';

/**
 * Authentication Service
 * Handles user authentication, registration, and session management
 */
export class AuthService implements IUserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: ILogger
  ) {}

  async getById(id: string): Promise<User | null> {
    try {
      this.logger.debug(`Getting user by ID: ${id}`);
      return await this.userRepository.findById(id);
    } catch (error) {
      this.logger.error(`Failed to get user by ID: ${id}`, error as Error);
      throw error;
    }
  }

  async getMany(filters?: any, options?: any): Promise<ServiceResult<User[]>> {
    try {
      const users = await this.userRepository.findMany(filters, options);
      return {
        success: true,
        data: users,
        metadata: {
          timestamp: new Date()
        }
      };
    } catch (error) {
      this.logger.error('Failed to get users', error as Error);
      return {
        success: false,
        error: {
          code: 'GET_USERS_FAILED',
          message: 'Failed to retrieve users'
        },
        metadata: {
          timestamp: new Date()
        }
      };
    }
  }

  async create(data: CreateUserData, context?: ServiceContext): Promise<ServiceResult<User>> {
    try {
      // Validate user data
      const validation = await this.validateCreate(data);
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'User data validation failed',
            details: validation.errors
          },
          metadata: {
            timestamp: new Date()
          }
        };
      }

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser) {
        return {
          success: false,
          error: {
            code: 'USER_EXISTS',
            message: 'User with this email already exists'
          },
          metadata: {
            timestamp: new Date()
          }
        };
      }

      const user = await this.userRepository.create(data);
      this.logger.info(`User created: ${user.id}`, { userId: user.id, context });

      return {
        success: true,
        data: user,
        metadata: {
          timestamp: new Date()
        }
      };
    } catch (error) {
      this.logger.error('Failed to create user', error as Error, { data, context });
      return {
        success: false,
        error: {
          code: 'CREATE_USER_FAILED',
          message: 'Failed to create user'
        },
        metadata: {
          timestamp: new Date()
        }
      };
    }
  }

  async update(id: string, data: UpdateUserData, context?: ServiceContext): Promise<ServiceResult<User>> {
    try {
      const validation = await this.validateUpdate(id, data);
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Update data validation failed',
            details: validation.errors
          },
          metadata: {
            timestamp: new Date()
          }
        };
      }

      const user = await this.userRepository.update(id, data);
      if (!user) {
        return {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          },
          metadata: {
            timestamp: new Date()
          }
        };
      }

      this.logger.info(`User updated: ${id}`, { userId: id, context });
      return {
        success: true,
        data: user,
        metadata: {
          timestamp: new Date()
        }
      };
    } catch (error) {
      this.logger.error(`Failed to update user: ${id}`, error as Error, { data, context });
      return {
        success: false,
        error: {
          code: 'UPDATE_USER_FAILED',
          message: 'Failed to update user'
        },
        metadata: {
          timestamp: new Date()
        }
      };
    }
  }

  async delete(id: string, context?: ServiceContext): Promise<ServiceResult<boolean>> {
    try {
      const validation = await this.validateDelete(id);
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Delete validation failed',
            details: validation.errors
          },
          metadata: {
            timestamp: new Date()
          }
        };
      }

      const success = await this.userRepository.delete(id);
      if (!success) {
        return {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          },
          metadata: {
            timestamp: new Date()
          }
        };
      }

      this.logger.info(`User deleted: ${id}`, { userId: id, context });
      return {
        success: true,
        data: true,
        metadata: {
          timestamp: new Date()
        }
      };
    } catch (error) {
      this.logger.error(`Failed to delete user: ${id}`, error as Error, { context });
      return {
        success: false,
        error: {
          code: 'DELETE_USER_FAILED',
          message: 'Failed to delete user'
        },
        metadata: {
          timestamp: new Date()
        }
      };
    }
  }

  async authenticate(email: string, password: string): Promise<ServiceResult<AuthenticationResult>> {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password'
          },
          metadata: {
            timestamp: new Date()
          }
        };
      }

      // TODO: Implement password hashing and verification
      // const isValid = await bcrypt.compare(password, user.password);
      const isValid = true; // Placeholder

      if (!isValid) {
        return {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password'
          },
          metadata: {
            timestamp: new Date()
          }
        };
      }

      // Update last login
      await this.userRepository.updateLastLogin(user.id);

      // TODO: Generate JWT tokens
      const authResult: AuthenticationResult = {
        accessToken: 'generated-jwt-token',
        refreshToken: 'generated-refresh-token',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        user
      };

      this.logger.info(`User authenticated: ${user.id}`, { userId: user.id });
      return {
        success: true,
        data: authResult,
        metadata: {
          timestamp: new Date()
        }
      };
    } catch (error) {
      this.logger.error('Authentication failed', error as Error, { email });
      return {
        success: false,
        error: {
          code: 'AUTHENTICATION_FAILED',
          message: 'Authentication failed'
        },
        metadata: {
          timestamp: new Date()
        }
      };
    }
  }

  async refreshToken(refreshToken: string): Promise<ServiceResult<AuthenticationResult>> {
    // TODO: Implement refresh token logic
    return {
      success: false,
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Refresh token not implemented'
      },
      metadata: {
        timestamp: new Date()
      }
    };
  }

  async resetPassword(email: string): Promise<ServiceResult<boolean>> {
    // TODO: Implement password reset logic
    return {
      success: false,
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Password reset not implemented'
      },
      metadata: {
        timestamp: new Date()
      }
    };
  }

  async updateProfile(userId: string, data: UpdateUserData, context?: ServiceContext): Promise<ServiceResult<User>> {
    return this.update(userId, data, context);
  }

  async validateCreate(data: CreateUserData): Promise<ValidationResult> {
    const errors = [];

    if (!data.email) {
      errors.push({
        field: 'email',
        code: 'REQUIRED',
        message: 'Email is required'
      });
    } else if (!this.isValidEmail(data.email)) {
      errors.push({
        field: 'email',
        code: 'INVALID_FORMAT',
        message: 'Invalid email format'
      });
    }

    if (!data.username) {
      errors.push({
        field: 'username',
        code: 'REQUIRED',
        message: 'Username is required'
      });
    } else if (data.username.length < 3) {
      errors.push({
        field: 'username',
        code: 'TOO_SHORT',
        message: 'Username must be at least 3 characters'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async validateUpdate(id: string, data: UpdateUserData): Promise<ValidationResult> {
    const errors = [];

    if (!id) {
      errors.push({
        field: 'id',
        code: 'REQUIRED',
        message: 'User ID is required'
      });
    }

    if (data.email && !this.isValidEmail(data.email)) {
      errors.push({
        field: 'email',
        code: 'INVALID_FORMAT',
        message: 'Invalid email format'
      });
    }

    if (data.username && data.username.length < 3) {
      errors.push({
        field: 'username',
        code: 'TOO_SHORT',
        message: 'Username must be at least 3 characters'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async validateDelete(id: string): Promise<ValidationResult> {
    const errors = [];

    if (!id) {
      errors.push({
        field: 'id',
        code: 'REQUIRED',
        message: 'User ID is required'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    return emailRegex.test(email);
  }
}

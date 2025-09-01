import type { 
  IUserRepository, 
  FindManyOptions,
  User,
  CreateUserData,
  UpdateUserData
} from '../../shared/interfaces/repository.interface.js';
import type { ILogger } from '../logging/Logger.js';

/**
 * Prisma User Repository Implementation
 * Handles all user data persistence using Prisma ORM
 */
export class PrismaUserRepository implements IUserRepository {
  constructor(
    private readonly prisma: any, // PrismaClient type would be imported in real implementation
    private readonly logger: ILogger
  ) {}

  async findById(id: string): Promise<User | null> {
    try {
      this.logger.debug(`Finding user by ID: ${id}`);
      
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          apiKey: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return user;
    } catch (error) {
      this.logger.error(`Failed to find user by ID: ${id}`, error as Error);
      throw error;
    }
  }

  async findMany(filters?: Partial<User>, options?: FindManyOptions): Promise<User[]> {
    try {
      this.logger.debug('Finding multiple users', { filters, options });

      const where: any = {};
      if (filters) {
        Object.keys(filters).forEach(key => {
          if (filters[key as keyof User] !== undefined) {
            where[key] = filters[key as keyof User];
          }
        });
      }

      const users = await this.prisma.user.findMany({
        where,
        take: options?.limit,
        skip: options?.offset,
        orderBy: options?.orderBy?.map(order => ({
          [order.field]: order.direction
        })),
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          apiKey: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return users;
    } catch (error) {
      this.logger.error('Failed to find multiple users', error as Error, { filters, options });
      throw error;
    }
  }

  async findOne(filters: Partial<User>): Promise<User | null> {
    try {
      this.logger.debug('Finding one user', { filters });

      const where: any = {};
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof User] !== undefined) {
          where[key] = filters[key as keyof User];
        }
      });

      const user = await this.prisma.user.findFirst({
        where,
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          apiKey: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return user;
    } catch (error) {
      this.logger.error('Failed to find one user', error as Error, { filters });
      throw error;
    }
  }

  async exists(filters: Partial<User>): Promise<boolean> {
    try {
      const count = await this.count(filters);
      return count > 0;
    } catch (error) {
      this.logger.error('Failed to check user exists', error as Error, { filters });
      throw error;
    }
  }

  async count(filters?: Partial<User>): Promise<number> {
    try {
      this.logger.debug('Counting users', { filters });

      const where: any = {};
      if (filters) {
        Object.keys(filters).forEach(key => {
          if (filters[key as keyof User] !== undefined) {
            where[key] = filters[key as keyof User];
          }
        });
      }

      const count = await this.prisma.user.count({ where });
      return count;
    } catch (error) {
      this.logger.error('Failed to count users', error as Error, { filters });
      throw error;
    }
  }

  async create(data: CreateUserData): Promise<User> {
    try {
      this.logger.debug('Creating user', { data: { ...data, password: '[REDACTED]' } });

      const user = await this.prisma.user.create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          apiKey: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true
        }
      });

      this.logger.info(`User created: ${user.id}`, { userId: user.id });
      return user;
    } catch (error) {
      this.logger.error('Failed to create user', error as Error, { data: { ...data, password: '[REDACTED]' } });
      throw error;
    }
  }

  async createMany(data: CreateUserData[]): Promise<User[]> {
    try {
      this.logger.debug(`Creating ${data.length} users`);

      const users = await this.prisma.$transaction(
        data.map(userData => 
          this.prisma.user.create({
            data: {
              ...userData,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            select: {
              id: true,
              email: true,
              username: true,
              role: true,
              apiKey: true,
              lastLogin: true,
              createdAt: true,
              updatedAt: true
            }
          })
        )
      );

      this.logger.info(`Created ${users.length} users`);
      return users;
    } catch (error) {
      this.logger.error(`Failed to create ${data.length} users`, error as Error);
      throw error;
    }
  }

  async update(id: string, data: UpdateUserData): Promise<User | null> {
    try {
      this.logger.debug(`Updating user: ${id}`, { data });

      const user = await this.prisma.user.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          apiKey: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true
        }
      });

      this.logger.info(`User updated: ${id}`, { userId: id });
      return user;
    } catch (error) {
      if ((error as any).code === 'P2025') {
        // Record not found
        this.logger.warn(`User not found for update: ${id}`);
        return null;
      }
      this.logger.error(`Failed to update user: ${id}`, error as Error, { data });
      throw error;
    }
  }

  async updateMany(filters: Partial<User>, data: UpdateUserData): Promise<number> {
    try {
      this.logger.debug('Updating multiple users', { filters, data });

      const where: any = {};
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof User] !== undefined) {
          where[key] = filters[key as keyof User];
        }
      });

      const result = await this.prisma.user.updateMany({
        where,
        data: {
          ...data,
          updatedAt: new Date()
        }
      });

      this.logger.info(`Updated ${result.count} users`);
      return result.count;
    } catch (error) {
      this.logger.error('Failed to update multiple users', error as Error, { filters, data });
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      this.logger.debug(`Deleting user: ${id}`);

      await this.prisma.user.delete({
        where: { id }
      });

      this.logger.info(`User deleted: ${id}`, { userId: id });
      return true;
    } catch (error) {
      if ((error as any).code === 'P2025') {
        // Record not found
        this.logger.warn(`User not found for deletion: ${id}`);
        return false;
      }
      this.logger.error(`Failed to delete user: ${id}`, error as Error);
      throw error;
    }
  }

  async deleteMany(filters: Partial<User>): Promise<number> {
    try {
      this.logger.debug('Deleting multiple users', { filters });

      const where: any = {};
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof User] !== undefined) {
          where[key] = filters[key as keyof User];
        }
      });

      const result = await this.prisma.user.deleteMany({ where });

      this.logger.info(`Deleted ${result.count} users`);
      return result.count;
    } catch (error) {
      this.logger.error('Failed to delete multiple users', error as Error, { filters });
      throw error;
    }
  }

  async executeInTransaction<R>(operation: (transaction: any) => Promise<R>): Promise<R> {
    try {
      this.logger.debug('Executing user repository transaction');
      
      const result = await this.prisma.$transaction(operation);
      
      this.logger.debug('User repository transaction completed successfully');
      return result;
    } catch (error) {
      this.logger.error('User repository transaction failed', error as Error);
      throw error;
    }
  }

  // User-specific methods
  async findByEmail(email: string): Promise<User | null> {
    try {
      this.logger.debug(`Finding user by email: ${email.substring(0, 3)}...`);

      const user = await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          apiKey: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return user;
    } catch (error) {
      this.logger.error(`Failed to find user by email: ${email.substring(0, 3)}...`, error as Error);
      throw error;
    }
  }

  async findByApiKey(apiKey: string): Promise<User | null> {
    try {
      this.logger.debug('Finding user by API key');

      const user = await this.prisma.user.findUnique({
        where: { apiKey },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          apiKey: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return user;
    } catch (error) {
      this.logger.error('Failed to find user by API key', error as Error);
      throw error;
    }
  }

  async updateLastLogin(id: string): Promise<void> {
    try {
      this.logger.debug(`Updating last login for user: ${id}`);

      await this.prisma.user.update({
        where: { id },
        data: {
          lastLogin: new Date(),
          updatedAt: new Date()
        }
      });

      this.logger.debug(`Last login updated for user: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to update last login for user: ${id}`, error as Error);
      throw error;
    }
  }
}

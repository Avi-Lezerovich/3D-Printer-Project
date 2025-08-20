import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validateBody, validateQuery, validateParams } from '../validate';

// Mock AppError
vi.mock('../../errors/AppError.js', () => ({
  badRequest: vi.fn((message, details) => ({ message, details }))
}));

describe('Validation Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {};
    mockNext = vi.fn();
  });

  describe('validateBody', () => {
    const testSchema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      age: z.number().optional()
    });

    it('validates valid body data successfully', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25
      };

      mockReq.body = validData;

      const middleware = validateBody(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect((mockReq as any).validatedBody).toEqual(validData);
    });

    it('validates valid body data without optional fields', () => {
      const validData = {
        name: 'Jane Doe',
        email: 'jane@example.com'
      };

      mockReq.body = validData;

      const middleware = validateBody(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect((mockReq as any).validatedBody).toEqual(validData);
    });

    it('rejects invalid body data', () => {
      const invalidData = {
        name: '', // Invalid: empty string
        email: 'not-an-email', // Invalid: not email format
        age: 'twenty-five' // Invalid: not a number
      };

      mockReq.body = invalidData;

      const middleware = validateBody(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Validation failed',
        details: expect.any(Array)
      }));
      expect((mockReq as any).validatedBody).toBeUndefined();
    });

    it('rejects missing required fields', () => {
      const incompleteData = {
        name: 'John Doe'
        // Missing required email field
      };

      mockReq.body = incompleteData;

      const middleware = validateBody(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Validation failed',
        details: expect.any(Array)
      }));
    });

    it('handles empty body', () => {
      mockReq.body = {};

      const middleware = validateBody(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Validation failed',
        details: expect.any(Array)
      }));
    });

    it('handles null body', () => {
      mockReq.body = null;

      const middleware = validateBody(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Validation failed'
      }));
    });
  });

  describe('validateQuery', () => {
    const querySchema = z.object({
      page: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1)),
      limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().max(100)).optional(),
      search: z.string().optional()
    });

    it('validates valid query parameters', () => {
      const validQuery = {
        page: '1',
        limit: '10',
        search: 'test'
      };

      mockReq.query = validQuery;

      const middleware = validateQuery(querySchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect((mockReq as any).validatedQuery).toEqual({
        page: 1,
        limit: 10,
        search: 'test'
      });
    });

    it('validates query with only required parameters', () => {
      const validQuery = {
        page: '2'
      };

      mockReq.query = validQuery;

      const middleware = validateQuery(querySchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect((mockReq as any).validatedQuery).toEqual({
        page: 2
      });
    });

    it('rejects invalid query parameters', () => {
      const invalidQuery = {
        page: '0', // Invalid: less than 1
        limit: '200' // Invalid: greater than 100
      };

      mockReq.query = invalidQuery;

      const middleware = validateQuery(querySchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Validation failed',
        details: expect.any(Array)
      }));
    });

    it('rejects non-numeric page parameter', () => {
      const invalidQuery = {
        page: 'not-a-number'
      };

      mockReq.query = invalidQuery;

      const middleware = validateQuery(querySchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Validation failed'
      }));
    });
  });

  describe('validateParams', () => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
      type: z.enum(['project', 'task', 'user'])
    });

    it('validates valid URL parameters', () => {
      const validParams = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        type: 'project'
      };

      mockReq.params = validParams;

      const middleware = validateParams(paramsSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect((mockReq as any).validatedParams).toEqual(validParams);
    });

    it('rejects invalid UUID parameter', () => {
      const invalidParams = {
        id: 'not-a-uuid',
        type: 'project'
      };

      mockReq.params = invalidParams;

      const middleware = validateParams(paramsSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Validation failed',
        details: expect.any(Array)
      }));
    });

    it('rejects invalid enum parameter', () => {
      const invalidParams = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        type: 'invalid-type'
      };

      mockReq.params = invalidParams;

      const middleware = validateParams(paramsSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Validation failed',
        details: expect.any(Array)
      }));
    });

    it('rejects missing parameters', () => {
      const incompleteParams = {
        id: '123e4567-e89b-12d3-a456-426614174000'
        // Missing required type parameter
      };

      mockReq.params = incompleteParams;

      const middleware = validateParams(paramsSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Validation failed'
      }));
    });
  });

  describe('Edge cases', () => {
    it('handles schema with no requirements', () => {
      const permissiveSchema = z.object({}).passthrough();
      
      mockReq.body = { anything: 'goes', here: true, number: 42 };

      const middleware = validateBody(permissiveSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect((mockReq as any).validatedBody).toEqual({ anything: 'goes', here: true, number: 42 });
    });

    it('handles complex nested schema', () => {
      const nestedSchema = z.object({
        user: z.object({
          profile: z.object({
            name: z.string(),
            settings: z.object({
              notifications: z.boolean(),
              theme: z.enum(['light', 'dark'])
            })
          })
        }),
        preferences: z.array(z.string())
      });

      const validNestedData = {
        user: {
          profile: {
            name: 'John Doe',
            settings: {
              notifications: true,
              theme: 'dark' as const
            }
          }
        },
        preferences: ['email', 'sms']
      };

      mockReq.body = validNestedData;

      const middleware = validateBody(nestedSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect((mockReq as any).validatedBody).toEqual(validNestedData);
    });

    it('strips unknown fields with strict schema', () => {
      const strictSchema = z.object({
        name: z.string()
      }).strict();

      const dataWithExtra = {
        name: 'John',
        extraField: 'should be removed'
      };

      mockReq.body = dataWithExtra;

      const middleware = validateBody(strictSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      // Should fail validation due to extra field in strict mode
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Validation failed'
      }));
    });
  });
});
import { ZodSchema } from 'zod'
import { Request, Response, NextFunction } from 'express'
import { badRequest } from '../errors/AppError.js'

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      return next(badRequest('Validation failed', result.error.issues))
    }
    // Attach parsed data for downstream use
    ;(req as any).validatedBody = result.data
    next()
  }
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query)
    if (!result.success) {
      return next(badRequest('Validation failed', result.error.issues))
    }
    ;(req as any).validatedQuery = result.data
    next()
  }
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params)
    if (!result.success) {
      return next(badRequest('Validation failed', result.error.issues))
    }
    ;(req as any).validatedParams = result.data
    next()
  }
}

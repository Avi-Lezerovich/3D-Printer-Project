import { Request, Response, NextFunction } from 'express'
import { forbidden } from '../errors/AppError.js'

export function requireRole(...roles: string[]) {
  return function (req: Request, _res: Response, next: NextFunction) {
    const userRole = (req as any).user?.role
    if (!userRole || !roles.includes(userRole)) {
      return next(forbidden('Insufficient permissions'))
    }
    next()
  }
}

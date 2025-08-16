import { Request, Response, NextFunction } from 'express'
import { hasPermission } from '../security/permissions/rbac.js'
import { forbidden } from '../errors/AppError.js'

export function requirePermission(...perms: string[]) {
  return function(req: Request, _res: Response, next: NextFunction) {
    const role = (req as any).user?.role
  if (!role) return (_res as any).status(401).json({ message: 'Unauthorized' })
  for (const p of perms) if (!hasPermission(role, p as any)) return next(forbidden('Forbidden'))
    next()
  }
}

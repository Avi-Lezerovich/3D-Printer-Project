import { Request, Response, NextFunction } from 'express'

export function setCache(seconds: number) {
  const value = `private, max-age=${Math.max(0, Math.floor(seconds))}`
  return function (_req: Request, res: Response, next: NextFunction) {
    res.setHeader('Cache-Control', value)
    next()
  }
}

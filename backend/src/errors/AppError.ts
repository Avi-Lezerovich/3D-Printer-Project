export class AppError extends Error {
  status: number
  code?: string
  details?: unknown
  constructor(message: string, status = 500, code?: string, details?: unknown) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

export function badRequest(message = 'Bad Request', details?: unknown) {
  return new AppError(message, 400, 'BAD_REQUEST', details)
}
export function unauthorized(message = 'Unauthorized') {
  return new AppError(message, 401, 'UNAUTHORIZED')
}
export function forbidden(message = 'Forbidden') {
  return new AppError(message, 403, 'FORBIDDEN')
}
export function notFound(message = 'Not Found') {
  return new AppError(message, 404, 'NOT_FOUND')
}

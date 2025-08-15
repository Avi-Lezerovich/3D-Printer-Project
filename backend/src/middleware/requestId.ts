import { randomUUID } from 'crypto'

export function requestId() {
  return (req: any, res: any, next: any) => {
    const incoming = (req.headers['x-request-id'] as string | undefined)?.slice(0, 100)
    const id = incoming || randomUUID()
    req.requestId = id
    res.setHeader('X-Request-Id', id)
    next()
  }
}

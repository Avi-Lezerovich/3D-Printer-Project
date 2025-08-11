declare module 'csurf' {
  import { RequestHandler } from 'express'
  interface CookieOptions {
    key?: string
    httpOnly?: boolean
    sameSite?: boolean | 'lax' | 'strict' | 'none'
    secure?: boolean
    path?: string
  }
  interface Options {
    cookie?: boolean | CookieOptions
    sessionKey?: string
    value?: (req: any) => string
    ignoreMethods?: string[]
  }
  function csrf(options?: Options): RequestHandler
  export = csrf
}

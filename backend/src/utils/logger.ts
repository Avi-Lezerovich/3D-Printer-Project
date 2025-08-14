import pino from 'pino'
// pino-http has CJS export; import * as to get callable
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import pinoHttpImport from 'pino-http'
import { env, isDev } from '../config/index.js'
import crypto from 'node:crypto'

export const logger = pino({
  level: env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  transport: isDev ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } } : undefined,
})

const pinoHttp = (pinoHttpImport as any).default ?? pinoHttpImport
export const httpLogger = pinoHttp({
  logger,
  genReqId: function (req: any) {
    return (
      (req.headers['x-request-id'] as string | undefined)?.slice(0, 100) ||
      crypto.randomUUID()
    )
  },
  customSuccessMessage: function (_req: any, res: any) {
    return `${res.statusCode} OK`
  },
  customErrorMessage: function (_req: any, res: any, err: any) {
    return `${res.statusCode} ${err.name}`
  },
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
  redact: ['req.headers.authorization', 'req.headers.cookie']
})

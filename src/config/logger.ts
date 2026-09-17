import type { FastifyServerOptions } from 'fastify'
import { env } from '@/env'

export const loggerOptions: NonNullable<FastifyServerOptions['logger']> = {
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.passwordConfirmation',
      'req.body.currentPassword',
      'req.body.newPassword',
      'req.body.token',
    ],
    censor: '[REDACTED]',
  },
  ...(env.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
  }),
}

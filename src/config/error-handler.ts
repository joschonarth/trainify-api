import { STATUS_CODES } from 'node:http'
import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import {
  hasZodFastifySchemaValidationErrors,
  isResponseSerializationError,
} from 'fastify-type-provider-zod'
import z, { ZodError } from 'zod'
import { Prisma } from '../../generated/prisma'
import { AppError } from '../shared/errors/app.error'

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (
    error.code === 'FST_ERR_RESPONSE_SERIALIZATION' &&
    isResponseSerializationError(error)
  ) {
    request.log.error(
      { err: error, requestId: request.id, code: error.code },
      'Response serialization failed'
    )

    return reply.status(500).send({
      message: 'Internal server error.',
      requestId: request.id,
    })
  }

  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      message: 'Validation error.',
      issues: error.validation,
    })
  }

  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: 'Validation error.', issues: z.treeifyError(error) })
  }

  if (error.statusCode === 429) {
    return reply.status(429).send({
      message: 'Too many requests. Please try again later.',
    })
  }

  if (error instanceof AppError) {
    return reply
      .status(error.statusCode)
      .send({ message: error.message, ...error.details })
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return reply.status(409).send({ message: 'Resource already exists.' })
      case 'P2025':
        return reply.status(404).send({ message: 'Resource not found.' })
      case 'P2003':
        return reply.status(409).send({ message: 'Resource conflict.' })
      default:
        break
    }
  }

  if (
    Number.isInteger(error.statusCode) &&
    error.statusCode !== undefined &&
    error.statusCode >= 400 &&
    error.statusCode < 500
  ) {
    return reply.status(error.statusCode).send({
      message: STATUS_CODES[error.statusCode] ?? 'Client error.',
    })
  }

  request.log.error({ err: error, requestId: request.id }, 'Unhandled error')

  return reply.status(500).send({
    message: 'Internal server error.',
    requestId: request.id,
  })
}

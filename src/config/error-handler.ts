import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import z, { ZodError } from 'zod'
import { NotAllowedError } from '../shared/errors/not-allowed.error'
import { ResourceAlreadyExistsError } from '../shared/errors/resource-already-exists.error'
import { ResourceNotFoundError } from '../shared/errors/resource-not-found.error'

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
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

  if (error instanceof NotAllowedError) {
    return reply.status(403).send({ message: error.message })
  }

  if (error instanceof ResourceNotFoundError) {
    return reply.status(404).send({ message: error.message })
  }

  if (error instanceof ResourceAlreadyExistsError) {
    return reply.status(409).send({ message: error.message })
  }

  request.log.error({ err: error }, 'Unhandled error')

  return reply.status(500).send({
    message: 'Internal server error.',
    requestId: request.id,
  })
}

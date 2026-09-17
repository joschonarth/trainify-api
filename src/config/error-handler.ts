import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import z, { ZodError } from 'zod'

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

  request.log.error({ err: error }, 'Unhandled error')

  return reply.status(500).send({
    message: 'Internal server error.',
    requestId: request.id,
  })
}

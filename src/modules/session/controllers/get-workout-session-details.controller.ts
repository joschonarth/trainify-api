import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeGetWorkoutSessionDetailsUseCase } from '@/modules/session/use-cases/factories/make-get-workout-session-details-use-case'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

export async function getWorkoutSessionDetailsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const paramsSchema = z.object({
    sessionId: z.string(),
  })

  try {
    const { sessionId } = paramsSchema.parse(request.params)

    const getWorkoutSessionDetailsUseCase =
      makeGetWorkoutSessionDetailsUseCase()

    const { session } = await getWorkoutSessionDetailsUseCase.execute({
      sessionId,
    })

    return reply.status(200).send({ session })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}

import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceNotFoundError } from '@/errors/resource-not-found.error'
import { makeCompleteWorkoutSessionUseCase } from '@/use-cases/workout-sessions/factories/make-complete-workout-session-use-case'

export async function completeWorkoutSessionController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    sessionId: z.string(),
  })

  try {
    const { sessionId } = paramsSchema.parse(request.params)
    const userId = request.user.sub

    const completeWorkoutSessionUseCase = makeCompleteWorkoutSessionUseCase()

    const { session } = await completeWorkoutSessionUseCase.execute({
      userId,
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

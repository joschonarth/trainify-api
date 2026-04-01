import type { FastifyReply, FastifyRequest } from 'fastify'

import { makeCompleteWorkoutSessionUseCase } from '@/modules/session/use-cases/factories/make-complete-workout-session-use-case'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type {
  CompleteWorkoutSessionBody,
  CompleteWorkoutSessionParams,
} from '../schemas/complete-workout-session.schema'

export async function completeWorkoutSessionController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { sessionId } = request.params as CompleteWorkoutSessionParams
  const { exercises } = request.body as CompleteWorkoutSessionBody
  const userId = request.user.sub

  try {
    const completeWorkoutSessionUseCase = makeCompleteWorkoutSessionUseCase()

    const { session } = await completeWorkoutSessionUseCase.execute({
      userId,
      sessionId,
      exercises,
    })

    return reply.status(200).send({ session })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}

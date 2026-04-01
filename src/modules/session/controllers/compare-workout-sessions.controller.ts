import type { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type { CompareWorkoutSessionsParams } from '../schemas/compare-workout-sessions.schema'
import { makeCompareWorkoutSessionsUseCase } from '../use-cases/factories/make-compare-workout-sessions-use-case'

export async function compareWorkoutSessionsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { workoutId } = request.params as CompareWorkoutSessionsParams

  const userId = request.user.sub

  try {
    const compareWorkoutSessionsUseCase = makeCompareWorkoutSessionsUseCase()

    const result = await compareWorkoutSessionsUseCase.execute({
      userId,
      workoutId,
    })

    return reply.status(200).send({ result })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({
        message: error.message,
      })
    }

    throw error
  }
}

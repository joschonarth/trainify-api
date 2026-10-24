import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CompareWorkoutSessionsParams } from '../schemas/compare-workout-sessions.schema'
import { makeCompareWorkoutSessionsUseCase } from '../use-cases/factories/make-compare-workout-sessions-use-case'

export async function compareWorkoutSessionsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { workoutId } = request.params as CompareWorkoutSessionsParams

  const userId = request.user.sub

  const compareWorkoutSessionsUseCase = makeCompareWorkoutSessionsUseCase()

  const result = await compareWorkoutSessionsUseCase.execute({
    userId,
    workoutId,
  })

  return reply.status(200).send({ result })
}

import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { makeCompareWorkoutExercisesUseCase } from '../use-cases/factories/make-compare-workout-exercises-use-case'

export async function compareWorkoutExercisesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const compareWorkoutParamsSchema = z.object({
    workoutId: z.cuid(),
  })

  const { workoutId } = compareWorkoutParamsSchema.parse(request.params)
  const userId = request.user.sub

  try {
    const compareWorkoutExercisesUseCase = makeCompareWorkoutExercisesUseCase()

    const result = await compareWorkoutExercisesUseCase.execute({
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

import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { makeFetchWorkoutExercisesUseCase } from '../use-cases/factories/make-fetch-workout-exercises-use-case'

export async function fetchWorkoutExercisesController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const paramsSchema = z.object({
    workoutId: z.string(),
  })

  try {
    const { workoutId } = paramsSchema.parse(request.params)

    const fetchWorkoutExercisesUseCase = makeFetchWorkoutExercisesUseCase()
    const { exercises } = await fetchWorkoutExercisesUseCase.execute({
      workoutId,
    })

    return reply.status(200).send({ exercises })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }
    throw error
  }
}

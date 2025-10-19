import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceNotFoundError } from '@/errors/resource-not-found.error'

import { makeRemoveExerciseFromWorkoutUseCase } from '../use-cases/factories/make-remove-exercise-from-workout-use-case'

export async function removeExerciseFromWorkoutController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    workoutId: z.string(),
    exerciseId: z.string(),
  })

  try {
    const { workoutId, exerciseId } = paramsSchema.parse(request.params)

    const useCase = makeRemoveExerciseFromWorkoutUseCase()
    await useCase.execute({ workoutId, exerciseId })

    return reply.status(204).send()
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}

import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceNotFoundError } from '@/errors/resource-not-found.error'
import { makeRemoveExerciseFromWorkoutUseCase } from '@/use-cases/workouts/factories/make-remove-exercise-from-workout-use-case'

export async function removeExerciseFromWorkoutController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    workoutExerciseId: z.string(),
  })

  try {
    const { workoutExerciseId } = paramsSchema.parse(request.params)

    const useCase = makeRemoveExerciseFromWorkoutUseCase()
    await useCase.execute({ workoutExerciseId })

    return reply.status(204).send()
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}

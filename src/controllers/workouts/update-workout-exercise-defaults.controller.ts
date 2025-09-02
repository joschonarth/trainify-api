import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceNotFoundError } from '@/errors/resource-not-found.error'
import { makeUpdateWorkoutExerciseDefaultsUseCase } from '@/use-cases/workouts/factories/make-update-workout-exercise-defaults-use-case'

export async function updateWorkoutExerciseDefaultsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const bodySchema = z.object({
    defaultSets: z.number().nullable(),
    defaultReps: z.number().nullable(),
    defaultWeight: z.number().nullable(),
  })

  const paramsSchema = z.object({
    workoutExerciseId: z.string(),
  })

  try {
    const { defaultSets, defaultReps, defaultWeight } = bodySchema.parse(
      request.body,
    )
    const { workoutExerciseId } = paramsSchema.parse(request.params)

    const useCase = makeUpdateWorkoutExerciseDefaultsUseCase()
    const { workoutExercise } = await useCase.execute({
      workoutExerciseId,
      defaultSets,
      defaultReps,
      defaultWeight,
    })

    return reply.status(200).send({ workoutExercise })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}

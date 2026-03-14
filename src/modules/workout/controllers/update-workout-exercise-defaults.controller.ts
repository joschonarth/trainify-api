import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { makeUpdateWorkoutExerciseDefaultsUseCase } from '../use-cases/factories/make-update-workout-exercise-defaults-use-case'

export async function updateWorkoutExerciseDefaultsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const bodySchema = z.object({
    defaultSets: z.number().nullable(),
    defaultReps: z.number().nullable(),
    defaultWeight: z.number().nullable(),
  })

  const paramsSchema = z.object({
    workoutId: z.string(),
    exerciseId: z.string(),
  })

  try {
    const { defaultSets, defaultReps, defaultWeight } = bodySchema.parse(
      request.body
    )
    const { workoutId, exerciseId } = paramsSchema.parse(request.params)

    const updateWorkoutExerciseDefaultsUseCase =
      makeUpdateWorkoutExerciseDefaultsUseCase()
    const { workoutExercise } =
      await updateWorkoutExerciseDefaultsUseCase.execute({
        workoutId,
        exerciseId,
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

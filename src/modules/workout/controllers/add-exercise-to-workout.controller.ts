import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { makeAddExerciseToWorkoutUseCase } from '../use-cases/factories/make-add-exercise-to-workout-use-case'

export async function addExerciseToWorkoutController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const bodySchema = z.object({
    exerciseId: z.string(),
    defaultSets: z.number().nullable(),
    defaultReps: z.number().nullable(),
    defaultWeight: z.number().nullable(),
  })

  const paramsSchema = z.object({
    workoutId: z.string(),
  })

  try {
    const { exerciseId, defaultSets, defaultReps, defaultWeight } =
      bodySchema.parse(request.body)
    const { workoutId } = paramsSchema.parse(request.params)

    const addExerciseToWorkoutUseCase = makeAddExerciseToWorkoutUseCase()
    const { workoutExercise } = await addExerciseToWorkoutUseCase.execute({
      workoutId,
      exerciseId,
      defaultSets,
      defaultReps,
      defaultWeight,
    })

    return reply.status(201).send({ workoutExercise })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}

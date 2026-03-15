import type { FastifyReply, FastifyRequest } from 'fastify'
import { ExerciseCategory, ExerciseType } from 'generated/prisma'
import { z } from 'zod'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { makeCreateOrAttachExerciseToWorkoutUseCase } from '../use-cases/factories/make-create-or-attach-exercise-to-workout-use-case'

export async function createOrAttachExerciseToWorkoutController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const paramsSchema = z.object({
    workoutId: z.string(),
  })

  const bodySchema = z.object({
    name: z.string(),
    category: z.enum(ExerciseCategory).nullable(),
    type: z.enum(ExerciseType).nullable(),
    sets: z.number().nullable(),
    reps: z.number().nullable(),
    weight: z.number().nullable(),
  })

  try {
    const { workoutId } = paramsSchema.parse(request.params)
    const { name, category, type, sets, reps, weight } = bodySchema.parse(
      request.body
    )

    const userId = request.user.sub

    const createOrAttachExerciseToWorkoutUseCase =
      makeCreateOrAttachExerciseToWorkoutUseCase()

    const { exercise, workoutExercise } =
      await createOrAttachExerciseToWorkoutUseCase.execute({
        userId,
        workoutId,
        name,
        category,
        type,
        sets,
        reps,
        weight,
      })

    return reply.status(201).send({
      exercise,
      workoutExercise,
    })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}

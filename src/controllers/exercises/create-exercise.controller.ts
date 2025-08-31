import { ExerciseCategory, ExerciseType } from '@prisma/client'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceAlreadyExistsError } from '@/errors/resource-already-exists.error'
import { makeCreateExerciseUseCase } from '@/use-cases/exercises/factories/make-create-exercise-use-case'

export async function createExerciseController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const createExerciseBodySchema = z.object({
    name: z.string(),
    category: z.enum(ExerciseCategory).nullable(),
    type: z.enum(ExerciseType).nullable(),
    sets: z.number().nullable(),
    reps: z.number().nullable(),
    weight: z.number().nullable(),
  })

  try {
    const { name, category, type, sets, reps, weight } =
      createExerciseBodySchema.parse(request.body)

    const userId = request.user.sub

    const createExerciseUseCase = makeCreateExerciseUseCase()

    const { exercise, myExercise } = await createExerciseUseCase.execute({
      userId,
      name,
      category,
      type,
      sets,
      reps,
      weight,
    })

    return reply.status(201).send({ exercise, myExercise })
  } catch (error) {
    if (error instanceof ResourceAlreadyExistsError) {
      return reply.status(409).send({ message: error.message })
    }
  }
}

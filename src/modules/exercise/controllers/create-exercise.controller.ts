import { ExerciseCategory, ExerciseType } from '@prisma/client'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceAlreadyExistsError } from '@/shared/errors/resource-already-exists.error'

import { makeCreateExerciseUseCase } from '../use-cases/factories/make-create-exercise-use-case'

export async function createExerciseController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const createExerciseBodySchema = z.object({
    name: z.string(),
    category: z.enum(ExerciseCategory).nullable(),
    type: z.enum(ExerciseType).nullable(),
  })

  try {
    const { name, category, type } = createExerciseBodySchema.parse(
      request.body,
    )

    const userId = request.user.sub

    const createExerciseUseCase = makeCreateExerciseUseCase()

    const { exercise } = await createExerciseUseCase.execute({
      userId,
      name,
      category,
      type,
    })

    return reply.status(201).send({ exercise })
  } catch (error) {
    if (error instanceof ResourceAlreadyExistsError) {
      return reply.status(409).send({ message: error.message })
    }
  }
}

import { ExerciseCategory, ExerciseType } from '@prisma/client'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { NotAllowedError } from '@/shared/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { makeUpdateExerciseUseCase } from '../use-cases/factories/make-update-exercise-use-case'

export async function updateExerciseController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    exerciseId: z.string(),
  })

  const bodySchema = z.object({
    name: z.string().optional(),
    category: z.enum(ExerciseCategory).optional(),
    type: z.enum(ExerciseType).optional(),
    sets: z.number().optional(),
    reps: z.number().optional(),
    weight: z.number().optional(),
  })

  try {
    const { exerciseId } = paramsSchema.parse(request.params)
    const data = bodySchema.parse(request.body)

    const updateExerciseUseCase = makeUpdateExerciseUseCase()

    const { exercise } = await updateExerciseUseCase.execute({
      userId: request.user.sub,
      exerciseId,
      ...data,
    })

    return reply.status(200).send({ exercise })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    if (error instanceof NotAllowedError) {
      return reply.status(403).send({ message: error.message })
    }
  }
}

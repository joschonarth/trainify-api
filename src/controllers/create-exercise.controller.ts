import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeCreateExerciseUseCase } from '@/use-cases/factories/make-create-exercise-use-case'

export async function createExerciseController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const createExerciseBodySchema = z.object({
    name: z.string(),
    category: z.string().nullable(),
    type: z.string().nullable(),
    sets: z.number().nullable(),
    reps: z.number().nullable(),
    weight: z.number().nullable(),
  })

  const { name, category, type, sets, reps, weight } =
    createExerciseBodySchema.parse(request.body)

  const userId = request.user.sub

  const createExerciseUseCase = makeCreateExerciseUseCase()

  const { exercise } = await createExerciseUseCase.execute({
    userId,
    name,
    category,
    type,
    sets,
    reps,
    weight,
  })

  return reply.status(201).send({ exercise })
}

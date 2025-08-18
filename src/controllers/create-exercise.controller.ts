import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeCreateExerciseUseCase } from '@/use-cases/factories/make-create-exercise-use-case'

export async function createExercise(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const createExerciseBodySchema = z.object({
    name: z.string(),
    category: z.string().optional(),
    type: z.string().optional(),
    sets: z.number().optional(),
    reps: z.number().optional(),
    weight: z.number().optional(),
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

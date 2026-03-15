import type { FastifyReply, FastifyRequest } from 'fastify'
import { ExerciseCategory, ExerciseType } from 'generated/prisma'
import z from 'zod'

import { makeFetchUserExercisesUseCase } from '../use-cases/factories/make-fetch-user-exercises-use-case'

export async function fetchUserExercisesController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const fetchUserExercisesSchema = z.object({
    query: z.string().optional().default(''),
    category: z.enum(ExerciseCategory).optional().default(undefined),
    type: z.enum(ExerciseType).optional().default(undefined),
  })

  const { query, category, type } = fetchUserExercisesSchema.parse(
    request.query
  )

  const userId = request.user.sub

  const fetchUserExercisesUseCase = makeFetchUserExercisesUseCase()
  const { exercises } = await fetchUserExercisesUseCase.execute({
    userId,
    query,
    category,
    type,
  })

  return reply.status(200).send({ exercises })
}

import { ExerciseCategory, ExerciseType } from '@prisma/client'
import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'

import { makeFetchUserExercisesUseCase } from '../use-cases/factories/make-fetch-user-exercises-use-case'

export async function fetchUserExercisesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const fetchUserExercisesSchema = z.object({
    category: z.enum(ExerciseCategory).optional().default(undefined),
    type: z.enum(ExerciseType).optional().default(undefined),
  })

  const { category, type } = fetchUserExercisesSchema.parse(request.query)

  const userId = request.user.sub

  const fetchUserExercisesUseCase = makeFetchUserExercisesUseCase()
  const { exercises } = await fetchUserExercisesUseCase.execute({
    userId,
    category,
    type,
  })

  return reply.status(200).send({ exercises })
}

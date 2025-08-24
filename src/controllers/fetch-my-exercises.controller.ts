import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'

import { makeFetchMyExercisesUseCase } from '@/use-cases/factories/make-fetch-my-exercises-use-case'

export async function fetchMyExercisesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const fetchMyExercisesSchema = z.object({
    query: z.string().optional().default(''),
    category: z.string().optional().default(''),
    page: z.coerce.number().min(1).default(1),
  })

  const { query, category, page } = fetchMyExercisesSchema.parse(request.query)

  const userId = request.user.sub

  const fetchMyExercisesUseCase = makeFetchMyExercisesUseCase()

  const { myExercises } = await fetchMyExercisesUseCase.execute({
    userId,
    query,
    category,
    page,
  })

  return reply.status(200).send({ myExercises })
}

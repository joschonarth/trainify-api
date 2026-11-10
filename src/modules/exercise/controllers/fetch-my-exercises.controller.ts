import type { FastifyReply, FastifyRequest } from 'fastify'
import type { FetchMyExercisesQuery } from '../schemas/fetch-my-exercises.schema'
import { makeFetchMyExercisesUseCase } from '../use-cases/factories/make-fetch-my-exercises-use-case'

export async function fetchMyExercisesController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { query, category, page, pageSize } =
    request.query as FetchMyExercisesQuery

  const userId = request.user.sub

  const fetchMyExercisesUseCase = makeFetchMyExercisesUseCase()

  const result = await fetchMyExercisesUseCase.execute({
    userId,
    query,
    category: category ?? null,
    page,
    pageSize,
  })

  return reply.status(200).send(result)
}

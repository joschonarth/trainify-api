import type { FastifyReply, FastifyRequest } from 'fastify'
import type { FetchExercisesCatalogQuery } from '../schemas/fetch-exercises-catalog.schema'
import { makeFetchExercisesCatalogUseCase } from '../use-cases/factories/make-fetch-exercises-catalog-use-case'

export async function fetchExercisesCatalogController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { query, category, page } = request.query as FetchExercisesCatalogQuery

  const fetchExercisesCatalogUseCase = makeFetchExercisesCatalogUseCase()

  const { exercises } = await fetchExercisesCatalogUseCase.execute({
    query,
    category: category ?? null,
    page,
  })

  return reply.status(200).send({ exercises })
}

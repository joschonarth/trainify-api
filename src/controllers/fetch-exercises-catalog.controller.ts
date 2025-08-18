import { FastifyReply, FastifyRequest } from 'fastify'

import { makeFetchExercisesCatalogUseCase } from '@/use-cases/factories/make-fetch-exercises-catalog-use-case'

export async function fetchExercisesCatalog(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const fetchExercisesCatalogUseCase = makeFetchExercisesCatalogUseCase()

  const { exercises } = await fetchExercisesCatalogUseCase.execute()

  return reply.status(200).send({ exercises })
}

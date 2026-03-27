import type { FastifyReply, FastifyRequest } from 'fastify'
import type { FetchUserExercisesQuery } from '../schemas/fetch-user-exercises.schema'
import { makeFetchUserExercisesUseCase } from '../use-cases/factories/make-fetch-user-exercises-use-case'

export async function fetchUserExercisesController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { query, category, type } = request.query as FetchUserExercisesQuery

  const userId = request.user.sub

  const fetchUserExercisesUseCase = makeFetchUserExercisesUseCase()
  const { exercises } = await fetchUserExercisesUseCase.execute({
    userId,
    query,
    category: category ?? null,
    type: type ?? null,
  })

  return reply.status(200).send({ exercises })
}

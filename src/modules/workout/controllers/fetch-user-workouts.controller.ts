import type { FastifyReply, FastifyRequest } from 'fastify'
import type { FetchUserWorkoutsQuery } from '../schemas/fetch-user-workouts.schema'
import { makeFetchUserWorkoutsUseCase } from '../use-cases/factories/make-fetch-user-workouts-use-case'

export async function fetchUserWorkoutsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user.sub
  const { page, pageSize, search } = request.query as FetchUserWorkoutsQuery
  const fetchUserWorkoutsUseCase = makeFetchUserWorkoutsUseCase()
  const { workouts, pagination } = await fetchUserWorkoutsUseCase.execute({
    userId,
    page,
    pageSize,
    ...(search !== undefined && { search }),
  })

  return reply.status(200).send({ workouts, pagination })
}

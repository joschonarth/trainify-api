import { FastifyReply, FastifyRequest } from 'fastify'

import { makeFetchUserWorkoutsUseCase } from '../use-cases/factories/make-fetch-user-workouts-use-case'

export async function fetchUserWorkoutsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userId = request.user.sub
  const fetchUserWorkoutsUseCase = makeFetchUserWorkoutsUseCase()
  const { workouts } = await fetchUserWorkoutsUseCase.execute({ userId })

  return reply.status(200).send({ workouts })
}

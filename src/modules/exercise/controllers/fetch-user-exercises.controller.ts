import { FastifyReply, FastifyRequest } from 'fastify'

import { makeFetchUserExercisesUseCase } from '../use-cases/factories/make-fetch-user-exercises-use-case'

export async function fetchUserExercisesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userId = request.user.sub

  const fetchUserExercisesUseCase = makeFetchUserExercisesUseCase()
  const { exercises } = await fetchUserExercisesUseCase.execute({ userId })

  return reply.status(200).send({ exercises })
}

import { FastifyReply, FastifyRequest } from 'fastify'

import { makeFetchMyExercisesUseCase } from '@/use-cases/factories/make-fetch-my-exercises-use-case'

export async function fetchMyExercisesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const fetchMyExercisesUseCase = makeFetchMyExercisesUseCase()
  const { myExercises } = await fetchMyExercisesUseCase.execute(
    request.user.sub,
  )

  return reply.status(200).send({ myExercises })
}

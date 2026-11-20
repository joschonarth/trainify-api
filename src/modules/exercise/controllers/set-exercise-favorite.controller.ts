import type { FastifyReply, FastifyRequest } from 'fastify'
import { makeSetExerciseFavoriteUseCase } from '../use-cases/factories/make-set-exercise-favorite-use-case'
export async function setExerciseFavoriteController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { exerciseId } = request.params as { exerciseId: string }
  const { isFavorite } = request.body as { isFavorite: boolean }
  const result = await makeSetExerciseFavoriteUseCase().execute({
    userId: request.user.sub,
    exerciseId,
    isFavorite,
  })
  return reply.status(200).send(result)
}

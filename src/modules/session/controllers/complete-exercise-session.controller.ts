import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CompleteExerciseSessionParams } from '../schemas/complete-exercise-session.schema'
import { makeCompleteExerciseSessionUseCase } from '../use-cases/factories/make-complete-exercise-session-use-case'

export async function completeExerciseSessionController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { exerciseSessionId } = request.params as CompleteExerciseSessionParams

  const completeExerciseSession = makeCompleteExerciseSessionUseCase()

  const { exerciseSession } = await completeExerciseSession.execute({
    exerciseSessionId,
  })

  return reply.status(200).send({ exerciseSession })
}

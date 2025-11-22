import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeCompleteExerciseSessionUseCase } from '../use-cases/factories/make-complete-exercise-session-use-case'

export async function completeExerciseSessionController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    exerciseSessionId: z.cuid(),
  })

  const { exerciseSessionId } = paramsSchema.parse(request.params)

  const completeExerciseSession = makeCompleteExerciseSessionUseCase()

  const { exerciseSession } = await completeExerciseSession.execute({
    exerciseSessionId,
  })

  return reply.status(200).send({ exerciseSession })
}

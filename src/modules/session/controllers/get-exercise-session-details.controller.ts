import type { FastifyReply, FastifyRequest } from 'fastify'

import { makeGetExerciseSessionDetailsUseCase } from '@/modules/session/use-cases/factories/make-get-exercise-session-details-use-case'
import type { GetExerciseSessionDetailsParams } from '../schemas/get-exercise-session-details.schema'

export async function getExerciseSessionDetailsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { exerciseSessionId } =
    request.params as GetExerciseSessionDetailsParams
  const userId = request.user.sub

  const getExerciseSessionDetailsUseCase =
    makeGetExerciseSessionDetailsUseCase()

  const { session } = await getExerciseSessionDetailsUseCase.execute({
    userId,
    exerciseSessionId,
  })

  return reply.status(200).send({ session })
}

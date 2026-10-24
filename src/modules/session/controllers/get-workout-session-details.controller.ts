import type { FastifyReply, FastifyRequest } from 'fastify'

import { makeGetWorkoutSessionDetailsUseCase } from '@/modules/session/use-cases/factories/make-get-workout-session-details-use-case'
import type { GetWorkoutSessionDetailsParams } from '../schemas/get-workout-session-details.schema'

export async function getWorkoutSessionDetailsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { sessionId } = request.params as GetWorkoutSessionDetailsParams
  const userId = request.user.sub

  const getWorkoutSessionDetailsUseCase = makeGetWorkoutSessionDetailsUseCase()

  const { session } = await getWorkoutSessionDetailsUseCase.execute({
    userId,
    sessionId,
  })

  return reply.status(200).send({ session })
}

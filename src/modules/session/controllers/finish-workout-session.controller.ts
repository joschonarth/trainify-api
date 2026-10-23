import type { FastifyReply, FastifyRequest } from 'fastify'
import type { FinishWorkoutSessionParams } from '../schemas/finish-workout-session.schema'
import { makeFinishWorkoutSessionUseCase } from '../use-cases/factories/make-finish-workout-session-use-case'

export async function finishWorkoutSessionController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { sessionId } = request.params as FinishWorkoutSessionParams
  const userId = request.user.sub

  const finishWorkoutSessionUseCase = makeFinishWorkoutSessionUseCase()

  const { session } = await finishWorkoutSessionUseCase.execute({
    sessionId,
    userId,
  })

  return reply.status(200).send({ session })
}

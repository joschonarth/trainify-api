import type { FastifyReply, FastifyRequest } from 'fastify'
import type { StartWorkoutSessionParams } from '../schemas/start-workout-session.schema'
import { makeStartWorkoutSessionUseCase } from '../use-cases/factories/make-start-workout-session-use-case'

export async function startWorkoutSessionController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { sessionId } = request.params as StartWorkoutSessionParams
  const userId = request.user.sub

  const startWorkoutSessionUseCase = makeStartWorkoutSessionUseCase()

  const { session } = await startWorkoutSessionUseCase.execute({
    sessionId,
    userId,
  })

  return reply.status(200).send({ session })
}

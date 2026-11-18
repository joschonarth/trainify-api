import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetWorkoutSessionsHistoryQuery } from '@/modules/session/schemas/get-workout-sessions-history.schema'
import { makeGetWorkoutSessionsHistoryUseCase } from '@/modules/session/use-cases/factories/make-get-workout-sessions-history-use-case'

export async function getWorkoutSessionsHistoryController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user.sub
  const { page, pageSize, from, to, status, workoutId } =
    request.query as GetWorkoutSessionsHistoryQuery

  const getWorkoutSessionsHistoryUseCase =
    makeGetWorkoutSessionsHistoryUseCase()

  const result = await getWorkoutSessionsHistoryUseCase.execute({
    userId,
    page,
    pageSize,
    ...(from && { from }),
    ...(to && { to }),
    ...(status && { status }),
    ...(workoutId && { workoutId }),
  })

  return reply.status(200).send(result)
}

import type { FastifyReply, FastifyRequest } from 'fastify'

import { makeFetchExerciseLogsUseCase } from '../use-cases/factories/make-fetch-exercise-logs-use-case'

export async function fetchExerciseLogsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user.sub

  const fetchExerciseLogsUseCase = makeFetchExerciseLogsUseCase()
  const { logs } = await fetchExerciseLogsUseCase.execute(userId)

  return reply.status(200).send({ logs })
}

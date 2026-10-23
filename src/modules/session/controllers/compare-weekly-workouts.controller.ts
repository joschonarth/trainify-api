import type { FastifyReply, FastifyRequest } from 'fastify'

import { makeCompareWeeklyWorkoutsUseCase } from '../use-cases/factories/make-compare-weekly-workouts-use-case'

export async function compareWeeklyWorkoutsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user.sub

  const compareWeeklyUseCase = makeCompareWeeklyWorkoutsUseCase()
  const result = await compareWeeklyUseCase.execute({ userId })

  return reply.status(200).send({ result })
}

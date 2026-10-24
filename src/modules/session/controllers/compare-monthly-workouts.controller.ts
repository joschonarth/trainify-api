import type { FastifyReply, FastifyRequest } from 'fastify'

import { makeCompareMonthlyWorkoutsUseCase } from '../use-cases/factories/make-compare-monthly-workouts-use-case'

export async function compareMonthlyWorkoutsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user.sub

  const compareMonthlyUseCase = makeCompareMonthlyWorkoutsUseCase()
  const result = await compareMonthlyUseCase.execute({ userId })

  return reply.status(200).send({ result })
}

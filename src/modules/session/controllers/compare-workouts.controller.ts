import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CompareWorkoutsQuery } from '../schemas/compare-workouts.schema'
import { makeCompareWorkoutsUseCase } from '../use-cases/factories/make-compare-workouts-use-case'

export async function compareWorkoutsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { period } = request.query as CompareWorkoutsQuery
  const userId = request.user.sub

  const compareWorkoutsUseCase = makeCompareWorkoutsUseCase()

  const result = await compareWorkoutsUseCase.execute({
    userId,
    period,
  })

  return reply.status(200).send({ result })
}

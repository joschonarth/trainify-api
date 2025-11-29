import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { makeGetExerciseSessionProgressUseCase } from '../use-cases/factories/make-get-exercise-session-progress-use-case'

export async function getExerciseSessionProgressController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    exerciseId: z.cuid(),
  })

  const querySchema = z.object({
    period: z.enum(['WEEK', 'MONTH', 'ALL']).optional().default('ALL'),
  })

  try {
    const { exerciseId } = paramsSchema.parse(request.params)
    const { period } = querySchema.parse(request.query)

    const userId = request.user.sub

    const getExerciseSessionProgressUseCase =
      makeGetExerciseSessionProgressUseCase()

    const result = await getExerciseSessionProgressUseCase.execute({
      userId,
      exerciseId,
      period,
    })

    return reply.status(200).send(result)
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}

import type { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type {
  GetExerciseSessionProgressParams,
  GetExerciseSessionProgressQuery,
} from '../schemas/get-exercise-session-progress.schema'
import { makeGetExerciseSessionProgressUseCase } from '../use-cases/factories/make-get-exercise-session-progress-use-case'

export async function getExerciseSessionProgressController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { exerciseId } = request.params as GetExerciseSessionProgressParams
  const { period } = request.query as GetExerciseSessionProgressQuery

  const userId = request.user.sub

  try {
    const getExerciseSessionProgressUseCase =
      makeGetExerciseSessionProgressUseCase()

    const result = await getExerciseSessionProgressUseCase.execute({
      userId,
      exerciseId,
      period,
    })

    return reply.status(200).send({ result })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}

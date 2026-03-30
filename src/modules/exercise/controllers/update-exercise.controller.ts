import type { FastifyReply, FastifyRequest } from 'fastify'

import { NotAllowedError } from '@/shared/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type {
  UpdateExerciseBody,
  UpdateExerciseParams,
} from '../schemas/update-exercise.schema'
import { makeUpdateExerciseUseCase } from '../use-cases/factories/make-update-exercise-use-case'

export async function updateExerciseController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { exerciseId } = request.params as UpdateExerciseParams
  const data = request.body as UpdateExerciseBody

  try {
    const updateExerciseUseCase = makeUpdateExerciseUseCase()

    const { exercise } = await updateExerciseUseCase.execute({
      userId: request.user.sub,
      exerciseId,
      ...data,
    })

    return reply.status(200).send({ exercise })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    if (error instanceof NotAllowedError) {
      return reply.status(403).send({ message: error.message })
    }

    throw error
  }
}

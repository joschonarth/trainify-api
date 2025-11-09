import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { makeGetExerciseProgressUseCase } from '../use-cases/factories/make-get-exercise-progress-use-case'

export async function fetchExerciseProgressController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    exerciseId: z.cuid(),
  })

  try {
    const { exerciseId } = paramsSchema.parse(request.params)

    const userId = request.user.sub

    const getExerciseProgressUseCase = makeGetExerciseProgressUseCase()

    const result = await getExerciseProgressUseCase.execute({
      userId,
      exerciseId,
    })

    return reply.status(200).send(result)
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}

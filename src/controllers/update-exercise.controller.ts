import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { NotAllowedError } from '@/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/errors/resource-not-found.error'
import { makeUpdateExerciseUseCase } from '@/use-cases/factories/make-update-exercise-use-case'

export async function updateExerciseController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    id: z.string(),
  })

  const bodySchema = z.object({
    name: z.string().optional(),
    category: z.string().nullable().optional(),
    type: z.string().nullable().optional(),
    sets: z.number().nullable().optional(),
    reps: z.number().nullable().optional(),
    weight: z.number().nullable().optional(),
  })

  try {
    const { id } = paramsSchema.parse(request.params)
    const data = bodySchema.parse(request.body)

    const updateExerciseUseCase = makeUpdateExerciseUseCase()

    const { exercise } = await updateExerciseUseCase.execute({
      userId: request.user.sub,
      exerciseId: id,
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
  }
}

import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeCreateWorkoutUseCase } from '../use-cases/factories/make-create-workout-use-case'

export async function createWorkoutController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const createWorkoutBodySchema = z.object({
    name: z.string(),
    description: z.string().nullable(),
  })

  const { name, description } = createWorkoutBodySchema.parse(request.body)

  const userId = request.user.sub

  const createWorkoutUseCase = makeCreateWorkoutUseCase()

  const { workout } = await createWorkoutUseCase.execute({
    userId,
    name,
    description,
  })

  return reply.status(201).send({ workout })
}

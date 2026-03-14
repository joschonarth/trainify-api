import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { makeUpdateWorkoutUseCase } from '../use-cases/factories/make-update-workout-use-case'

export async function updateWorkoutController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const paramsSchema = z.object({
    workoutId: z.string(),
  })

  const bodySchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
  })

  try {
    const { workoutId } = paramsSchema.parse(request.params)
    const { name, description } = bodySchema.parse(request.body)

    const updateWorkoutUseCase = makeUpdateWorkoutUseCase()

    const updateData: Partial<{
      name: string
      description: string | null
    }> = {}
    if (name !== undefined) {
      updateData.name = name
    }
    if (description !== undefined) {
      updateData.description = description
    }

    const { workout } = await updateWorkoutUseCase.execute({
      workoutId,
      ...updateData,
    })

    return reply.status(200).send({ workout })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    return reply.status(500).send({ message: 'Internal server error.' })
  }
}

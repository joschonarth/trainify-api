import type { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type {
  UpdateWorkoutBody,
  UpdateWorkoutParams,
} from '../schemas/update-workout.schema'
import { makeUpdateWorkoutUseCase } from '../use-cases/factories/make-update-workout-use-case'

export async function updateWorkoutController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { workoutId } = request.params as UpdateWorkoutParams
  const { name, description } = request.body as UpdateWorkoutBody

  try {
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

    throw error
  }
}

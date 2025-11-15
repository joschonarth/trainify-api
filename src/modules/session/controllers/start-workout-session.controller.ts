import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { WorkoutSessionAlreadyCompletedError } from '../errors/workout-session-already-completed.error'
import { WorkoutSessionAlreadyInProgressError } from '../errors/workout-session-already-in-progress.error'
import { makeStartWorkoutSessionUseCase } from '../use-cases/factories/make-start-workout-session-use-case'

export async function startWorkoutSessionController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    sessionId: z.cuid(),
  })

  try {
    const { sessionId } = paramsSchema.parse(request.params)
    const userId = request.user.sub

    const startWorkoutSessionUseCase = makeStartWorkoutSessionUseCase()

    const { session } = await startWorkoutSessionUseCase.execute({
      sessionId,
      userId,
    })

    return reply.status(200).send({ session })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    if (error instanceof WorkoutSessionAlreadyInProgressError) {
      return reply.status(409).send({ message: error.message })
    }

    if (error instanceof WorkoutSessionAlreadyCompletedError) {
      return reply.status(409).send({ message: error.message })
    }

    throw error
  }
}

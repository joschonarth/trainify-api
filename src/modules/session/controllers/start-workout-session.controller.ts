import type { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { WorkoutSessionAlreadyCompletedError } from '../errors/workout-session-already-completed.error'
import { WorkoutSessionAlreadyInProgressError } from '../errors/workout-session-already-in-progress.error'
import type { StartWorkoutSessionParams } from '../schemas/start-workout-session.schema'
import { makeStartWorkoutSessionUseCase } from '../use-cases/factories/make-start-workout-session-use-case'

export async function startWorkoutSessionController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { sessionId } = request.params as StartWorkoutSessionParams
  const userId = request.user.sub

  try {
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

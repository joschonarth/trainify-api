import type { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { WorkoutSessionAlreadyCompletedError } from '../errors/workout-session-already-completed.error'
import { WorkoutSessionNotStartedError } from '../errors/workout-session-not-started.error'
import type { FinishWorkoutSessionParams } from '../schemas/finish-workout-session.schema'
import { makeFinishWorkoutSessionUseCase } from '../use-cases/factories/make-finish-workout-session-use-case'

export async function finishWorkoutSessionController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { sessionId } = request.params as FinishWorkoutSessionParams
  const userId = request.user.sub

  try {
    const finishWorkoutSessionUseCase = makeFinishWorkoutSessionUseCase()

    const { session } = await finishWorkoutSessionUseCase.execute({
      sessionId,
      userId,
    })

    return reply.status(200).send({ session })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    if (error instanceof WorkoutSessionNotStartedError) {
      return reply.status(400).send({ message: error.message })
    }

    if (error instanceof WorkoutSessionAlreadyCompletedError) {
      return reply.status(409).send({ message: error.message })
    }

    throw error
  }
}

import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { WorkoutSessionAlreadyCompletedError } from '../errors/workout-session-already-completed.error'
import { WorkoutSessionNotStartedError } from '../errors/workout-session-not-started.error'
import { makeFinishWorkoutSessionUseCase } from '../use-cases/factories/make-finish-workout-session-use-case'

export async function finishWorkoutSessionController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    sessionId: z.cuid(),
  })

  try {
    const { sessionId } = paramsSchema.parse(request.params)
    const userId = request.user.sub

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

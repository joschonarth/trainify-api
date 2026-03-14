import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { ExerciseTimerNotStartedError } from '../errors/exercise-timer-not-started.error'
import { makeStopExerciseTimerUseCase } from '../use-cases/factories/make-stop-exercise-timer-use-case'

export async function stopExerciseTimerController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const paramsSchema = z.object({
    exerciseSessionId: z.cuid(),
  })

  try {
    const { exerciseSessionId } = paramsSchema.parse(request.params)
    const userId = request.user.sub

    const stopExerciseTimerUseCase = makeStopExerciseTimerUseCase()

    const { exerciseSession, elapsed } = await stopExerciseTimerUseCase.execute(
      {
        userId,
        exerciseSessionId,
      }
    )

    return reply.status(200).send({ exerciseSession, elapsed })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    if (error instanceof ExerciseTimerNotStartedError) {
      return reply.status(400).send({ message: error.message })
    }

    throw error
  }
}

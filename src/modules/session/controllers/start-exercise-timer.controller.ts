import type { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { AnotherExerciseTimerRunningError } from '../errors/another-exercise-timer-running.error'
import { ExerciseTimerAlreadyRunningError } from '../errors/exercise-timer-already-running.error'
import type { StartExerciseTimerParams } from '../schemas/start-exercise-timer.schema'
import { makeStartExerciseTimerUseCase } from '../use-cases/factories/make-start-exercise-timer-use-case'

export async function startExerciseTimerController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { exerciseSessionId } = request.params as StartExerciseTimerParams
  const userId = request.user.sub

  try {
    const startExerciseTimerUseCase = makeStartExerciseTimerUseCase()

    const { exerciseSession } = await startExerciseTimerUseCase.execute({
      userId,
      exerciseSessionId,
    })

    return reply.status(200).send({ exerciseSession })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    if (error instanceof ExerciseTimerAlreadyRunningError) {
      return reply.status(409).send({ message: error.message })
    }

    if (error instanceof AnotherExerciseTimerRunningError) {
      return reply.status(409).send({ message: error.message })
    }

    throw error
  }
}

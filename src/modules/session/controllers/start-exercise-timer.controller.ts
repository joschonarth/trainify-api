import type { FastifyReply, FastifyRequest } from 'fastify'
import type { StartExerciseTimerParams } from '../schemas/start-exercise-timer.schema'
import { makeStartExerciseTimerUseCase } from '../use-cases/factories/make-start-exercise-timer-use-case'

export async function startExerciseTimerController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { exerciseSessionId } = request.params as StartExerciseTimerParams
  const userId = request.user.sub

  const startExerciseTimerUseCase = makeStartExerciseTimerUseCase()

  const { exerciseSession } = await startExerciseTimerUseCase.execute({
    userId,
    exerciseSessionId,
  })

  return reply.status(200).send({ exerciseSession })
}

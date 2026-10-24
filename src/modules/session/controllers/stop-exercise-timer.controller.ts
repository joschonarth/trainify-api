import type { FastifyReply, FastifyRequest } from 'fastify'
import type { StopExerciseTimerParams } from '../schemas/stop-exercise-timer.schema'
import { makeStopExerciseTimerUseCase } from '../use-cases/factories/make-stop-exercise-timer-use-case'

export async function stopExerciseTimerController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { exerciseSessionId } = request.params as StopExerciseTimerParams
  const userId = request.user.sub

  const stopExerciseTimerUseCase = makeStopExerciseTimerUseCase()

  const { exerciseSession, elapsed } = await stopExerciseTimerUseCase.execute({
    userId,
    exerciseSessionId,
  })

  return reply.status(200).send({ exerciseSession, elapsed })
}

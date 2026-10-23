import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetExerciseProgressParams } from '../schemas/get-exercise-progress.schema'
import { makeGetExerciseProgressUseCase } from '../use-cases/factories/make-get-exercise-progress-use-case'

export async function getExerciseProgressController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user.sub

  const { exerciseId } = request.params as GetExerciseProgressParams

  const getExerciseProgressUseCase = makeGetExerciseProgressUseCase()

  const result = await getExerciseProgressUseCase.execute({
    userId,
    exerciseId,
  })

  return reply.status(200).send(result)
}

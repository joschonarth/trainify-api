import type { FastifyReply, FastifyRequest } from 'fastify'
import type {
  UpdateExerciseBody,
  UpdateExerciseParams,
} from '../schemas/update-exercise.schema'
import { makeUpdateExerciseUseCase } from '../use-cases/factories/make-update-exercise-use-case'

export async function updateExerciseController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { exerciseId } = request.params as UpdateExerciseParams
  const data = request.body as UpdateExerciseBody

  const updateExerciseUseCase = makeUpdateExerciseUseCase()

  const { exercise } = await updateExerciseUseCase.execute({
    userId: request.user.sub,
    exerciseId,
    ...data,
  })

  return reply.status(200).send({ exercise })
}

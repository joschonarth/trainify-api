import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetExerciseDetailsParams } from '../schemas/get-exercise-details.schema'
import { makeGetExerciseDetailsUseCase } from '../use-cases/factories/make-get-exercise-details-use-case'

export async function getExerciseDetailsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as GetExerciseDetailsParams

  const getExerciseDetailsUseCase = makeGetExerciseDetailsUseCase()

  const { exercise } = await getExerciseDetailsUseCase.execute({
    exerciseId: id,
    userId: request.user.sub,
  })

  return reply.status(200).send({ exercise })
}

import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetExerciseLogParams } from '../schemas/get-exercise-log.schema'
import { makeGetExerciseLogUseCase } from '../use-cases/factories/make-get-exercise-log-use-case'

export async function getExerciseLogController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as GetExerciseLogParams

  const getExerciseLogUseCase = makeGetExerciseLogUseCase()
  const { log } = await getExerciseLogUseCase.execute({ logId: id })

  return reply.status(200).send({ log })
}

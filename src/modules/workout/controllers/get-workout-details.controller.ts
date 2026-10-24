import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetWorkoutDetailsParams } from '../schemas/get-workout-details.schema'
import { makeGetWorkoutDetailsUseCase } from '../use-cases/factories/make-get-workout-details-use-case'

export async function getWorkoutDetailsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { workoutId } = request.params as GetWorkoutDetailsParams
  const userId = request.user.sub

  const getWorkoutDetailsUseCase = makeGetWorkoutDetailsUseCase()

  const { workout } = await getWorkoutDetailsUseCase.execute({
    workoutId,
    userId,
  })

  return reply.status(200).send({ workout })
}

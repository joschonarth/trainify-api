import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetWorkoutSessionsByWorkoutParams } from '../schemas/get-workout-sessions-by-workout.schema'
import { makeGetWorkoutSessionsByWorkoutUseCase } from '../use-cases/factories/make-get-workout-sessions-by-workout-use-case'

export async function getWorkoutSessionsByWorkoutController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { workoutId } = request.params as GetWorkoutSessionsByWorkoutParams

  const userId = request.user.sub

  const getWorkoutSessionsByWorkoutUseCase =
    makeGetWorkoutSessionsByWorkoutUseCase()

  const result = await getWorkoutSessionsByWorkoutUseCase.execute({
    userId,
    workoutId,
  })

  return reply.status(200).send({ result })
}

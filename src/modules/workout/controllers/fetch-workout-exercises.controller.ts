import type { FastifyReply, FastifyRequest } from 'fastify'
import type { FetchWorkoutExercisesParams } from '../schemas/fetch-workout-exercises.schema'
import { makeFetchWorkoutExercisesUseCase } from '../use-cases/factories/make-fetch-workout-exercises-use-case'

export async function fetchWorkoutExercisesController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { workoutId } = request.params as FetchWorkoutExercisesParams
  const userId = request.user.sub

  const fetchWorkoutExercisesUseCase = makeFetchWorkoutExercisesUseCase()
  const { exercises } = await fetchWorkoutExercisesUseCase.execute({
    workoutId,
    userId,
  })

  return reply.status(200).send({ exercises })
}

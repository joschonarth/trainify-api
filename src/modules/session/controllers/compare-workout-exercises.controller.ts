import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CompareWorkoutExercisesParams } from '../schemas/compare-workout-exercises.schema'
import { makeCompareWorkoutExercisesUseCase } from '../use-cases/factories/make-compare-workout-exercises-use-case'

export async function compareWorkoutExercisesController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { workoutId } = request.params as CompareWorkoutExercisesParams
  const userId = request.user.sub

  const compareWorkoutExercisesUseCase = makeCompareWorkoutExercisesUseCase()

  const result = await compareWorkoutExercisesUseCase.execute({
    userId,
    workoutId,
  })

  return reply.status(200).send({ result })
}

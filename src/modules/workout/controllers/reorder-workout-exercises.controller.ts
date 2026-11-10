import type { FastifyReply, FastifyRequest } from 'fastify'
import type {
  ReorderWorkoutExercisesBody,
  ReorderWorkoutExercisesParams,
} from '../schemas/reorder-workout-exercises.schema'
import { makeReorderWorkoutExercisesUseCase } from '../use-cases/factories/make-reorder-workout-exercises-use-case'

export async function reorderWorkoutExercisesController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { workoutId } = request.params as ReorderWorkoutExercisesParams
  const { exerciseIds } = request.body as ReorderWorkoutExercisesBody
  const userId = request.user.sub

  const reorderWorkoutExercisesUseCase = makeReorderWorkoutExercisesUseCase()
  const result = await reorderWorkoutExercisesUseCase.execute({
    userId,
    workoutId,
    exerciseIds,
  })

  return reply.status(200).send(result)
}

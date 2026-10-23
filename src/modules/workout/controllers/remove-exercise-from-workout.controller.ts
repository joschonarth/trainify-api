import type { FastifyReply, FastifyRequest } from 'fastify'
import type { RemoveExerciseFromWorkoutParams } from '../schemas/remove-exercise-from-workout.schema'
import { makeRemoveExerciseFromWorkoutUseCase } from '../use-cases/factories/make-remove-exercise-from-workout-use-case'

export async function removeExerciseFromWorkoutController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { workoutId, exerciseId } =
    request.params as RemoveExerciseFromWorkoutParams
  const userId = request.user.sub

  const removeExerciseFromWorkoutUseCase =
    makeRemoveExerciseFromWorkoutUseCase()

  await removeExerciseFromWorkoutUseCase.execute({
    userId,
    workoutId,
    exerciseId,
  })

  return reply.status(204).send()
}

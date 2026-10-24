import type { FastifyReply, FastifyRequest } from 'fastify'
import type {
  UpdateWorkoutExerciseDefaultsBody,
  UpdateWorkoutExerciseDefaultsParams,
} from '../schemas/update-workout-exercise-defaults.schema'
import { makeUpdateWorkoutExerciseDefaultsUseCase } from '../use-cases/factories/make-update-workout-exercise-defaults-use-case'

export async function updateWorkoutExerciseDefaultsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { defaultSets, defaultReps, defaultWeight } =
    request.body as UpdateWorkoutExerciseDefaultsBody

  const { workoutId, exerciseId } =
    request.params as UpdateWorkoutExerciseDefaultsParams
  const userId = request.user.sub

  const updateWorkoutExerciseDefaultsUseCase =
    makeUpdateWorkoutExerciseDefaultsUseCase()

  const { workoutExercise } =
    await updateWorkoutExerciseDefaultsUseCase.execute({
      userId,
      workoutId,
      exerciseId,
      defaultSets,
      defaultReps,
      defaultWeight,
    })

  return reply.status(200).send({ workoutExercise })
}

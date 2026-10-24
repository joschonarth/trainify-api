import type { FastifyReply, FastifyRequest } from 'fastify'
import type {
  AddExerciseToWorkoutBody,
  AddExerciseToWorkoutParams,
} from '../schemas/add-exercise-to-workout.schema'
import { makeAddExerciseToWorkoutUseCase } from '../use-cases/factories/make-add-exercise-to-workout-use-case'

export async function addExerciseToWorkoutController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { workoutId } = request.params as AddExerciseToWorkoutParams
  const userId = request.user.sub
  const { exerciseId, defaultSets, defaultReps, defaultWeight } =
    request.body as AddExerciseToWorkoutBody

  const addExerciseToWorkoutUseCase = makeAddExerciseToWorkoutUseCase()
  const { workoutExercise } = await addExerciseToWorkoutUseCase.execute({
    userId,
    workoutId,
    exerciseId,
    defaultSets,
    defaultReps,
    defaultWeight,
  })

  return reply.status(201).send({ workoutExercise })
}

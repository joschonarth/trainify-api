import type { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceAlreadyExistsError } from '@/shared/errors/resource-already-exists.error'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
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
  const { exerciseId, defaultSets, defaultReps, defaultWeight } =
    request.body as AddExerciseToWorkoutBody

  try {
    const addExerciseToWorkoutUseCase = makeAddExerciseToWorkoutUseCase()
    const { workoutExercise } = await addExerciseToWorkoutUseCase.execute({
      workoutId,
      exerciseId,
      defaultSets,
      defaultReps,
      defaultWeight,
    })

    return reply.status(201).send({ workoutExercise })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    if (error instanceof ResourceAlreadyExistsError) {
      return reply.status(409).send({ message: error.message })
    }

    throw error
  }
}

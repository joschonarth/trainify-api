import type { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type {
  CreateOrAttachExerciseToWorkoutBody,
  CreateOrAttachExerciseToWorkoutParams,
} from '../schemas/create-or-attach-exercise-to-workout.schema'
import { makeCreateOrAttachExerciseToWorkoutUseCase } from '../use-cases/factories/make-create-or-attach-exercise-to-workout-use-case'

export async function createOrAttachExerciseToWorkoutController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { workoutId } = request.params as CreateOrAttachExerciseToWorkoutParams

  const { name, category, type, sets, reps, weight } =
    request.body as CreateOrAttachExerciseToWorkoutBody

  const userId = request.user.sub

  try {
    const createOrAttachExerciseToWorkoutUseCase =
      makeCreateOrAttachExerciseToWorkoutUseCase()

    const { exercise, workoutExercise } =
      await createOrAttachExerciseToWorkoutUseCase.execute({
        userId,
        workoutId,
        name,
        category,
        type,
        sets,
        reps,
        weight,
      })

    return reply.status(201).send({
      exercise,
      workoutExercise,
    })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}

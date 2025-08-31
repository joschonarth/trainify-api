import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeAddExerciseToWorkoutUseCase } from '@/use-cases/workouts/factories/make-add-exercise-to-workout-use-case'

export async function addExerciseToWorkoutController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const bodySchema = z.object({
    exerciseId: z.string(),
    defaultSets: z.number().nullable(),
    defaultReps: z.number().nullable(),
    defaultWeight: z.number().nullable(),
  })

  const paramsSchema = z.object({
    workoutId: z.string(),
  })

  const { exerciseId, defaultSets, defaultReps, defaultWeight } =
    bodySchema.parse(request.body)
  const { workoutId } = paramsSchema.parse(request.params)

  const useCase = makeAddExerciseToWorkoutUseCase()
  const { workoutExercise } = await useCase.execute({
    workoutId,
    exerciseId,
    defaultSets,
    defaultReps,
    defaultWeight,
  })

  return reply.status(201).send({ workoutExercise })
}

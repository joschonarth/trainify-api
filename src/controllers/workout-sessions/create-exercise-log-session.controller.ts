import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceNotFoundError } from '@/errors/resource-not-found.error'
import { makeCreateExerciseLogSessionUseCase } from '@/use-cases/workout-sessions/factories/make-create-exercise-log-session-use-case'

export async function createExerciseLogSessionController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const createExerciseLogSessionBodySchema = z.object({
    exerciseId: z.string(),
    sets: z.number(),
    reps: z.number(),
    weight: z.number().nullable(),
    description: z.string().nullable(),
  })

  const paramsSchema = z.object({
    sessionId: z.string(),
  })

  try {
    const { exerciseId, sets, reps, weight, description } =
      createExerciseLogSessionBodySchema.parse(request.body)

    const { sessionId } = paramsSchema.parse(request.params)

    const userId = request.user.sub

    const createExerciseLogSessionUseCase =
      makeCreateExerciseLogSessionUseCase()

    const { exerciseLog } = await createExerciseLogSessionUseCase.execute({
      userId,
      sessionId,
      exerciseId,
      sets,
      reps,
      weight,
      description,
    })

    return reply.status(201).send({ exerciseLog })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}

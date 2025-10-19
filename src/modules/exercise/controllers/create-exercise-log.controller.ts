import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceAlreadyExistsError } from '@/shared/errors/resource-already-exists.error'

import { makeCreateExerciseLogUseCase } from '../use-cases/factories/make-create-exercise-log-use-case'

export async function createExerciseLogController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const createExerciseLogBodySchema = z.object({
    exerciseId: z.string(),
    sets: z.number(),
    reps: z.number(),
    weight: z.number().nullable(),
    description: z.string().nullable(),
    date: z.iso.datetime().optional(),
  })

  try {
    const { exerciseId, sets, reps, weight, description, date } =
      createExerciseLogBodySchema.parse(request.body)

    const userId = request.user.sub

    const createExerciseLogUseCase = makeCreateExerciseLogUseCase()

    const { exerciseLog } = await createExerciseLogUseCase.execute({
      userId,
      exerciseId,
      sets,
      reps,
      weight,
      description,
      ...(date ? { date: new Date(date) } : {}),
    })

    return reply.status(201).send({ exerciseLog })
  } catch (error) {
    if (error instanceof ResourceAlreadyExistsError) {
      return reply.status(409).send({ message: error.message })
    }

    throw error
  }
}

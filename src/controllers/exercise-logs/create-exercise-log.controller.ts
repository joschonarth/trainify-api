import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeCreateExerciseLogUseCase } from '@/use-cases/exercise-logs/factories/make-create-exercise-log-use-case'

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
  })

  try {
    const { exerciseId, sets, reps, weight, description } =
      createExerciseLogBodySchema.parse(request.body)

    const userId = request.user.sub

    const createExerciseLogUseCase = makeCreateExerciseLogUseCase()

    const { log } = await createExerciseLogUseCase.execute({
      userId,
      exerciseId,
      sets,
      reps,
      weight,
      description,
    })

    return reply.status(201).send({ log })
  } catch (error) {
    console.error(error)
    return reply.status(400).send({ message: 'Invalid request.' })
  }
}

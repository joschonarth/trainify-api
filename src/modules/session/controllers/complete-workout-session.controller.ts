import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeCompleteWorkoutSessionUseCase } from '@/modules/session/use-cases/factories/make-complete-workout-session-use-case'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

export async function completeWorkoutSessionController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const paramsSchema = z.object({
    sessionId: z.cuid(),
  })

  const bodySchema = z.object({
    exercises: z
      .array(
        z.object({
          exerciseSessionId: z.cuid(),
          sets: z.number().min(1, 'Sets must be at least 1'),
          reps: z.number().min(1, 'Reps must be at least 1'),
          weight: z.number().optional().default(0),
          completed: z.boolean(),
          note: z.string().optional(),
        })
      )
      .min(1, 'At least one exercise is required'),
  })

  try {
    const { sessionId } = paramsSchema.parse(request.params)
    const { exercises } = bodySchema.parse(request.body)
    const userId = request.user.sub

    const completeWorkoutSessionUseCase = makeCompleteWorkoutSessionUseCase()

    const { session } = await completeWorkoutSessionUseCase.execute({
      userId,
      sessionId,
      exercises,
    })

    return reply.status(200).send({ session })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}

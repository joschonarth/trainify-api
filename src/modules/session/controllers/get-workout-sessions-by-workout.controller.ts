import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeGetWorkoutSessionsByWorkoutUseCase } from '../use-cases/factories/make-get-workout-sessions-by-workout-use-case'

export async function getWorkoutSessionsByWorkoutController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    workoutId: z.cuid(),
  })

  const { workoutId } = paramsSchema.parse(request.params)

  const userId = request.user.sub

  const getWorkoutSessionsByWorkoutUseCase =
    makeGetWorkoutSessionsByWorkoutUseCase()

  const result = await getWorkoutSessionsByWorkoutUseCase.execute({
    userId,
    workoutId,
  })

  return reply.status(200).send(result)
}

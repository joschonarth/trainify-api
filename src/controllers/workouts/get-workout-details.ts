import { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceNotFoundError } from '@/errors/resource-not-found.error'
import { makeGetWorkoutDetailsUseCase } from '@/use-cases/workouts/factories/make-get-workout-use-case'

export async function getWorkoutDetailsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { workoutId } = request.params as { workoutId: string }

    const getWorkoutDetailsUseCase = makeGetWorkoutDetailsUseCase()

    const { workout } = await getWorkoutDetailsUseCase.execute({
      workoutId,
    })

    return reply.status(200).send({ workout })
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }

    throw err
  }
}

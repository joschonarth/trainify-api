import type { FastifyReply, FastifyRequest } from 'fastify'
import type { DeleteWorkoutParams } from '../schemas/delete-workout.schema'
import { makeDeleteWorkoutUseCase } from '../use-cases/factories/make-delete-workout-use-case'

export async function deleteWorkoutController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { workoutId } = request.params as DeleteWorkoutParams
  const userId = request.user.sub

  const deleteWorkoutUseCase = makeDeleteWorkoutUseCase()
  await deleteWorkoutUseCase.execute({ workoutId, userId })

  return reply.status(204).send()
}

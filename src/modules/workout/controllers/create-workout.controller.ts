import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreateWorkoutBody } from '../schemas/create-workout.schema'
import { makeCreateWorkoutUseCase } from '../use-cases/factories/make-create-workout-use-case'

export async function createWorkoutController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { name, description } = request.body as CreateWorkoutBody

  const userId = request.user.sub

  const createWorkoutUseCase = makeCreateWorkoutUseCase()

  const { workout } = await createWorkoutUseCase.execute({
    userId,
    name,
    description,
  })

  return reply.status(201).send({ workout })
}

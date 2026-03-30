import type { FastifyReply, FastifyRequest } from 'fastify'
import { ResourceAlreadyExistsError } from '@/shared/errors/resource-already-exists.error'
import type { CreateExerciseBody } from '../schemas/create-exercise.schema'
import { makeCreateExerciseUseCase } from '../use-cases/factories/make-create-exercise-use-case'

export async function createExerciseController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { name, category, type } = request.body as CreateExerciseBody

  const userId = request.user.sub

  try {
    const createExerciseUseCase = makeCreateExerciseUseCase()

    const { exercise } = await createExerciseUseCase.execute({
      userId,
      name,
      category,
      type,
    })

    return reply.status(201).send({ exercise })
  } catch (error) {
    if (error instanceof ResourceAlreadyExistsError) {
      return reply.status(409).send({ message: error.message })
    }

    throw error
  }
}

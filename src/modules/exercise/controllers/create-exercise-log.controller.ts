import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreateExerciseLogBody } from '../schemas/create-exercise-log.schema'
import { makeCreateExerciseLogUseCase } from '../use-cases/factories/make-create-exercise-log-use-case'

export async function createExerciseLogController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user.sub

  const { exerciseId, sets, reps, weight, description, date } =
    request.body as CreateExerciseLogBody

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
}

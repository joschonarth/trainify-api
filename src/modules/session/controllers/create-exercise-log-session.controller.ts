import type { FastifyReply, FastifyRequest } from 'fastify'

import { makeCreateExerciseLogSessionUseCase } from '@/modules/session/use-cases/factories/make-create-exercise-log-session-use-case'
import type {
  CreateExerciseLogSessionBody,
  CreateExerciseLogSessionParams,
} from '../schemas/create-exercise-log-session.schema'

export async function createExerciseLogSessionController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { sessionId } = request.params as CreateExerciseLogSessionParams

  const { exerciseId, sets, reps, weight, description, date } =
    request.body as CreateExerciseLogSessionBody

  const userId = request.user.sub

  const createExerciseLogSessionUseCase = makeCreateExerciseLogSessionUseCase()

  const { exerciseLog } = await createExerciseLogSessionUseCase.execute({
    userId,
    sessionId,
    exerciseId,
    sets,
    reps,
    weight,
    description,
    ...(date && { date: new Date(date) }),
  })

  return reply.status(201).send({ exerciseLog })
}

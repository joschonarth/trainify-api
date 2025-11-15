import { WorkoutSessionStatus } from '@prisma/client'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { WorkoutSessionsRepository } from '../repositories/workout-sessions.repository'

interface FinishWorkoutSessionRequest {
  sessionId: string
  userId: string
}

export class FinishWorkoutSessionUseCase {
  constructor(private workoutSessionsRepository: WorkoutSessionsRepository) {}

  async execute({ sessionId, userId }: FinishWorkoutSessionRequest) {
    const session = await this.workoutSessionsRepository.findById(sessionId)

    if (!session || session.userId !== userId) {
      throw new ResourceNotFoundError('Workout session not found.')
    }

    if (session.status === WorkoutSessionStatus.COMPLETED) {
      throw new Error('Workout session already completed.')
    }

    if (!session.startedAt) {
      throw new Error('Workout session has not started.')
    }

    const now = new Date()

    const endedAt = now
    const duration = session.startedAt
      ? Math.floor((endedAt.getTime() - session.startedAt.getTime()) / 1000)
      : 0

    await this.workoutSessionsRepository.update(sessionId, {
      endedAt,
      duration,
    })

    const updated = await this.workoutSessionsRepository.findById(sessionId)

    return { session: updated }
  }
}

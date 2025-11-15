import { WorkoutSessionStatus } from '@prisma/client'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { WorkoutSessionsRepository } from '../repositories/workout-sessions.repository'

interface StartWorkoutSessionRequest {
  sessionId: string
  userId: string
}

export class StartWorkoutSessionUseCase {
  constructor(private workoutSessionsRepository: WorkoutSessionsRepository) {}

  async execute({ sessionId, userId }: StartWorkoutSessionRequest) {
    const session = await this.workoutSessionsRepository.findById(sessionId)

    if (!session || session.userId !== userId) {
      throw new ResourceNotFoundError('Workout session not found.')
    }

    if (session.status === WorkoutSessionStatus.COMPLETED) {
      throw new Error('Workout session already completed.')
    }

    if (session.status === WorkoutSessionStatus.IN_PROGRESS) {
      throw new Error('Workout session already in progress.')
    }

    const startedAt = new Date()

    await this.workoutSessionsRepository.update(sessionId, {
      startedAt,
      status: WorkoutSessionStatus.IN_PROGRESS,
    })

    const updated = await this.workoutSessionsRepository.findById(sessionId)

    return { session: updated }
  }
}

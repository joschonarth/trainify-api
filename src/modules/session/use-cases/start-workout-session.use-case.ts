import { WorkoutSessionStatus } from '@prisma/client'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { WorkoutSessionAlreadyCompletedError } from '../errors/workout-session-already-completed.error'
import { WorkoutSessionAlreadyInProgressError } from '../errors/workout-session-already-in-progress.error'
import type { WorkoutSessionsRepository } from '../repositories/workout-sessions.repository'

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
      throw new WorkoutSessionAlreadyCompletedError()
    }

    if (session.status === WorkoutSessionStatus.IN_PROGRESS) {
      throw new WorkoutSessionAlreadyInProgressError()
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

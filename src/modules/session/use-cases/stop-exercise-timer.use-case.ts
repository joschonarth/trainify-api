import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { ExerciseTimerNotStartedError } from '../errors/exercise-timer-not-started.error'
import type { ExerciseSessionsRepository } from '../repositories/exercise-sessions.repository'
import type { WorkoutSessionsRepository } from '../repositories/workout-sessions.repository'

interface StopExerciseTimerRequest {
  userId: string
  exerciseSessionId: string
}

export class StopExerciseTimerUseCase {
  constructor(
    private exerciseSessionsRepository: ExerciseSessionsRepository,
    private workoutSessionsRepository: WorkoutSessionsRepository
  ) {}

  async execute({ userId, exerciseSessionId }: StopExerciseTimerRequest) {
    const exerciseSession =
      await this.exerciseSessionsRepository.findById(exerciseSessionId)

    if (!exerciseSession) {
      throw new ResourceNotFoundError('Exercise session not found.')
    }

    const workoutSession = await this.workoutSessionsRepository.findById(
      exerciseSession.workoutSessionId
    )

    if (!workoutSession || workoutSession.userId !== userId) {
      throw new ResourceNotFoundError('Session does not belong to this user.')
    }

    if (!exerciseSession.startedAt) {
      throw new ExerciseTimerNotStartedError()
    }

    const now = new Date()

    const elapsed = Math.floor(
      (now.getTime() - exerciseSession.startedAt.getTime()) / 1000
    )

    const updated = await this.exerciseSessionsRepository.update(
      exerciseSessionId,
      {
        endedAt: now,
        duration: elapsed,
      }
    )

    return { exerciseSession: updated, elapsed }
  }
}

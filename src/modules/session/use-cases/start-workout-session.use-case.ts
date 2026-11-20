import { WorkoutSessionStatus } from 'generated/prisma'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { WorkoutSessionAlreadyCompletedError } from '../errors/workout-session-already-completed.error'
import { WorkoutSessionAlreadyInProgressError } from '../errors/workout-session-already-in-progress.error'
import type { WorkoutSessionsRepository } from '../repositories/workout-sessions.repository'
import { assertSessionBusinessDay } from '../utils/session-business-day'

interface StartWorkoutSessionRequest {
  sessionId: string
  userId: string
}

export class StartWorkoutSessionUseCase {
  constructor(
    private readonly workoutSessionsRepository: Pick<
      WorkoutSessionsRepository,
      'findById' | 'update'
    >
  ) {}

  async execute({ sessionId, userId }: StartWorkoutSessionRequest) {
    const session = await this.workoutSessionsRepository.findById(sessionId)

    if (!session || session.userId !== userId) {
      throw new ResourceNotFoundError('Workout session not found.')
    }

    if (
      session.status === WorkoutSessionStatus.COMPLETED ||
      session.status === WorkoutSessionStatus.INCOMPLETE ||
      session.status === WorkoutSessionStatus.SKIPPED ||
      session.endedAt
    ) {
      throw new WorkoutSessionAlreadyCompletedError()
    }

    if (session.status === WorkoutSessionStatus.IN_PROGRESS) {
      throw new WorkoutSessionAlreadyInProgressError()
    }

    assertSessionBusinessDay(session)

    const startedAt = new Date()

    await this.workoutSessionsRepository.update(sessionId, {
      startedAt,
      endedAt: null,
      duration: null,
      status: WorkoutSessionStatus.IN_PROGRESS,
    })

    const updated = await this.workoutSessionsRepository.findById(sessionId)

    return { session: updated }
  }
}

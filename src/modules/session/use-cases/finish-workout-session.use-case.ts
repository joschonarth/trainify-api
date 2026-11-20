import { WorkoutSessionStatus } from 'generated/prisma'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { WorkoutSessionAlreadyCompletedError } from '../errors/workout-session-already-completed.error'
import { WorkoutSessionNotStartedError } from '../errors/workout-session-not-started.error'
import type { WorkoutSessionsRepository } from '../repositories/workout-sessions.repository'
import { assertSessionBusinessDay } from '../utils/session-business-day'

interface FinishWorkoutSessionRequest {
  sessionId: string
  userId: string
}

export class FinishWorkoutSessionUseCase {
  constructor(
    private readonly workoutSessionsRepository: Pick<
      WorkoutSessionsRepository,
      'findById' | 'update'
    >
  ) {}

  async execute({ sessionId, userId }: FinishWorkoutSessionRequest) {
    const session = await this.workoutSessionsRepository.findById(sessionId)

    if (!session || session.userId !== userId) {
      throw new ResourceNotFoundError('Workout session not found.')
    }

    if (
      session.status === WorkoutSessionStatus.COMPLETED ||
      session.status === WorkoutSessionStatus.INCOMPLETE ||
      session.status === WorkoutSessionStatus.SKIPPED
    ) {
      throw new WorkoutSessionAlreadyCompletedError()
    }

    if (
      session.status !== WorkoutSessionStatus.IN_PROGRESS ||
      !session.startedAt
    ) {
      throw new WorkoutSessionNotStartedError()
    }

    if (session.endedAt) {
      throw new WorkoutSessionAlreadyCompletedError(
        'Workout session has already been finished.'
      )
    }

    assertSessionBusinessDay(session)

    const endedAt = new Date()

    const duration = Math.floor(
      (endedAt.getTime() - session.startedAt.getTime()) / 1000
    )

    await this.workoutSessionsRepository.update(sessionId, {
      endedAt,
      duration,
    })

    const updated = await this.workoutSessionsRepository.findById(sessionId)

    return { session: updated }
  }
}

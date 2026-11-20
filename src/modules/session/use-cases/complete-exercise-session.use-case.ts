import { WorkoutSessionStatus } from 'generated/prisma'
import type { ExerciseSessionsRepository } from '@/modules/session/repositories/exercise-sessions.repository'
import type { WorkoutSessionsRepository } from '@/modules/session/repositories/workout-sessions.repository'
import { NotAllowedError } from '@/shared/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { assertSessionBusinessDay } from '../utils/session-business-day'

interface CompleteExerciseSessionUseCaseRequest {
  userId: string
  exerciseSessionId: string
}

export class CompleteExerciseSessionUseCase {
  constructor(
    private readonly exerciseSessionsRepository: Pick<
      ExerciseSessionsRepository,
      'findByIdWithLogs' | 'update'
    >,
    private readonly workoutSessionsRepository: Pick<
      WorkoutSessionsRepository,
      'findById'
    >
  ) {}

  async execute({
    userId,
    exerciseSessionId,
  }: CompleteExerciseSessionUseCaseRequest) {
    const exerciseSession =
      await this.exerciseSessionsRepository.findByIdWithLogs(exerciseSessionId)

    if (!exerciseSession) {
      throw new ResourceNotFoundError('Exercise session not found.')
    }

    const workoutSession = await this.workoutSessionsRepository.findById(
      exerciseSession.workoutSessionId
    )

    if (!workoutSession || workoutSession.userId !== userId) {
      throw new ResourceNotFoundError('Exercise session not found.')
    }

    if (workoutSession.status !== WorkoutSessionStatus.IN_PROGRESS) {
      throw new NotAllowedError(
        'Exercises can only be completed while the workout session is in progress.'
      )
    }

    assertSessionBusinessDay(workoutSession)

    if (exerciseSession.logs.length === 0) {
      throw new NotAllowedError(
        'Add an exercise log through workout session completion before completing this exercise.'
      )
    }

    const updated = await this.exerciseSessionsRepository.update(
      exerciseSessionId,
      {
        completed: true,
      }
    )

    return { exerciseSession: updated }
  }
}

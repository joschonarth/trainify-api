import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { AnotherExerciseTimerRunningError } from '../errors/another-exercise-timer-running.error'
import { ExerciseTimerAlreadyRunningError } from '../errors/exercise-timer-already-running.error'
import type { ExerciseSessionsRepository } from '../repositories/exercise-sessions.repository'
import type { WorkoutSessionsRepository } from '../repositories/workout-sessions.repository'

interface StartExerciseTimerRequest {
  userId: string
  exerciseSessionId: string
}

export class StartExerciseTimerUseCase {
  constructor(
    private exerciseSessionsRepository: ExerciseSessionsRepository,
    private workoutSessionsRepository: WorkoutSessionsRepository
  ) {}

  async execute({ userId, exerciseSessionId }: StartExerciseTimerRequest) {
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

    if (exerciseSession.startedAt && !exerciseSession.endedAt) {
      throw new ExerciseTimerAlreadyRunningError()
    }

    const exercisesInSession =
      await this.exerciseSessionsRepository.findByWorkoutSessionId(
        workoutSession.id
      )

    const exerciseRunning = exercisesInSession.some(
      (ex) => ex.startedAt && !ex.endedAt
    )

    if (exerciseRunning) {
      throw new AnotherExerciseTimerRunningError()
    }

    const now = new Date()

    const updated = await this.exerciseSessionsRepository.update(
      exerciseSessionId,
      {
        startedAt: now,
        endedAt: null,
      }
    )

    return { exerciseSession: updated }
  }
}

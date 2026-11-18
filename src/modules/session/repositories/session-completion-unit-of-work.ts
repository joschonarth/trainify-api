import type { ExerciseLogsRepository } from '@/modules/exercise/repositories/exercise-logs.repository'

import type { ExerciseSessionsRepository } from './exercise-sessions.repository'
import type { WorkoutSessionsRepository } from './workout-sessions.repository'

export interface SessionCompletionRepositories {
  workoutSessions: Pick<
    WorkoutSessionsRepository,
    'findByIdWithWorkout' | 'update'
  >
  exerciseSessions: Pick<
    ExerciseSessionsRepository,
    'findByWorkoutSessionId' | 'update'
  >
  exerciseLogs: Pick<ExerciseLogsRepository, 'create'>
}

export interface SessionCompletionUnitOfWork {
  execute<T>(
    operation: (repositories: SessionCompletionRepositories) => Promise<T>
  ): Promise<T>
}

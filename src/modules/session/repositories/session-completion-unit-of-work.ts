import type { ExerciseLogsRepository } from '@/modules/exercise/repositories/exercise-logs.repository'
import type {
  SessionEventOutboxRepository,
  SessionEventProcessingRepository,
} from '../events/workout-finalized-v1'

import type { ExerciseSessionsRepository } from './exercise-sessions.repository'
import type { WorkoutSessionCompletionsRepository } from './workout-session-completions.repository'
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
  completions: WorkoutSessionCompletionsRepository
  outbox: SessionEventOutboxRepository
  processings: SessionEventProcessingRepository
}

export interface SessionCompletionUnitOfWork {
  execute<T>(
    sessionId: string,
    operation: (repositories: SessionCompletionRepositories) => Promise<T>
  ): Promise<T>
}

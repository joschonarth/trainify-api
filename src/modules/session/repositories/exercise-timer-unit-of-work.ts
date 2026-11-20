import type { ExerciseSessionsRepository } from './exercise-sessions.repository'
import type { WorkoutSessionsRepository } from './workout-sessions.repository'

export interface ExerciseTimerRepositories {
  exerciseSessions: Pick<
    ExerciseSessionsRepository,
    'findById' | 'findByWorkoutSessionId' | 'update'
  >
  workoutSessions: Pick<WorkoutSessionsRepository, 'findById'>
}

export interface ExerciseTimerUnitOfWork {
  execute<T>(
    exerciseSessionId: string,
    operation: (repositories: ExerciseTimerRepositories) => Promise<T>
  ): Promise<T>
}

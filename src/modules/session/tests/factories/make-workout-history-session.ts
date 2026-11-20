import type { Exercise, ExerciseLog, Workout } from 'generated/prisma'
import type { WorkoutSessionsRepository } from '../../repositories/workout-sessions.repository'
import {
  makeTimerExerciseSession,
  makeTimerWorkoutSession,
} from './make-timer-session'

export function makeWorkoutHistoryLog(
  overrides: Partial<ExerciseLog> = {}
): ExerciseLog {
  return {
    id: 'log',
    userId: 'user',
    exerciseId: 'exercise',
    exerciseSessionId: 'exercise-session',
    sets: 2,
    reps: 10,
    weight: 20,
    volume: 400,
    date: new Date('2026-01-01T12:00:00Z'),
    description: null,
    ...overrides,
  }
}

export function makeWorkoutHistorySession(
  workout: Workout,
  exercise: Exercise,
  logs: ExerciseLog[] = []
): Awaited<
  ReturnType<WorkoutSessionsRepository['findManyByWorkoutId']>
>[number] {
  return {
    ...makeTimerWorkoutSession({
      workoutId: workout.id,
      userId: workout.userId,
      status: 'COMPLETED',
      endedAt: new Date(),
    }),
    workout,
    exerciseSessions: [
      {
        ...makeTimerExerciseSession({
          exerciseId: exercise.id,
          completed: true,
        }),
        exercise,
        logs,
      },
    ],
  }
}

import type { ExerciseSession, WorkoutSession } from 'generated/prisma'

export function makeTimerWorkoutSession(
  overrides: Partial<WorkoutSession> = {}
): WorkoutSession {
  return {
    id: 'session',
    userId: 'user',
    workoutId: 'workout',
    date: new Date(),
    status: 'IN_PROGRESS',
    startedAt: new Date(),
    endedAt: null,
    duration: null,
    ...overrides,
  }
}

export function makeTimerExerciseSession(
  overrides: Partial<ExerciseSession> = {}
): ExerciseSession {
  return {
    id: 'exercise-session',
    workoutSessionId: 'session',
    exerciseId: 'exercise',
    position: 0,
    completed: false,
    skipReason: null,
    plannedSets: null,
    plannedReps: null,
    plannedWeight: null,
    startedAt: null,
    endedAt: null,
    duration: null,
    ...overrides,
  }
}

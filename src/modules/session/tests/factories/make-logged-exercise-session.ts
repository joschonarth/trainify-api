import type { ExerciseSessionWithLogs } from '../../repositories/exercise-sessions.repository'
import { makeTimerExerciseSession } from './make-timer-session'

export function makeLoggedExerciseSession(
  overrides: Partial<ExerciseSessionWithLogs> = {}
): ExerciseSessionWithLogs {
  return {
    ...makeTimerExerciseSession({ plannedReps: 10 }),
    exercise: {
      id: 'exercise',
      name: 'Exercise',
      category: null,
      type: null,
      measurement: 'REPS',
    },
    logs: [
      {
        id: 'log',
        sets: 2,
        reps: 12,
        weight: 20,
        volume: 480,
        date: new Date('2026-01-01T12:00:00Z'),
        description: 'Notes',
      },
    ],
    ...overrides,
  }
}

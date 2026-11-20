import type { Measurement } from 'generated/prisma'
import { makeDailySession } from './make-daily-session'

export function makeMeasuredSession(
  id: string,
  date: Date,
  measurement: Measurement,
  volume = 3600
) {
  return makeDailySession({
    id,
    date,
    userId: 'user',
    workoutId: 'workout',
    status: 'COMPLETED',
    exerciseSessions: [
      {
        id: `${id}-exercise`,
        plannedSets: 2,
        plannedReps: 30,
        plannedWeight: 60,
        completed: true,
        state: 'COMPLETED',
        skipReason: null,
        startedAt: date,
        endedAt: date,
        duration: 999,
        exercise: {
          id: 'exercise',
          name: 'Exercise',
          category: null,
          type: null,
          measurement,
        },
        logs: [
          {
            id: `${id}-log`,
            sets: 2,
            reps: 30,
            weight: 60,
            volume,
            date,
            description: null,
          },
        ],
      },
    ],
  })
}

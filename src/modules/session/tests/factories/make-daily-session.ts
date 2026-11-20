import type { WorkoutScheduleWithWorkout } from '@/modules/workout/repositories/workout-schedules.repository'
import type { WorkoutSessionWithWorkout } from '../../repositories/workout-sessions.repository'
import { makeTimerWorkoutSession } from './make-timer-session'

export function makeDailySchedule(dayOfWeek = 4): WorkoutScheduleWithWorkout {
  return {
    id: 'schedule',
    userId: 'user',
    workoutId: 'workout',
    dayOfWeek,
    workout: {
      id: 'workout',
      name: 'Workout',
      exercises: [
        {
          id: 'workout-exercise',
          exerciseId: 'exercise',
          position: 2,
          defaultSets: 3,
          defaultReps: 10,
          defaultWeight: 20,
          exercise: {
            id: 'exercise',
            name: 'Exercise',
            category: null,
            type: null,
            measurement: 'REPS',
            archivedAt: null,
          },
        },
      ],
    },
  }
}
export function makeDailySession(
  overrides: Partial<WorkoutSessionWithWorkout> = {}
): WorkoutSessionWithWorkout {
  return {
    ...makeTimerWorkoutSession(),
    workout: { id: 'workout', name: 'Workout', exercises: [] },
    exerciseSessions: [],
    ...overrides,
  }
}

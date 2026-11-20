import type {
  Exercise,
  ExerciseLog,
  ExerciseSession,
  Prisma,
  Workout,
  WorkoutSession,
  WorkoutSessionStatus,
} from 'generated/prisma'

import type { ExerciseSessionState } from '../utils/exercise-session-state'

export interface WorkoutSessionWithWorkout extends WorkoutSession {
  workout: {
    id: string
    name: string
    exercises: {
      id: string
      exerciseId: string
      position: number
      defaultSets: number | null
      defaultReps: number | null
      defaultWeight: number | null
      exercise: {
        id: string
        name: string
        category: string | null
        type: string | null
        measurement: 'REPS' | 'DURATION'
      }
    }[]
  }
  exerciseSessions: {
    id: string
    plannedSets: number | null
    plannedReps: number | null
    plannedWeight: number | null
    completed: boolean
    skipReason: string | null
    state: ExerciseSessionState
    startedAt: Date | null
    endedAt: Date | null
    duration: number | null
    exercise: {
      id: string
      name: string
      category: string | null
      type: string | null
      measurement: 'REPS' | 'DURATION'
    }
    logs: {
      id: string
      sets: number
      reps: number
      weight: number | null
      volume: number
      date: Date
      description: string | null
    }[]
  }[]
}

export interface DailySessionRequest {
  userId: string
  businessDate: string
  timezone: string
  start: Date
  end: Date
}

export interface WorkoutSessionsRepository {
  resolveDailySession(
    request: DailySessionRequest,
    create?: Prisma.WorkoutSessionUncheckedCreateInput
  ): Promise<WorkoutSessionWithWorkout | null>

  findById(id: string): Promise<WorkoutSession | null>

  findByUserAndDate(
    userId: string,
    date: Date,
    timezone: string
  ): Promise<WorkoutSession | null>

  findByIdWithWorkout(id: string): Promise<WorkoutSessionWithWorkout | null>

  findAllByUser(userId: string): Promise<WorkoutSessionWithWorkout[]>

  findHistoryByUser(query: {
    userId: string
    from?: Date
    to?: Date
    status?: WorkoutSessionStatus
    workoutId?: string
    skip: number
    take: number
  }): Promise<{
    sessions: {
      id: string
      date: Date
      status: WorkoutSessionStatus
      startedAt: Date | null
      endedAt: Date | null
      duration: number | null
      workout: {
        name: string
        exercises: { exerciseId: string; position: number }[]
      }
      exerciseSessions: {
        id: string
        position: number
        exerciseId: string
        plannedSets: number | null
        plannedReps: number | null
        plannedWeight: number | null
        completed: boolean
        skipReason: string | null
        startedAt: Date | null
        endedAt: Date | null
        duration: number | null
        exercise: { name: string }
        logs: {
          sets: number
          reps: number
          weight: number | null
          description: string | null
        }[]
      }[]
    }[]
    total: number
  }>

  findByIdWithWorkoutAndExerciseSessions(
    id: string
  ): Promise<WorkoutSessionWithWorkout | null>

  findByUserAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{ id: string; date: Date; status: WorkoutSessionStatus }[]>

  findManyByWorkoutAndUser(
    userId: string,
    workoutId: string
  ): Promise<WorkoutSessionWithWorkout[]>

  findManyByWorkoutId(
    workoutId: string,
    userId: string
  ): Promise<
    (WorkoutSession & {
      exerciseSessions: (ExerciseSession & {
        exercise: Exercise
        logs: ExerciseLog[]
      })[]
      workout: Workout
    })[]
  >

  findDetailedByUserAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<WorkoutSessionWithWorkout[]>

  create(
    data: Prisma.WorkoutSessionUncheckedCreateInput
  ): Promise<WorkoutSession>

  update(
    id: string,
    data: Prisma.WorkoutSessionUpdateInput
  ): Promise<WorkoutSession>

  updateStatus(
    id: string,
    status: WorkoutSessionStatus
  ): Promise<WorkoutSession>

  countCompletedByUser(userId: string): Promise<number>
}

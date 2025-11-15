import {
  Exercise,
  ExerciseLog,
  ExerciseSession,
  Prisma,
  Workout,
  WorkoutSession,
  WorkoutSessionStatus,
} from '@prisma/client'

export interface WorkoutSessionWithWorkout extends WorkoutSession {
  workout: {
    id: string
    name: string
    exercises: {
      id: string
      defaultSets: number | null
      defaultReps: number | null
      defaultWeight: number | null
      exercise: {
        id: string
        name: string
        category: string | null
        type: string | null
      }
    }[]
  }
  exerciseSessions: {
    id: string
    sets: number
    reps: number
    weight: number | null
    completed: boolean
    exercise: {
      id: string
      name: string
      category: string | null
      type: string | null
    }
    logs: {
      id: string
      sets: number
      reps: number
      weight: number | null
      date: Date
      description: string | null
    }[]
  }[]
}

export interface WorkoutSessionsRepository {
  findById(id: string): Promise<WorkoutSession | null>

  findByUserAndDate(userId: string, date: Date): Promise<WorkoutSession | null>

  findByIdWithWorkout(id: string): Promise<WorkoutSessionWithWorkout | null>

  findAllByUser(userId: string): Promise<WorkoutSessionWithWorkout[]>

  findByIdWithWorkoutAndExerciseSessions(
    id: string,
  ): Promise<WorkoutSessionWithWorkout | null>

  findByUserAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ id: string; date: Date; status: WorkoutSessionStatus }[]>

  findManyByWorkoutAndUser(
    userId: string,
    workoutId: string,
  ): Promise<WorkoutSessionWithWorkout[]>

  findManyByWorkoutId(
    workoutId: string,
    userId: string,
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
    endDate: Date,
  ): Promise<WorkoutSessionWithWorkout[]>

  create(
    data: Prisma.WorkoutSessionUncheckedCreateInput,
  ): Promise<WorkoutSession>

  update(
    id: string,
    data: Prisma.WorkoutSessionUpdateInput,
  ): Promise<WorkoutSession>

  updateStatus(
    id: string,
    status: WorkoutSessionStatus,
  ): Promise<WorkoutSession>

  completeWorkoutSession(
    sessionId: string,
    updates: {
      status: WorkoutSessionStatus
      exerciseSessions: {
        id: string
        completed: boolean
        sets?: number | null
        reps?: number | null
        weight?: number | null
      }[]
    },
  ): Promise<WorkoutSessionWithWorkout>

  countCompletedByUser(userId: string): Promise<number>
}

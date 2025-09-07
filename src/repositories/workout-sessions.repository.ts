import { Prisma, WorkoutSession } from '@prisma/client'

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
}

export type WorkoutSessionWithWorkoutAndLogs = WorkoutSession & {
  workout: {
    id: string
    name: string
    description?: string | null
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
  logs: {
    id: string
    sets: number
    reps: number
    weight: number | null
    date: Date
    description: string | null
    userId: string
    exerciseId: string
    workoutId: string | null
    workoutSessionId: string | null
    exercise?: {
      id: string
      name: string
    }
  }[]
}

export interface WorkoutSessionsRepository {
  findById(id: string): Promise<WorkoutSession | null>
  findByUserAndDate(userId: string, date: Date): Promise<WorkoutSession | null>
  findByIdWithWorkout(id: string): Promise<WorkoutSessionWithWorkout | null>
  findAllByUser(userId: string): Promise<WorkoutSessionWithWorkoutAndLogs[]>
  findByIdWithWorkoutAndLogs(
    id: string,
  ): Promise<WorkoutSessionWithWorkoutAndLogs | null>
  create(
    data: Prisma.WorkoutSessionUncheckedCreateInput,
  ): Promise<WorkoutSession>
  updateCompleted(id: string, completed: boolean): Promise<WorkoutSession>
}

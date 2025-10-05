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

  create(
    data: Prisma.WorkoutSessionUncheckedCreateInput,
  ): Promise<WorkoutSession>
}

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

export interface WorkoutSessionsRepository {
  findByUserAndDate(userId: string, date: Date): Promise<WorkoutSession | null>
  findByIdWithWorkout(id: string): Promise<WorkoutSessionWithWorkout | null>
  create(
    data: Prisma.WorkoutSessionUncheckedCreateInput,
  ): Promise<WorkoutSession>
}

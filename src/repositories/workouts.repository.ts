import { Prisma, Workout } from '@prisma/client'

export interface WorkoutsRepository {
  create(data: Prisma.WorkoutCreateInput): Promise<Workout>
  findById(id: string): Promise<Workout | null>
  findAllByUser(userId: string): Promise<
    (Workout & {
      exercises: {
        id: string
        exerciseId: string
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
      schedules: {
        id: string
        dayOfWeek: number
      }[]
    })[]
  >
}

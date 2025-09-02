import { Prisma, Workout } from '@prisma/client'

export type WorkoutWithDetails = Prisma.WorkoutGetPayload<{
  include: {
    exercises: {
      include: {
        exercise: {
          select: {
            id: true
            name: true
            category: true
            type: true
          }
        }
      }
    }
    schedules: true
  }
}>

export interface WorkoutsRepository {
  create(data: Prisma.WorkoutCreateInput): Promise<Workout>
  findById(id: string): Promise<Workout | null>
  findByIdWithDetails(id: string): Promise<WorkoutWithDetails | null>
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
  update(
    id: string,
    data: { name?: string; description?: string | null },
  ): Promise<Workout>
}

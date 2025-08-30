import { Prisma, Workout } from '@prisma/client'

export interface WorkoutsRepository {
  create(data: Prisma.WorkoutCreateInput): Promise<Workout>
}

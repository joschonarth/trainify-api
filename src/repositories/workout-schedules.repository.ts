import { Prisma } from '@prisma/client'

export interface WorkoutSchedulesRepository {
  assignDaysToWorkout(
    data: Prisma.WorkoutScheduleCreateManyInput[],
  ): Promise<void>
}

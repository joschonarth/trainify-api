import { Prisma, WorkoutSchedule } from '@prisma/client'

export interface WorkoutSchedulesRepository {
  assignDaysToWorkout(
    data: Prisma.WorkoutScheduleCreateManyInput[],
  ): Promise<void>
  findDaysByWorkout(workoutId: string): Promise<WorkoutSchedule[]>
}

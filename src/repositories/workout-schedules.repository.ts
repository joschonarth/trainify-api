import { Prisma, WorkoutSchedule } from '@prisma/client'

export interface WorkoutSchedulesRepository {
  assignDaysToWorkout(
    data: Prisma.WorkoutScheduleCreateManyInput[],
  ): Promise<void>
  findDaysByWorkout(workoutId: string): Promise<WorkoutSchedule[]>
  findById(id: string): Promise<WorkoutSchedule | null>
  updateDay(id: string, dayOfWeek: number): Promise<WorkoutSchedule>
  delete(id: string): Promise<void>
}

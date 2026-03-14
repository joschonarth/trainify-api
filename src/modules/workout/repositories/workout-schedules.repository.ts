import type { Prisma, WorkoutSchedule } from '@prisma/client'

export interface WorkoutScheduleWithWorkout extends WorkoutSchedule {
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

export interface WorkoutSchedulesRepository {
  assignDaysToWorkout(
    data: Prisma.WorkoutScheduleCreateManyInput[]
  ): Promise<void>
  findDaysByWorkout(workoutId: string): Promise<WorkoutSchedule[]>
  findById(id: string): Promise<WorkoutSchedule | null>
  findByUserAndDay(
    userId: string,
    dayOfWeek: number
  ): Promise<WorkoutScheduleWithWorkout | null>
  updateDay(id: string, dayOfWeek: number): Promise<WorkoutSchedule>
  delete(id: string): Promise<void>
}

import type { Prisma, WorkoutSchedule } from 'generated/prisma'

export interface WorkoutScheduleWithWorkout extends WorkoutSchedule {
  workout: {
    id: string
    name: string
    exercises: {
      id: string
      exerciseId: string
      position: number
      defaultSets: number | null
      defaultReps: number | null
      defaultWeight: number | null
      exercise: {
        id: string
        name: string
        category: string | null
        type: string | null
        measurement: 'REPS' | 'DURATION'
        archivedAt: Date | null
      }
    }[]
  }
}

export interface WorkoutSchedulesRepository {
  replaceDaysForWorkout(
    workoutId: string,
    userId: string,
    daysOfWeek: number[]
  ): Promise<boolean>
  assignDaysToWorkout(
    data: Prisma.WorkoutScheduleCreateManyInput[]
  ): Promise<void>
  findDaysByWorkout(workoutId: string): Promise<WorkoutSchedule[]>
  findDaysByUser(userId: string): Promise<WorkoutSchedule[]>
  findById(id: string): Promise<WorkoutSchedule | null>
  findByUserAndDay(
    userId: string,
    dayOfWeek: number
  ): Promise<WorkoutScheduleWithWorkout | null>
  updateDay(id: string, dayOfWeek: number): Promise<WorkoutSchedule | null>
  delete(id: string): Promise<void>
}

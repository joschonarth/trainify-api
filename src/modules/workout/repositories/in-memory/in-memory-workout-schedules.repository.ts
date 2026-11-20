import { randomUUID } from 'node:crypto'
import type { Prisma, WorkoutSchedule } from 'generated/prisma'
import type {
  WorkoutSchedulesRepository,
  WorkoutScheduleWithWorkout,
} from '../workout-schedules.repository'

function uniqueConstraintError(): Error & { code: 'P2002' } {
  return Object.assign(new Error('Unique schedule day constraint failed.'), {
    code: 'P2002' as const,
  })
}

export class InMemoryWorkoutSchedulesRepository
  implements WorkoutSchedulesRepository
{
  items: WorkoutSchedule[] = []
  schedulesWithWorkouts: WorkoutScheduleWithWorkout[] = []

  replaceDaysForWorkout(
    workoutId: string,
    userId: string,
    daysOfWeek: number[]
  ): Promise<void> {
    const conflicts = this.items.some(
      (item) =>
        item.userId === userId &&
        item.workoutId !== workoutId &&
        daysOfWeek.includes(item.dayOfWeek)
    )
    if (conflicts) {
      throw uniqueConstraintError()
    }
    const retained = this.items.filter((item) => item.workoutId !== workoutId)
    this.items = [
      ...retained,
      ...daysOfWeek.map((dayOfWeek) => ({
        id: randomUUID(),
        workoutId,
        userId,
        dayOfWeek,
      })),
    ]
    return Promise.resolve()
  }

  assignDaysToWorkout(
    data: Prisma.WorkoutScheduleCreateManyInput[]
  ): Promise<void> {
    for (const item of data) {
      if (
        this.items.some(
          (existing) =>
            existing.userId === item.userId &&
            existing.dayOfWeek === item.dayOfWeek
        )
      ) {
        throw uniqueConstraintError()
      }
    }
    this.items.push(
      ...data.map((item) => ({
        id: item.id ?? randomUUID(),
        workoutId: item.workoutId,
        userId: item.userId,
        dayOfWeek: item.dayOfWeek,
      }))
    )
    return Promise.resolve()
  }

  findDaysByWorkout(workoutId: string): Promise<WorkoutSchedule[]> {
    return Promise.resolve(
      this.items.filter((item) => item.workoutId === workoutId)
    )
  }

  findDaysByUser(userId: string): Promise<WorkoutSchedule[]> {
    return Promise.resolve(this.items.filter((item) => item.userId === userId))
  }

  findById(id: string): Promise<WorkoutSchedule | null> {
    return Promise.resolve(this.items.find((item) => item.id === id) ?? null)
  }

  findByUserAndDay(
    userId: string,
    dayOfWeek: number
  ): Promise<WorkoutScheduleWithWorkout | null> {
    return Promise.resolve(
      this.schedulesWithWorkouts.find(
        (item) => item.userId === userId && item.dayOfWeek === dayOfWeek
      ) ?? null
    )
  }

  async updateDay(id: string, dayOfWeek: number): Promise<WorkoutSchedule> {
    const schedule = await this.findById(id)
    if (!schedule) {
      throw new Error('Schedule not found.')
    }
    if (
      this.items.some(
        (item) =>
          item.id !== id &&
          item.userId === schedule.userId &&
          item.dayOfWeek === dayOfWeek
      )
    ) {
      throw uniqueConstraintError()
    }
    const updated = { ...schedule, dayOfWeek }
    this.items = this.items.map((item) => (item.id === id ? updated : item))
    return updated
  }

  delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id)
    return Promise.resolve()
  }
}

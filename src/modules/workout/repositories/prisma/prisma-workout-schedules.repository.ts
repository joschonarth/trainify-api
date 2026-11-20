import dayjs from 'dayjs'
import type { Prisma, PrismaClient, WorkoutSchedule } from 'generated/prisma'
import { prisma } from '@/lib/prisma'
import {
  PrismaStreakPlansRepository,
  scheduleStreakPlan,
} from '@/modules/gamification/streak/repositories/prisma/prisma-streak-plans.repository'

import type {
  WorkoutSchedulesRepository,
  WorkoutScheduleWithWorkout,
} from '../workout-schedules.repository'

export class PrismaWorkoutSchedulesRepository
  implements WorkoutSchedulesRepository
{
  constructor(private readonly client: PrismaClient = prisma) {}
  async replaceDaysForWorkout(
    workoutId: string,
    userId: string,
    daysOfWeek: number[]
  ): Promise<boolean> {
    return await this.client.$transaction(async (transaction) => {
      await transaction.$queryRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`
      await transaction.$queryRaw`SELECT id FROM workouts WHERE id = ${workoutId} AND "userId" = ${userId} FOR UPDATE`
      const active = await transaction.workout.findFirst({
        where: { id: workoutId, userId, archivedAt: null },
        select: { id: true },
      })
      if (!active) {
        return false
      }
      const conflicts = await transaction.workoutSchedule.findMany({
        where: {
          userId,
          dayOfWeek: { in: daysOfWeek },
          workoutId: { not: workoutId },
        },
      })
      if (conflicts.length > 0) {
        throw Object.assign(new Error('Unique constraint failed.'), {
          code: 'P2002',
        })
      }
      await transaction.workoutSchedule.deleteMany({ where: { workoutId } })
      if (daysOfWeek.length > 0) {
        await transaction.workoutSchedule.createMany({
          data: daysOfWeek.map((dayOfWeek) => ({
            workoutId,
            userId,
            dayOfWeek,
          })),
        })
      }
      await scheduleStreakPlan(transaction, userId)
      return true
    })
  }

  async assignDaysToWorkout(
    data: Prisma.WorkoutScheduleCreateManyInput[]
  ): Promise<void> {
    for (const userId of [...new Set(data.map((item) => item.userId))].sort()) {
      await this.client.$transaction(async (transaction) => {
        await transaction.$queryRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`
        await transaction.workoutSchedule.createMany({
          data: data.filter((item) => item.userId === userId),
        })
        await scheduleStreakPlan(transaction, userId)
      })
    }
  }

  async findDaysByWorkout(workoutId: string): Promise<WorkoutSchedule[]> {
    return await this.client.workoutSchedule.findMany({
      where: { workoutId },
    })
  }

  async findDaysByUser(userId: string): Promise<WorkoutSchedule[]> {
    return await this.client.workoutSchedule.findMany({ where: { userId } })
  }

  async findById(id: string): Promise<WorkoutSchedule | null> {
    return await this.client.workoutSchedule.findUnique({ where: { id } })
  }

  async findByUserAndDay(
    userId: string,
    dayOfWeek: number
  ): Promise<WorkoutScheduleWithWorkout | null> {
    const tracking = await new PrismaStreakPlansRepository(
      this.client
    ).findByUser(userId)
    if (tracking) {
      const today = dayjs().tz(tracking.timezone).format('YYYY-MM-DD')
      const version = tracking.versions
        .filter((item) => item.effectiveDate <= today)
        .at(-1)
      if (version) {
        const workoutId = version.workouts[String(dayOfWeek)]
        if (!workoutId) {
          return null
        }
        const workout = await this.client.workout.findUnique({
          where: { id: workoutId, userId },
          include: {
            exercises: {
              where: { exercise: { archivedAt: null } },
              include: { exercise: true },
            },
          },
        })
        return workout
          ? { id: 'historical-plan', userId, workoutId, dayOfWeek, workout }
          : null
      }
    }
    return await this.client.workoutSchedule.findFirst({
      where: {
        dayOfWeek,
        userId,
        workout: { archivedAt: null },
      },
      include: {
        workout: {
          include: {
            exercises: {
              where: { exercise: { archivedAt: null } },
              include: { exercise: true },
            },
          },
        },
      },
    })
  }

  async updateDay(
    id: string,
    dayOfWeek: number
  ): Promise<WorkoutSchedule | null> {
    return await this.client.$transaction(async (transaction) => {
      const original = await transaction.workoutSchedule.findUnique({
        where: { id },
      })
      if (!original) {
        return null
      }
      await transaction.$queryRaw`SELECT id FROM users WHERE id = ${original.userId} FOR UPDATE`
      await transaction.$queryRaw`SELECT id FROM workouts WHERE id = ${original.workoutId} FOR UPDATE`
      const schedule = await transaction.workoutSchedule.findFirst({
        where: { id, workout: { archivedAt: null } },
      })
      if (!schedule) {
        return null
      }
      const updated = await transaction.workoutSchedule.update({
        where: { id },
        data: { dayOfWeek },
      })
      await scheduleStreakPlan(transaction, original.userId)
      return updated
    })
  }

  async delete(id: string): Promise<void> {
    await this.client.$transaction(async (transaction) => {
      const original = await transaction.workoutSchedule.findUnique({
        where: { id },
      })
      if (!original) {
        return
      }
      await transaction.$queryRaw`SELECT id FROM users WHERE id = ${original.userId} FOR UPDATE`
      await transaction.workoutSchedule.deleteMany({ where: { id } })
      await scheduleStreakPlan(transaction, original.userId)
    })
  }
}

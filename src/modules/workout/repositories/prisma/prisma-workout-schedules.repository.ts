import type { Prisma, WorkoutSchedule } from 'generated/prisma'

import { prisma } from '@/lib/prisma'

import type {
  WorkoutSchedulesRepository,
  WorkoutScheduleWithWorkout,
} from '../workout-schedules.repository'

export class PrismaWorkoutSchedulesRepository
  implements WorkoutSchedulesRepository
{
  async replaceDaysForWorkout(
    workoutId: string,
    userId: string,
    daysOfWeek: number[]
  ): Promise<boolean> {
    return await prisma.$transaction(async (transaction) => {
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
      return true
    })
  }

  async assignDaysToWorkout(
    data: Prisma.WorkoutScheduleCreateManyInput[]
  ): Promise<void> {
    await prisma.workoutSchedule.createMany({
      data,
    })
  }

  async findDaysByWorkout(workoutId: string): Promise<WorkoutSchedule[]> {
    return await prisma.workoutSchedule.findMany({
      where: { workoutId },
    })
  }

  async findDaysByUser(userId: string): Promise<WorkoutSchedule[]> {
    return await prisma.workoutSchedule.findMany({ where: { userId } })
  }

  async findById(id: string): Promise<WorkoutSchedule | null> {
    return await prisma.workoutSchedule.findUnique({ where: { id } })
  }

  async findByUserAndDay(
    userId: string,
    dayOfWeek: number
  ): Promise<WorkoutScheduleWithWorkout | null> {
    return await prisma.workoutSchedule.findFirst({
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
    return await prisma.$transaction(async (transaction) => {
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
      return await transaction.workoutSchedule.update({
        where: { id },
        data: { dayOfWeek },
      })
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.workoutSchedule.delete({
      where: { id },
    })
  }
}

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
  ): Promise<void> {
    await prisma.$transaction(async (transaction) => {
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

  async updateDay(id: string, dayOfWeek: number): Promise<WorkoutSchedule> {
    return await prisma.workoutSchedule.update({
      where: { id },
      data: { dayOfWeek },
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.workoutSchedule.delete({
      where: { id },
    })
  }
}

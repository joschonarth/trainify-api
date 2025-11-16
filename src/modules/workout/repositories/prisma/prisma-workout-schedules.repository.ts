import { Prisma, WorkoutSchedule } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import {
  WorkoutSchedulesRepository,
  WorkoutScheduleWithWorkout,
} from '../workout-schedules.repository'

export class PrismaWorkoutSchedulesRepository
  implements WorkoutSchedulesRepository
{
  async assignDaysToWorkout(
    data: Prisma.WorkoutScheduleCreateManyInput[],
  ): Promise<void> {
    await prisma.workoutSchedule.createMany({
      data,
    })
  }

  async findDaysByWorkout(workoutId: string): Promise<WorkoutSchedule[]> {
    return prisma.workoutSchedule.findMany({
      where: { workoutId },
    })
  }

  async findById(id: string): Promise<WorkoutSchedule | null> {
    return prisma.workoutSchedule.findUnique({ where: { id } })
  }

  async findByUserAndDay(
    userId: string,
    dayOfWeek: number,
  ): Promise<WorkoutScheduleWithWorkout | null> {
    return prisma.workoutSchedule.findFirst({
      where: {
        dayOfWeek,
        userId,
      },
      include: {
        workout: {
          include: {
            exercises: { include: { exercise: true } },
          },
        },
      },
    })
  }

  async updateDay(id: string, dayOfWeek: number): Promise<WorkoutSchedule> {
    return prisma.workoutSchedule.update({
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

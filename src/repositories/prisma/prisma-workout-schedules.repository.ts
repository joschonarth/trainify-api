import { Prisma, WorkoutSchedule } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import { WorkoutSchedulesRepository } from '../workout-schedules.repository'

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
}

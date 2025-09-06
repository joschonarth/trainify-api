import { Prisma, WorkoutSession } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import {
  WorkoutSessionsRepository,
  WorkoutSessionWithWorkout,
} from '../workout-sessions.repository'

export class PrismaWorkoutSessionsRepository
  implements WorkoutSessionsRepository
{
  async findByUserAndDate(
    userId: string,
    date: Date,
  ): Promise<WorkoutSession | null> {
    return prisma.workoutSession.findFirst({
      where: {
        userId,
        date: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
        },
      },
      include: {
        workout: {
          include: {
            exercises: {
              include: { exercise: true },
            },
          },
        },
        logs: {
          include: { exercise: true },
        },
      },
    })
  }

  async findByIdWithWorkout(
    id: string,
  ): Promise<WorkoutSessionWithWorkout | null> {
    return prisma.workoutSession.findUnique({
      where: { id },
      include: {
        workout: {
          include: {
            exercises: {
              include: { exercise: true },
            },
          },
        },
      },
    }) as unknown as WorkoutSessionWithWorkout | null
  }

  async create(
    data: Prisma.WorkoutSessionUncheckedCreateInput,
  ): Promise<WorkoutSession> {
    return prisma.workoutSession.create({
      data,
    })
  }
}

import { Prisma, WorkoutSession } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import {
  WorkoutSessionsRepository,
  WorkoutSessionWithWorkout,
  WorkoutSessionWithWorkoutAndLogs,
} from '../workout-sessions.repository'

export class PrismaWorkoutSessionsRepository
  implements WorkoutSessionsRepository
{
  async findById(id: string): Promise<WorkoutSession | null> {
    // 🔹 novo
    return prisma.workoutSession.findUnique({
      where: { id },
      include: {
        workout: true,
        logs: true,
      },
    })
  }

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

  async findAllByUser(
    userId: string,
  ): Promise<WorkoutSessionWithWorkoutAndLogs[]> {
    return prisma.workoutSession.findMany({
      where: { userId },
      include: {
        workout: {
          include: { exercises: { include: { exercise: true } } },
        },
        logs: { include: { exercise: true } },
      },
      orderBy: { date: 'desc' },
    }) as unknown as WorkoutSessionWithWorkoutAndLogs[]
  }

  async create(
    data: Prisma.WorkoutSessionUncheckedCreateInput,
  ): Promise<WorkoutSession> {
    return prisma.workoutSession.create({
      data,
    })
  }

  async updateCompleted(
    id: string,
    completed: boolean,
  ): Promise<WorkoutSession> {
    return prisma.workoutSession.update({
      where: { id },
      data: { completed },
    })
  }
}

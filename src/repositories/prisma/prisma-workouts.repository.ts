import { Prisma, Workout } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import { WorkoutsRepository } from '../workouts.repository'

export class PrismaWorkoutsRepository implements WorkoutsRepository {
  async create(data: Prisma.WorkoutCreateInput): Promise<Workout> {
    return prisma.workout.create({ data })
  }

  async findAllByUser(userId: string) {
    return prisma.workout.findMany({
      where: { userId },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
        schedules: true,
      },
    })
  }
}

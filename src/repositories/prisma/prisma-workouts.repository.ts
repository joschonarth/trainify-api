import { Prisma, Workout } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import { WorkoutsRepository } from '../workouts.repository'

export class PrismaWorkoutsRepository implements WorkoutsRepository {
  async create(data: Prisma.WorkoutCreateInput): Promise<Workout> {
    return prisma.workout.create({ data })
  }
}

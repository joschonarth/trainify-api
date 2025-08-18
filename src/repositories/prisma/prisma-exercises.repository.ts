import { Exercise, Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import { ExercisesRepository } from '../exercises.repository'

export class PrismaExercisesRepository implements ExercisesRepository {
  async create(data: Prisma.ExerciseCreateInput): Promise<Exercise> {
    return prisma.exercise.create({ data })
  }

  async findAllGlobals(): Promise<Exercise[]> {
    const exercises = await prisma.exercise.findMany({
      where: {
        isCustom: false,
      },
    })

    return exercises
  }
}

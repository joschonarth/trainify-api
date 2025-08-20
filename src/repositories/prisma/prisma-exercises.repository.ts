import { Exercise, Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import { ExercisesRepository } from '../exercises.repository'

export class PrismaExercisesRepository implements ExercisesRepository {
  async create(data: Prisma.ExerciseCreateInput): Promise<Exercise> {
    return prisma.exercise.create({ data })
  }

  async findAllGlobals(query: string, page: number): Promise<Exercise[]> {
    const ITEMS_PER_PAGE = 10

    const exercises = await prisma.exercise.findMany({
      where: {
        isCustom: false,
        name: {
          contains: query,
        },
      },
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
    })

    return exercises
  }
}

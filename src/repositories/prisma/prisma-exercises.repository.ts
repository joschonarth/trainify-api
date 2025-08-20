import { Exercise, Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import { ExercisesRepository } from '../exercises.repository'

export class PrismaExercisesRepository implements ExercisesRepository {
  async create(data: Prisma.ExerciseCreateInput): Promise<Exercise> {
    return prisma.exercise.create({ data })
  }

  async findById(id: string): Promise<Exercise | null> {
    return prisma.exercise.findUnique({
      where: { id },
    })
  }

  async findAllGlobals(
    query: string,
    category: string,
    page: number = 1,
  ): Promise<Exercise[]> {
    const ITEMS_PER_PAGE = 10

    const exercises = await prisma.exercise.findMany({
      where: {
        isCustom: false,
        ...(query && {
          name: {
            contains: query,
            // TODO: add mode: 'insensitive' when migrating DB
          },
        }),
        ...(category && {
          category: {
            equals: category,
            // TODO: add mode: 'insensitive' when migrating DB
          },
        }),
      },
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
      orderBy: { name: 'asc' },
    })

    return exercises
  }
}

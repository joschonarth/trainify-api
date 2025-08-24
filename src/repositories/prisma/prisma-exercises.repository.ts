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

  async findByNameAndUser(
    name: string,
    userId: string,
  ): Promise<Exercise | null> {
    return prisma.exercise.findFirst({
      where: {
        name,
        userId,
        isCustom: true,
      },
    })
  }

  async update(
    exerciseId: string,
    data: {
      name?: string
      category?: string | null
      type?: string | null
      sets?: number | null
      reps?: number | null
      weight?: number | null
    },
  ): Promise<Exercise> {
    const prismaData: Prisma.ExerciseUpdateInput = {}

    if (data.name !== undefined) prismaData.name = data.name
    if (data.category !== undefined) prismaData.category = data.category
    if (data.type !== undefined) prismaData.type = data.type
    if (data.sets !== undefined) prismaData.sets = data.sets
    if (data.reps !== undefined) prismaData.reps = data.reps
    if (data.weight !== undefined) prismaData.weight = data.weight

    return prisma.exercise.update({
      where: { id: exerciseId },
      data: prismaData,
    })
  }
}

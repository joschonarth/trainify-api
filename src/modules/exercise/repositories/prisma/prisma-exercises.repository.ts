import type {
  Exercise,
  ExerciseCategory,
  ExerciseType,
  Prisma,
} from 'generated/prisma'

import { prisma } from '@/lib/prisma'

import type { ExercisesRepository } from '../exercises.repository'

export class PrismaExercisesRepository implements ExercisesRepository {
  async create(data: Prisma.ExerciseCreateInput): Promise<Exercise> {
    return await prisma.exercise.create({ data })
  }

  async findById(id: string): Promise<Exercise | null> {
    return await prisma.exercise.findUnique({
      where: { id },
    })
  }

  async findAllGlobals(
    query: string,
    category: ExerciseCategory | null,
    page = 1
  ): Promise<Exercise[]> {
    const ITEMS_PER_PAGE = 10

    return await prisma.exercise.findMany({
      where: {
        isCustom: false,
        ...(query && {
          name: {
            contains: query,
            // TODO: add mode: 'insensitive' when migrating DB
          },
        }),
        ...(category && {
          category,
          // TODO: add mode: 'insensitive' when migrating DB
        }),
      },
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
      orderBy: { name: 'asc' },
    })
  }

  async findByNameAndUser(
    name: string,
    userId: string
  ): Promise<Exercise | null> {
    return await prisma.exercise.findFirst({
      where: {
        name,
        userId,
        isCustom: true,
      },
    })
  }

  async findManyByUser(
    userId: string,
    query?: string | null,
    category?: ExerciseCategory | null,
    type?: ExerciseType | null
  ): Promise<Exercise[]> {
    return await prisma.exercise.findMany({
      where: {
        userId,
        ...(query && { query }),
        ...(category && { category }),
        ...(type && { type }),
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async update(
    exerciseId: string,
    data: {
      name?: string
      category?: ExerciseCategory | null
      type?: ExerciseType | null
    }
  ): Promise<Exercise> {
    const prismaData: Prisma.ExerciseUpdateInput = {}

    if (data.name !== undefined) {
      prismaData.name = data.name
    }
    if (data.category !== undefined) {
      prismaData.category = data.category
    }
    if (data.type !== undefined) {
      prismaData.type = data.type
    }

    return await prisma.exercise.update({
      where: { id: exerciseId },
      data: prismaData,
    })
  }

  async delete(exerciseId: string) {
    await prisma.$transaction([
      prisma.myExercise.deleteMany({ where: { exerciseId } }),
      prisma.workoutExercise.deleteMany({ where: { exerciseId } }),
      prisma.exercise.delete({ where: { id: exerciseId } }),
    ])
  }
}

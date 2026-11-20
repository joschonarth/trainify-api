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

  async findById(
    id: string,
    includeArchived = false
  ): Promise<Exercise | null> {
    return await prisma.exercise.findUnique({
      where: {
        id,
        ...(!includeArchived && { archivedAt: null }),
      },
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
        userId: null,
        isCustom: false,
        archivedAt: null,
        ...(query && {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        }),
        ...(category && {
          category,
        }),
      },
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
      orderBy: { name: 'asc' },
    })
  }

  async findGlobalById(id: string, includeArchived = false) {
    return await prisma.exercise.findFirst({
      where: {
        id,
        userId: null,
        isCustom: false,
        ...(!includeArchived && { archivedAt: null }),
      },
    })
  }

  async findAllGlobalsForAdmin({
    query,
    category,
    status,
    page,
  }: {
    query: string
    category: ExerciseCategory | null
    status: 'active' | 'archived' | 'all'
    page: number
  }) {
    return await prisma.exercise.findMany({
      where: {
        userId: null,
        isCustom: false,
        ...(status === 'active' && { archivedAt: null }),
        ...(status === 'archived' && { archivedAt: { not: null } }),
        ...(query && { name: { contains: query, mode: 'insensitive' } }),
        ...(category && { category }),
      },
      take: 10,
      skip: (page - 1) * 10,
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    })
  }

  async findGlobalByName(name: string, excludeId?: string) {
    return await prisma.exercise.findFirst({
      where: {
        userId: null,
        isCustom: false,
        name: { equals: name, mode: 'insensitive' },
        ...(excludeId && { id: { not: excludeId } }),
      },
    })
  }

  async findByNameAndUser(
    name: string,
    userId: string,
    excludeExerciseId?: string,
    includeArchived = false
  ): Promise<Exercise | null> {
    return await prisma.exercise.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        userId,
        isCustom: true,
        ...(!includeArchived && { archivedAt: null }),
        ...(excludeExerciseId && { id: { not: excludeExerciseId } }),
      },
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

  async archive(exerciseId: string): Promise<void> {
    await prisma.exercise.update({
      where: { id: exerciseId },
      data: { archivedAt: new Date() },
    })
  }

  async deleteUnlinked(exerciseId: string) {
    await prisma.exercise.delete({ where: { id: exerciseId } })
  }
}

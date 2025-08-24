import { Exercise, MyExercise } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import { MyExercisesRepository } from '../my-exercises.repository'

export class PrismaMyExercisesRepository implements MyExercisesRepository {
  async addExercise(userId: string, exerciseId: string): Promise<MyExercise> {
    const myExercise = await prisma.myExercise.create({
      data: {
        userId,
        exerciseId,
      },
    })

    return myExercise
  }

  async findByUserAndExercise(
    userId: string,
    exerciseId: string,
  ): Promise<MyExercise | null> {
    const myExercise = await prisma.myExercise.findUnique({
      where: {
        userId_exerciseId: {
          userId,
          exerciseId,
        },
      },
    })

    return myExercise
  }

  async findAllByUser(
    userId: string,
    query?: string,
    category?: string,
    page: number = 1,
  ): Promise<(MyExercise & { exercise: Exercise })[]> {
    const ITEMS_PER_PAGE = 10

    const myExercises = await prisma.myExercise.findMany({
      where: {
        userId,
        exercise: {
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
      },
      include: { exercise: true },
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
      orderBy: {
        exercise: {
          name: 'asc',
        },
      },
    })

    return myExercises
  }

  async findById(id: string): Promise<MyExercise | null> {
    return prisma.myExercise.findUnique({
      where: { id },
      include: { exercise: true },
    })
  }

  async deleteById(id: string): Promise<void> {
    await prisma.myExercise.delete({
      where: { id },
    })
  }
}

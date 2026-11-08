import type { Exercise, MyExercise, Prisma } from 'generated/prisma'

import { prisma } from '@/lib/prisma'

import type { MyExercisesRepository } from '../my-exercises.repository'

export class PrismaMyExercisesRepository implements MyExercisesRepository {
  async createCustomExerciseWithLibraryEntry(
    userId: string,
    data: Omit<Prisma.ExerciseCreateInput, 'user'>
  ): Promise<Exercise> {
    return await prisma.$transaction(async (transaction) => {
      const exercise = await transaction.exercise.create({
        data: {
          ...data,
          isCustom: true,
          user: { connect: { id: userId } },
        },
      })

      await transaction.myExercise.create({
        data: {
          userId,
          exerciseId: exercise.id,
        },
      })

      return exercise
    })
  }

  async archiveCustomExercise(
    userId: string,
    exerciseId: string
  ): Promise<void> {
    await prisma.$transaction(async (transaction) => {
      await transaction.exercise.update({
        where: { id: exerciseId },
        data: { archivedAt: new Date() },
      })

      await transaction.myExercise.deleteMany({
        where: { userId, exerciseId },
      })
    })
  }

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
    exerciseId: string
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
    category?: Exercise['category'],
    page = 1
  ): Promise<(MyExercise & { exercise: Exercise })[]> {
    const ITEMS_PER_PAGE = 10

    const myExercises = await prisma.myExercise.findMany({
      where: {
        userId,
        exercise: {
          archivedAt: null,
          ...(query && {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          }),
          ...(category && {
            category: {
              equals: category,
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
    return await prisma.myExercise.findUnique({
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

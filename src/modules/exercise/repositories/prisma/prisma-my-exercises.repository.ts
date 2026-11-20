import type { Exercise, MyExercise, Prisma } from 'generated/prisma'

import { prisma } from '@/lib/prisma'
import { ExerciseUnavailableError } from '@/modules/exercise/errors/exercise-unavailable.error'

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

      await transaction.workoutExercise.deleteMany({
        where: { exerciseId },
      })

      await transaction.myExercise.deleteMany({
        where: { userId, exerciseId },
      })
    })
  }

  async addExercise(userId: string, exerciseId: string): Promise<MyExercise> {
    return await prisma.$transaction(async (transaction) => {
      const exercises = await transaction.$queryRaw<Array<{ id: string }>>`
        SELECT id FROM exercises WHERE id = ${exerciseId} FOR UPDATE
      `
      const exercise = await transaction.exercise.findUnique({
        where: { id: exerciseId },
        select: { archivedAt: true },
      })
      if (!(exercises.length && exercise) || exercise.archivedAt) {
        throw new ExerciseUnavailableError()
      }
      return await transaction.myExercise.create({
        data: { userId, exerciseId },
      })
    })
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
    q?: string,
    category?: Exercise['category'],
    page = 1,
    pageSize = 20,
    type?: Exercise['type']
  ): Promise<{
    items: (MyExercise & { exercise: Exercise })[]
    total: number
  }> {
    const where: Prisma.MyExerciseWhereInput = {
      userId,
      exercise: {
        ...(q && {
          name: {
            contains: q,
            mode: 'insensitive',
          },
        }),
        ...(category && {
          category: {
            equals: category,
          },
        }),
        ...(type && {
          type: {
            equals: type,
          },
        }),
      },
    }

    const [items, total] = await Promise.all([
      prisma.myExercise.findMany({
        where,
        include: { exercise: true },
        take: pageSize,
        skip: (page - 1) * pageSize,
        orderBy: {
          exercise: {
            name: 'asc',
          },
        },
      }),
      prisma.myExercise.count({ where }),
    ])

    return { items, total }
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

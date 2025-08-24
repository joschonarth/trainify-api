import { MyExercise } from '@prisma/client'

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

  async findAllByUser(userId: string): Promise<MyExercise[]> {
    return prisma.myExercise.findMany({
      where: { userId },
      include: { exercise: true },
    })
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

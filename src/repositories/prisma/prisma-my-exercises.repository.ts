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
}

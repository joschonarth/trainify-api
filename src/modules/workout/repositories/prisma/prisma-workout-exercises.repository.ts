import type { Prisma, WorkoutExercise } from 'generated/prisma'

import { prisma } from '@/lib/prisma'

import type { WorkoutExercisesRepository } from '../workout-exercises.repository'

export class PrismaWorkoutExercisesRepository
  implements WorkoutExercisesRepository
{
  async findById(id: string): Promise<WorkoutExercise | null> {
    return await prisma.workoutExercise.findUnique({
      where: { id },
    })
  }

  async findByWorkout(workoutId: string) {
    return await prisma.workoutExercise.findMany({
      where: {
        workoutId,
        exercise: { archivedAt: null },
      },
      include: {
        exercise: {
          select: {
            id: true,
            name: true,
            category: true,
            type: true,
          },
        },
      },
      orderBy: { position: 'asc' },
    })
  }

  async findByWorkoutAndExercise(
    workoutId: string,
    exerciseId: string
  ): Promise<WorkoutExercise | null> {
    return await prisma.workoutExercise.findUnique({
      where: {
        workoutId_exerciseId: { workoutId, exerciseId },
      },
    })
  }

  async getNextPosition(workoutId: string): Promise<number> {
    const result = await prisma.workoutExercise.aggregate({
      where: { workoutId },
      _max: { position: true },
    })

    return (result._max.position ?? -1) + 1
  }

  async updatePositions(
    workoutId: string,
    exerciseIds: string[]
  ): Promise<void> {
    await prisma.$transaction(async (transaction) => {
      await Promise.all(
        exerciseIds.map((exerciseId, position) =>
          transaction.workoutExercise.update({
            where: {
              workoutId_exerciseId: { workoutId, exerciseId },
            },
            data: { position },
          })
        )
      )
    })
  }

  async removeByExerciseId(exerciseId: string): Promise<void> {
    await prisma.workoutExercise.deleteMany({
      where: { exerciseId },
    })
  }

  async addExerciseToWorkout(
    data: Prisma.WorkoutExerciseCreateInput
  ): Promise<WorkoutExercise> {
    return await prisma.workoutExercise.create({ data })
  }

  async updateDefaults(
    workoutExerciseId: string,
    data: {
      defaultSets: number | null
      defaultReps: number | null
      defaultWeight: number | null
    }
  ): Promise<WorkoutExercise> {
    return await prisma.workoutExercise.update({
      where: { id: workoutExerciseId },
      data,
    })
  }

  async removeExerciseFromWorkout(id: string): Promise<void> {
    await prisma.workoutExercise.delete({
      where: { id },
    })
  }
}

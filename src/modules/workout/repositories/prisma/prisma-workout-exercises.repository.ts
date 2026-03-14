import type { Prisma, WorkoutExercise } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import type { WorkoutExercisesRepository } from '../workout-exercises.repository'

export class PrismaWorkoutExercisesRepository
  implements WorkoutExercisesRepository
{
  async findById(id: string): Promise<WorkoutExercise | null> {
    return prisma.workoutExercise.findUnique({
      where: { id },
    })
  }

  async findByWorkout(workoutId: string) {
    return prisma.workoutExercise.findMany({
      where: { workoutId },
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
    })
  }

  async findByWorkoutAndExercise(
    workoutId: string,
    exerciseId: string
  ): Promise<WorkoutExercise | null> {
    return prisma.workoutExercise.findUnique({
      where: {
        workoutId_exerciseId: { workoutId, exerciseId },
      },
    })
  }

  async addExerciseToWorkout(
    data: Prisma.WorkoutExerciseCreateInput
  ): Promise<WorkoutExercise> {
    return prisma.workoutExercise.create({ data })
  }

  async updateDefaults(
    workoutExerciseId: string,
    data: {
      defaultSets: number | null
      defaultReps: number | null
      defaultWeight: number | null
    }
  ): Promise<WorkoutExercise> {
    return prisma.workoutExercise.update({
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

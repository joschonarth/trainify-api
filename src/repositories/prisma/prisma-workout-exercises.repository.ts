import { Prisma, WorkoutExercise } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import { WorkoutExercisesRepository } from '../workout-exercises.repository'

export class PrismaWorkoutExercisesRepository
  implements WorkoutExercisesRepository
{
  async findById(id: string): Promise<WorkoutExercise | null> {
    return prisma.workoutExercise.findUnique({
      where: { id },
    })
  }

  async addExerciseToWorkout(
    data: Prisma.WorkoutExerciseCreateInput,
  ): Promise<WorkoutExercise> {
    return prisma.workoutExercise.create({ data })
  }

  async updateDefaults(
    workoutExerciseId: string,
    data: {
      defaultSets: number | null
      defaultReps: number | null
      defaultWeight: number | null
    },
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

import { Prisma, WorkoutExercise } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import { WorkoutExercisesRepository } from '../workout-exercises.repository'

export class PrismaWorkoutExercisesRepository
  implements WorkoutExercisesRepository
{
  async addExerciseToWorkout(
    data: Prisma.WorkoutExerciseCreateInput,
  ): Promise<WorkoutExercise> {
    return prisma.workoutExercise.create({ data })
  }
}

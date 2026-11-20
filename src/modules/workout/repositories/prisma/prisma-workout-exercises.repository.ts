import type { Prisma, WorkoutExercise } from 'generated/prisma'

import { prisma } from '@/lib/prisma'
import { ExerciseUnavailableError } from '@/modules/exercise/errors/exercise-unavailable.error'

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
      await transaction.$queryRaw`SELECT id FROM workouts WHERE id = ${workoutId} FOR UPDATE`
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

  async addExerciseAtNextPosition(
    workoutId: string,
    data: Prisma.WorkoutExerciseCreateInput
  ): Promise<WorkoutExercise> {
    return await prisma.$transaction(async (transaction) => {
      const exerciseId = data.exercise?.connect?.id
      if (exerciseId) {
        const rows = await transaction.$queryRaw<Array<{ id: string }>>`
          SELECT id FROM exercises WHERE id = ${exerciseId} FOR UPDATE
        `
        const exercise = await transaction.exercise.findUnique({
          where: { id: exerciseId },
          select: { archivedAt: true },
        })
        if (!(rows.length && exercise) || exercise.archivedAt) {
          throw new ExerciseUnavailableError()
        }
      }
      await transaction.$queryRaw`SELECT id FROM workouts WHERE id = ${workoutId} FOR UPDATE`
      const aggregate = await transaction.workoutExercise.aggregate({
        where: { workoutId },
        _max: { position: true },
      })
      return await transaction.workoutExercise.create({
        data: { ...data, position: (aggregate._max.position ?? -1) + 1 },
      })
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

  async removeAndNormalizePositions(
    workoutId: string,
    workoutExerciseId: string
  ): Promise<void> {
    await prisma.$transaction(async (transaction) => {
      await transaction.$queryRaw`SELECT id FROM workouts WHERE id = ${workoutId} FOR UPDATE`
      await transaction.workoutExercise.delete({
        where: { id: workoutExerciseId },
      })
      const remaining = await transaction.workoutExercise.findMany({
        where: { workoutId },
        orderBy: [{ position: 'asc' }, { id: 'asc' }],
        select: { id: true },
      })
      for (const [position, exercise] of remaining.entries()) {
        await transaction.workoutExercise.update({
          where: { id: exercise.id },
          data: { position },
        })
      }
    })
  }
}

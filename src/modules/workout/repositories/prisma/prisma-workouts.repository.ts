import type { Prisma, Workout } from 'generated/prisma'

import { prisma } from '@/lib/prisma'

import type {
  WorkoutsRepository,
  WorkoutWithDetails,
} from '../workouts.repository'

export class PrismaWorkoutsRepository implements WorkoutsRepository {
  async create(data: Prisma.WorkoutCreateInput): Promise<Workout> {
    return await prisma.workout.create({ data })
  }

  async findById(id: string): Promise<Workout | null> {
    return await prisma.workout.findUnique({
      where: { id, archivedAt: null },
    })
  }

  async findByIdIncludingArchived(id: string): Promise<Workout | null> {
    return await prisma.workout.findUnique({ where: { id } })
  }

  async findByUserAndExercise(
    userId: string,
    exerciseId: string
  ): Promise<Pick<Workout, 'id' | 'name'>[]> {
    return await prisma.workout.findMany({
      where: {
        userId,
        archivedAt: null,
        exercises: {
          some: { exerciseId },
        },
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    })
  }

  async findByIdWithDetails(id: string): Promise<WorkoutWithDetails | null> {
    return await prisma.workout.findUnique({
      where: { id },
      include: {
        exercises: {
          where: { exercise: { archivedAt: null } },
          orderBy: { position: 'asc' },
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
        },
        schedules: true,
      },
    })
  }

  async findAllByUser(userId: string) {
    return await prisma.workout.findMany({
      where: { userId, archivedAt: null },
      include: {
        exercises: {
          where: { exercise: { archivedAt: null } },
          orderBy: { position: 'asc' },
          include: {
            exercise: true,
          },
        },
        schedules: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async update(
    id: string,
    data: { name?: string; description?: string | null }
  ): Promise<Workout> {
    return await prisma.workout.update({
      where: { id, archivedAt: null },
      data,
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.workout.delete({
      where: { id },
    })
  }

  async archive(id: string): Promise<void> {
    await prisma.$transaction(async (transaction) => {
      await transaction.workoutSchedule.deleteMany({ where: { workoutId: id } })
      await transaction.workout.updateMany({
        where: { id, archivedAt: null },
        data: { archivedAt: new Date() },
      })
    })
  }
}

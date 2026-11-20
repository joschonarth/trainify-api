import type { Prisma, PrismaClient, Workout } from 'generated/prisma'
import { prisma } from '@/lib/prisma'
import { scheduleStreakPlan } from '@/modules/gamification/streak/repositories/prisma/prisma-streak-plans.repository'

import type {
  WorkoutsRepository,
  WorkoutWithDetails,
} from '../workouts.repository'

export class PrismaWorkoutsRepository implements WorkoutsRepository {
  constructor(private readonly client: PrismaClient = prisma) {}
  async create(data: Prisma.WorkoutCreateInput): Promise<Workout> {
    return await this.client.workout.create({ data })
  }

  async findById(id: string): Promise<Workout | null> {
    return await this.client.workout.findUnique({
      where: { id, archivedAt: null },
    })
  }

  async findByIdIncludingArchived(id: string): Promise<Workout | null> {
    return await this.client.workout.findUnique({ where: { id } })
  }

  async findByUserAndExercise(
    userId: string,
    exerciseId: string
  ): Promise<Pick<Workout, 'id' | 'name'>[]> {
    return await this.client.workout.findMany({
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
    return await this.client.workout.findUnique({
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
    return await this.client.workout.findMany({
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

  async findPageByUser({
    userId,
    page,
    pageSize,
    search,
  }: {
    userId: string
    page: number
    pageSize: number
    search?: string
  }) {
    const where: Prisma.WorkoutWhereInput = {
      userId,
      archivedAt: null,
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
    }
    const [workouts, total] = await Promise.all([
      this.client.workout.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          exercises: {
            where: { exercise: { archivedAt: null } },
            orderBy: { position: 'asc' },
            include: { exercise: true },
          },
          schedules: true,
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      }),
      this.client.workout.count({ where }),
    ])
    return { workouts, total }
  }

  async update(
    id: string,
    data: { name?: string; description?: string | null }
  ): Promise<Workout> {
    return await this.client.workout.update({
      where: { id, archivedAt: null },
      data,
    })
  }

  async delete(id: string): Promise<void> {
    await this.client.workout.delete({
      where: { id },
    })
  }

  async archive(id: string): Promise<void> {
    await this.client.$transaction(async (transaction) => {
      await transaction.$queryRaw`SELECT id FROM users WHERE id = (SELECT "userId" FROM workouts WHERE id = ${id}) FOR UPDATE`
      await transaction.$queryRaw`SELECT id FROM workouts WHERE id = ${id} FOR UPDATE`
      const workout = await transaction.workout.findUniqueOrThrow({
        where: { id },
      })
      await transaction.workoutSchedule.deleteMany({ where: { workoutId: id } })
      await transaction.workout.updateMany({
        where: { id, archivedAt: null },
        data: { archivedAt: new Date() },
      })
      await scheduleStreakPlan(transaction, workout.userId)
    })
  }
}

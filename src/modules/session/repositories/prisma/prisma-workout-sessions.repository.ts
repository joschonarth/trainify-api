import type {
  Prisma,
  WorkoutSession,
  WorkoutSessionStatus,
} from '@prisma/client'

import { prisma } from '@/lib/prisma'

import type {
  WorkoutSessionsRepository,
  WorkoutSessionWithWorkout,
} from '../workout-sessions.repository'
import { workoutSessionInclude } from './includes/workout-session.include'
import { mapWorkoutSession } from './mappers/workout-session.mapper'

export class PrismaWorkoutSessionsRepository
  implements WorkoutSessionsRepository
{
  async findById(id: string): Promise<WorkoutSession | null> {
    return prisma.workoutSession.findUnique({
      where: { id },
    })
  }

  async findByUserAndDate(
    userId: string,
    date: Date
  ): Promise<WorkoutSession | null> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    return prisma.workoutSession.findFirst({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    })
  }

  async findByIdWithWorkout(
    id: string
  ): Promise<WorkoutSessionWithWorkout | null> {
    const session = await prisma.workoutSession.findUnique({
      where: { id },
      include: workoutSessionInclude,
    })

    return session ? mapWorkoutSession(session) : null
  }

  async findAllByUser(userId: string): Promise<WorkoutSessionWithWorkout[]> {
    const sessions = await prisma.workoutSession.findMany({
      where: { userId },
      include: workoutSessionInclude,
      orderBy: { date: 'desc' },
    })

    return sessions.map(mapWorkoutSession)
  }

  async findByIdWithWorkoutAndExerciseSessions(
    id: string
  ): Promise<WorkoutSessionWithWorkout | null> {
    const session = await prisma.workoutSession.findUnique({
      where: { id },
      include: workoutSessionInclude,
    })

    return session ? mapWorkoutSession(session) : null
  }

  async findByUserAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{ id: string; date: Date; status: WorkoutSessionStatus }[]> {
    return prisma.workoutSession.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      select: {
        id: true,
        date: true,
        status: true,
      },
      orderBy: { date: 'asc' },
    })
  }

  async findManyByWorkoutAndUser(
    userId: string,
    workoutId: string
  ): Promise<WorkoutSessionWithWorkout[]> {
    const sessions = await prisma.workoutSession.findMany({
      where: { userId, workoutId },
      include: workoutSessionInclude,
      orderBy: { date: 'desc' },
    })

    return sessions.map(mapWorkoutSession)
  }

  async findManyByWorkoutId(workoutId: string, userId: string) {
    return prisma.workoutSession.findMany({
      where: {
        workoutId,
        userId,
      },
      include: {
        exerciseSessions: {
          include: {
            exercise: true,
            logs: true,
          },
        },
        workout: true,
      },
      orderBy: {
        date: 'asc',
      },
    })
  }

  async findDetailedByUserAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<WorkoutSessionWithWorkout[]> {
    const sessions = await prisma.workoutSession.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
      include: workoutSessionInclude,
      orderBy: { date: 'asc' },
    })

    return sessions.map(mapWorkoutSession)
  }

  async create(
    data: Prisma.WorkoutSessionUncheckedCreateInput
  ): Promise<WorkoutSession> {
    const workout = await prisma.workout.findUnique({
      where: { id: data.workoutId },
      include: { exercises: true },
    })

    if (!workout) {
      throw new Error('Workout not found')
    }

    return prisma.workoutSession.create({
      data: {
        ...data,
        exerciseSessions: {
          create: workout.exercises.map((we) => ({
            exerciseId: we.exerciseId,
            plannedSets: we.defaultSets ?? null,
            plannedReps: we.defaultReps ?? null,
            plannedWeight: we.defaultWeight ?? null,
          })),
        },
      },
    })
  }

  async update(
    id: string,
    data: Prisma.WorkoutSessionUpdateInput
  ): Promise<WorkoutSession> {
    return prisma.workoutSession.update({
      where: { id },
      data,
    })
  }

  async updateStatus(
    id: string,
    status: WorkoutSessionStatus
  ): Promise<WorkoutSession> {
    return prisma.workoutSession.update({
      where: { id },
      data: { status },
    })
  }

  async completeWorkoutSession(
    sessionId: string,
    updates: {
      status: WorkoutSessionStatus
      exerciseSessions: {
        id: string
        completed: boolean
        sets?: number | null
        reps?: number | null
        weight?: number | null
      }[]
    }
  ): Promise<WorkoutSessionWithWorkout> {
    return await prisma.$transaction(async (tx) => {
      await tx.workoutSession.update({
        where: { id: sessionId },
        data: { status: updates.status },
      })

      for (const ex of updates.exerciseSessions) {
        await tx.exerciseSession.update({
          where: { id: ex.id },
          data: {
            completed: ex.completed,
            plannedSets: ex.sets ?? null,
            plannedReps: ex.reps ?? null,
            plannedWeight: ex.weight ?? null,
          },
        })
      }

      const updated = await tx.workoutSession.findUnique({
        where: { id: sessionId },
        include: workoutSessionInclude,
      })

      if (!updated) {
        throw new Error('Workout session not found after update')
      }

      return mapWorkoutSession(updated)
    })
  }

  async countCompletedByUser(userId: string): Promise<number> {
    return prisma.workoutSession.count({
      where: {
        userId,
        status: 'COMPLETED',
      },
    })
  }
}

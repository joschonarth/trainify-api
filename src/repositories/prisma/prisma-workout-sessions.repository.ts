import { Prisma, WorkoutSession, WorkoutSessionStatus } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import {
  WorkoutSessionsRepository,
  WorkoutSessionWithWorkout,
} from '../workout-sessions.repository'

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
    date: Date,
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
    id: string,
  ): Promise<WorkoutSessionWithWorkout | null> {
    return prisma.workoutSession.findUnique({
      where: { id },
      include: {
        workout: {
          include: { exercises: { include: { exercise: true } } },
        },
        exerciseSessions: {
          include: {
            exercise: true,
            logs: true,
          },
        },
      },
    }) as unknown as WorkoutSessionWithWorkout | null
  }

  async findAllByUser(userId: string): Promise<WorkoutSessionWithWorkout[]> {
    const sessions = await prisma.workoutSession.findMany({
      where: { userId },
      include: {
        workout: {
          include: { exercises: { include: { exercise: true } } },
        },
        exerciseSessions: {
          include: {
            exercise: true,
            logs: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    })

    return sessions.map((session) => ({
      ...session,
      exerciseSessions: session.exerciseSessions.map((ex) => ({
        id: ex.id,
        sets: ex.plannedSets ?? 0,
        reps: ex.plannedReps ?? 0,
        weight: ex.plannedWeight ?? null,
        completed: ex.completed,
        exercise: {
          id: ex.exercise.id,
          name: ex.exercise.name,
          category: ex.exercise.category,
          type: ex.exercise.type,
        },
        logs: ex.logs.map((log) => ({
          id: log.id,
          sets: log.sets,
          reps: log.reps,
          weight: log.weight ?? null,
          date: log.date,
          description: log.description ?? null,
        })),
      })),
    })) as WorkoutSessionWithWorkout[]
  }

  async findByIdWithWorkoutAndExerciseSessions(
    id: string,
  ): Promise<WorkoutSessionWithWorkout | null> {
    return prisma.workoutSession.findUnique({
      where: { id },
      include: {
        workout: {
          include: { exercises: { include: { exercise: true } } },
        },
        exerciseSessions: {
          include: {
            exercise: true,
            logs: true,
          },
        },
      },
    }) as unknown as WorkoutSessionWithWorkout | null
  }

  async create(
    data: Prisma.WorkoutSessionUncheckedCreateInput,
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

  async updateStatus(
    id: string,
    status: WorkoutSessionStatus,
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
    },
  ): Promise<WorkoutSessionWithWorkout> {
    return await prisma.$transaction(async (tx) => {
      const session = await tx.workoutSession.update({
        where: { id: sessionId },
        data: { status: updates.status },
        include: {
          workout: { include: { exercises: { include: { exercise: true } } } },
          exerciseSessions: { include: { exercise: true, logs: true } },
        },
      })

      if (!session) {
        throw new Error('Workout session not found')
      }

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

      const updatedSession = await tx.workoutSession.findUnique({
        where: { id: sessionId },
        include: {
          workout: { include: { exercises: { include: { exercise: true } } } },
          exerciseSessions: { include: { exercise: true, logs: true } },
        },
      })

      if (!updatedSession) {
        throw new Error('Workout session not found after update')
      }

      return {
        ...updatedSession,
        exerciseSessions: updatedSession.exerciseSessions.map((ex) => ({
          id: ex.id,
          sets: ex.plannedSets ?? 0,
          reps: ex.plannedReps ?? 0,
          weight: ex.plannedWeight ?? null,
          completed: ex.completed,
          exercise: {
            id: ex.exercise.id,
            name: ex.exercise.name,
            category: ex.exercise.category,
            type: ex.exercise.type,
          },
          logs: ex.logs.map((log) => ({
            id: log.id,
            sets: log.sets,
            reps: log.reps,
            weight: log.weight ?? null,
            date: log.date,
            description: log.description ?? null,
          })),
        })),
      }
    })
  }
}

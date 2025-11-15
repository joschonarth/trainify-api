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

  async findByUserAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
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
    workoutId: string,
  ): Promise<WorkoutSessionWithWorkout[]> {
    const sessions = await prisma.workoutSession.findMany({
      where: {
        userId,
        workoutId,
      },
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
    endDate: Date,
  ): Promise<WorkoutSessionWithWorkout[]> {
    const sessions = await prisma.workoutSession.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        workout: {
          include: {
            exercises: {
              include: {
                exercise: {
                  select: { id: true, name: true, category: true, type: true },
                },
              },
            },
          },
        },
        exerciseSessions: {
          include: {
            exercise: {
              select: { id: true, name: true, category: true, type: true },
            },
            logs: {
              select: {
                id: true,
                sets: true,
                reps: true,
                weight: true,
                date: true,
                description: true,
              },
            },
          },
        },
      },
      orderBy: { date: 'asc' },
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

  async update(
    id: string,
    data: Prisma.WorkoutSessionUpdateInput,
  ): Promise<WorkoutSession> {
    return prisma.workoutSession.update({
      where: { id },
      data,
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

  async countCompletedByUser(userId: string): Promise<number> {
    return prisma.workoutSession.count({
      where: {
        userId,
        status: 'COMPLETED',
      },
    })
  }
}

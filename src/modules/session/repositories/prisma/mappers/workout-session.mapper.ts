import { Prisma } from '@prisma/client'

import { WorkoutSessionWithWorkout } from '../../workout-sessions.repository'

type PrismaSession = Prisma.WorkoutSessionGetPayload<{
  include: {
    workout: {
      include: {
        exercises: {
          include: { exercise: true }
        }
      }
    }
    exerciseSessions: {
      include: { exercise: true; logs: true }
    }
  }
}>

export function mapWorkoutSession(
  session: PrismaSession,
): WorkoutSessionWithWorkout {
  return {
    ...session,
    exerciseSessions: session.exerciseSessions.map((ex) => ({
      id: ex.id,
      sets: ex.plannedSets ?? 0,
      reps: ex.plannedReps ?? 0,
      weight: ex.plannedWeight ?? null,
      completed: ex.completed,
      duration: ex.duration ?? null,
      startedAt: ex.startedAt ?? null,
      endedAt: ex.endedAt ?? null,
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
}

import type { Prisma } from 'generated/prisma'
import { getLogVolume } from '@/shared/utils/calculate-volume'
import { getExerciseSessionState } from '../../../utils/exercise-session-state'
import type { WorkoutSessionWithWorkout } from '../../workout-sessions.repository'

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
  session: PrismaSession
): WorkoutSessionWithWorkout {
  return {
    ...session,
    exerciseSessions: [...session.exerciseSessions]
      // Stored positions are authoritative, including legacy rows with equal positions.
      .sort((a, b) => a.position - b.position || a.id.localeCompare(b.id))
      .map((ex) => ({
        id: ex.id,
        plannedSets: ex.plannedSets,
        plannedReps: ex.plannedReps,
        plannedWeight: ex.plannedWeight,
        completed: ex.completed,
        skipReason: ex.skipReason,
        state: getExerciseSessionState(
          ex.completed,
          session.endedAt,
          session.status
        ),
        duration: ex.duration ?? null,
        startedAt: ex.startedAt ?? null,
        endedAt: ex.endedAt ?? null,
        exercise: {
          id: ex.exercise.id,
          name: ex.exercise.name,
          category: ex.exercise.category,
          type: ex.exercise.type,
          measurement: ex.exercise.measurement,
        },
        logs: ex.logs.map((log) => ({
          id: log.id,
          sets: log.sets,
          reps: log.reps,
          weight: log.weight ?? null,
          volume: getLogVolume(log, ex.exercise.measurement),
          date: log.date,
          description: log.description ?? null,
        })),
      })),
  }
}

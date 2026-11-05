import { WorkoutSessionStatus } from 'generated/prisma'

export type ExerciseSessionState = 'COMPLETED' | 'SKIPPED' | 'PENDING'

export function getExerciseSessionState(
  completed: boolean,
  endedAt: Date | null,
  sessionStatus: WorkoutSessionStatus
): ExerciseSessionState {
  if (completed) {
    return 'COMPLETED'
  }

  const sessionEnded =
    endedAt !== null ||
    sessionStatus === WorkoutSessionStatus.COMPLETED ||
    sessionStatus === WorkoutSessionStatus.INCOMPLETE ||
    sessionStatus === WorkoutSessionStatus.SKIPPED

  return sessionEnded ? 'SKIPPED' : 'PENDING'
}

export function getRepsComparison(
  plannedReps: number | null,
  loggedReps: number | null
) {
  if (loggedReps === null) {
    return null
  }

  return {
    plannedReps,
    loggedReps,
    metPlan: plannedReps === null ? null : loggedReps >= plannedReps,
  }
}

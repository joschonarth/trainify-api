import type { WorkoutSessionStatus } from 'generated/prisma'

export function isSessionComparable(
  status: WorkoutSessionStatus,
  exerciseSessions: { logs: { id: string }[] }[]
): boolean {
  return (
    status === 'COMPLETED' ||
    status === 'INCOMPLETE' ||
    exerciseSessions.some((exerciseSession) => exerciseSession.logs.length > 0)
  )
}

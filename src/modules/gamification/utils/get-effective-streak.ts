import { getZonedDayDifference } from '@/shared/utils/date-timezone'

export function getEffectiveStreak(
  currentStreak: number,
  lastWorkout: Date | null,
  now: Date,
  timezone: string
): number {
  if (!lastWorkout || getZonedDayDifference(lastWorkout, now, timezone) > 1) {
    return 0
  }
  return currentStreak
}

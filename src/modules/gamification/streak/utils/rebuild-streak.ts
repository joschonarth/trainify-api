import dayjs from 'dayjs'
import { getZonedDayDifference } from '@/shared/utils/date-timezone'
import { getEffectiveStreak } from './get-effective-streak'

export function rebuildStreak(
  dates: Date[],
  timezone: string,
  referenceDate: Date,
  previousBest: number
) {
  const ordered = [...dates].sort((a, b) => a.getTime() - b.getTime())
  let lastWorkout: Date | null = null
  let current = 0
  let best = previousBest
  for (const date of ordered) {
    const difference = lastWorkout
      ? getZonedDayDifference(lastWorkout, date, timezone)
      : null
    if (difference === 0) {
      continue
    }
    current = difference === 1 ? current + 1 : 1
    best = Math.max(best, current)
    lastWorkout = dayjs(date).tz(timezone).startOf('day').toDate()
  }
  return {
    currentStreak: getEffectiveStreak(
      current,
      lastWorkout,
      referenceDate,
      timezone
    ),
    bestStreak: best,
    lastWorkout,
  }
}

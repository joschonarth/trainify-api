import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(timezone)

export interface StreakPlanVersion {
  effectiveDate: string
  trainingDays: number[]
}

export type PlannedDayStatus =
  | 'completed'
  | 'pending'
  | 'missed'
  | 'rest'
  | 'scheduled'
  | 'unplanned'

interface CalculatePlannedStreakRequest {
  versions: StreakPlanVersion[]
  activityDates: string[]
  timezone: string
  activationDate: string
  reference: Date
  calendarEnd?: string
}

/** Inputs are canonical YYYY-MM-DD business dates, never server-local dates. */
export function calculatePlannedStreak({
  versions,
  activityDates,
  timezone: timezoneName,
  activationDate,
  reference,
  calendarEnd,
}: CalculatePlannedStreakRequest) {
  const today = dayjs(reference).tz(timezoneName).format('YYYY-MM-DD')
  const end = calendarEnd && calendarEnd > today ? calendarEnd : today
  const ordered = [...versions].sort((a, b) =>
    a.effectiveDate.localeCompare(b.effectiveDate)
  )
  const activity = new Set(activityDates)
  const days: { date: string; completed: boolean; status: PlannedDayStatus }[] =
    []
  let versionIndex = -1
  let currentStreak = 0
  let bestStreak = 0
  let enabled = false
  let lastBusinessDate: string | null = null

  // UTC is used only to advance date labels, not to represent local midnights.
  for (
    let cursor = dayjs.utc(activationDate);
    cursor.format('YYYY-MM-DD') <= end;
    cursor = cursor.add(1, 'day')
  ) {
    const date = cursor.format('YYYY-MM-DD')
    while (
      versionIndex + 1 < ordered.length &&
      (ordered[versionIndex + 1]?.effectiveDate ?? '9999-12-31') <= date
    ) {
      versionIndex += 1
    }
    const plan = ordered[versionIndex]
    const active = Boolean(plan?.trainingDays.length)
    const completed = date <= today && activity.has(date)
    const training =
      active && Boolean(plan?.trainingDays.includes(cursor.day()))
    const status = classifyPlannedDay(active, training, completed, date, today)
    days.push({ date, completed, status })
    if (date > today) {
      continue
    }
    enabled = active
    if (!active || status === 'missed') {
      currentStreak = 0
    } else if (status === 'completed') {
      currentStreak += 1
      bestStreak = Math.max(bestStreak, currentStreak)
    }
    if (completed) {
      lastBusinessDate = date
    }
  }
  return { currentStreak, bestStreak, enabled, lastBusinessDate, days }
}

function classifyPlannedDay(
  active: boolean,
  training: boolean,
  completed: boolean,
  date: string,
  today: string
): PlannedDayStatus {
  if (!active) {
    return 'unplanned'
  }
  if (!training) {
    return 'rest'
  }
  if (date > today) {
    return 'scheduled'
  }
  if (completed) {
    return 'completed'
  }
  return date === today ? 'pending' : 'missed'
}

import dayjs from 'dayjs'
import type { TrackingPlan } from '../repositories/streak-plans.repository'
import { calculatePlannedStreak } from './calculate-planned-streak'

export function evaluateTracking(
  plan: TrackingPlan | null,
  activityDates: string[],
  reference = new Date(),
  calendarEnd?: string
) {
  const result = calculatePlannedStreak({
    versions:
      plan?.versions.map((version) => ({
        effectiveDate: version.effectiveDate,
        trainingDays: Object.keys(version.workouts).map(Number),
      })) ?? [],
    activityDates,
    timezone: plan?.timezone ?? 'UTC',
    activationDate:
      plan?.activationDate ?? dayjs.utc(reference).format('YYYY-MM-DD'),
    reference,
    ...(calendarEnd ? { calendarEnd } : {}),
  })
  return {
    ...result,
    lastWorkout:
      result.lastBusinessDate && plan
        ? dayjs.tz(result.lastBusinessDate, plan.timezone).toDate()
        : null,
    unit: 'scheduled_training_days' as const,
    timezone: plan?.timezone ?? null,
    activationDate: plan?.activationDate ?? null,
  }
}

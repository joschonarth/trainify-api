import type { StreakPlansRepository } from '../repositories/streak-plans.repository'
import type { UserStreakLogsRepository } from '../repositories/user-streak-logs.repository'
import { activityBusinessDate } from '../utils/activity-business-day'
import { evaluateTracking } from '../utils/evaluate-tracking'

export class GetPlanningCalendarContext {
  constructor(
    private readonly plans: StreakPlansRepository,
    private readonly logs: UserStreakLogsRepository
  ) {}

  async execute(userId: string, fallbackTimezone: string) {
    const plan = await this.plans.findByUser(userId)
    const logs = await this.logs.findAllByUser(userId)
    const timezone = plan?.timezone ?? fallbackTimezone
    const activity = logs.map((log) => activityBusinessDate(log, timezone))
    const activityDates = new Set(activity)
    return {
      timezone,
      hasActivity: (date: string) => activityDates.has(date),
      daysThrough: (end: string) =>
        new Map(
          evaluateTracking(plan, activity, new Date(), end).days.map((day) => [
            day.date,
            day,
          ])
        ),
    }
  }
}

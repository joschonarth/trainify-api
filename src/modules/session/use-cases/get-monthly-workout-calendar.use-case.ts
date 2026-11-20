import dayjs from 'dayjs'
import timezonePlugin from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import type { GetPlanningCalendarContext } from '@/modules/gamification/streak/use-cases/get-planning-calendar-context'
import type { PlannedDayStatus } from '@/modules/gamification/streak/utils/calculate-planned-streak'

import type { WorkoutSessionsRepository } from '@/modules/session/repositories/workout-sessions.repository'
import type { UsersRepository } from '@/modules/user/repositories/users.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { getZonedMonthRange } from '@/shared/utils/date-timezone'

dayjs.extend(utc)
dayjs.extend(timezonePlugin)

interface CalendarDayStatus {
  date: string
  completed: boolean
  planningStatus?: PlannedDayStatus
  hasActivity?: boolean
}

interface GetMonthlyWorkoutCalendarResponse {
  days: CalendarDayStatus[]
}

export class GetMonthlyWorkoutCalendarUseCase {
  constructor(
    private readonly workoutSessionsRepository: Pick<
      WorkoutSessionsRepository,
      'findByUserAndDateRange'
    >,
    private readonly usersRepository: Pick<UsersRepository, 'findById'>,
    private readonly planning?: GetPlanningCalendarContext
  ) {}

  async execute(
    userId: string,
    year?: number,
    month?: number
  ): Promise<GetMonthlyWorkoutCalendarResponse> {
    const user = await this.usersRepository.findById(userId)
    if (!user) {
      throw new ResourceNotFoundError('User not found.')
    }

    const context = await this.planning?.execute(userId, user.timezone)
    const timezone = context?.timezone ?? user.timezone
    const today = dayjs().tz(timezone)
    const currentYear = year ?? today.year()
    const currentMonth = month ?? today.month() + 1
    const { start, end, startDay, endDay } = getZonedMonthRange(
      currentYear,
      currentMonth,
      timezone
    )

    const sessions =
      await this.workoutSessionsRepository.findByUserAndDateRange(
        userId,
        start,
        end,
        timezone
      )

    const totalDays = endDay.date()
    const daysArray = Array.from({ length: totalDays }, (_, i) =>
      startDay.add(i, 'day')
    )

    const planned = context?.daysThrough(endDay.format('YYYY-MM-DD'))
    const days: CalendarDayStatus[] = daysArray.map((date) => {
      const completed = sessions.some(
        (session) =>
          session.status === 'COMPLETED' &&
          (session.businessDate
            ? session.businessDate === date.format('YYYY-MM-DD')
            : dayjs(session.date).tz(timezone).isSame(date, 'day'))
      )
      return {
        ...(context
          ? {
              planningStatus:
                planned?.get(date.format('YYYY-MM-DD'))?.status ??
                ('unplanned' as const),
              hasActivity: context.hasActivity(date.format('YYYY-MM-DD')),
            }
          : {}),
        date: date.format('YYYY-MM-DD'),
        completed,
      }
    })

    return { days }
  }
}

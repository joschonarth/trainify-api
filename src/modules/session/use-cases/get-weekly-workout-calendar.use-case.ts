import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import timezonePlugin from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import type { GetPlanningCalendarContext } from '@/modules/gamification/streak/use-cases/get-planning-calendar-context'
import type { PlannedDayStatus } from '@/modules/gamification/streak/utils/calculate-planned-streak'

import type { WorkoutSessionsRepository } from '@/modules/session/repositories/workout-sessions.repository'
import type { UsersRepository } from '@/modules/user/repositories/users.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

dayjs.extend(isoWeek)
dayjs.extend(utc)
dayjs.extend(timezonePlugin)

interface CalendarWeekStatus {
  date: string
  completed: boolean
  planningStatus?: PlannedDayStatus
  hasActivity?: boolean
}

interface GetWeeklyWorkoutCalendarResponse {
  week: CalendarWeekStatus[]
}

export class GetWeeklyWorkoutCalendarUseCase {
  constructor(
    private readonly workoutSessionsRepository: Pick<
      WorkoutSessionsRepository,
      'findByUserAndDateRange'
    >,
    private readonly usersRepository: Pick<UsersRepository, 'findById'>,
    private readonly planning?: GetPlanningCalendarContext
  ) {}

  async execute(userId: string): Promise<GetWeeklyWorkoutCalendarResponse> {
    const user = await this.usersRepository.findById(userId)
    if (!user) {
      throw new ResourceNotFoundError('User not found.')
    }

    const context = await this.planning?.execute(userId, user.timezone)
    const timezone = context?.timezone ?? user.timezone
    const today = dayjs().tz(timezone)
    const startOfWeek = today.startOf('isoWeek')
    const startDate = startOfWeek.toDate()
    const endDate = startOfWeek.endOf('isoWeek').toDate()
    const sessions =
      await this.workoutSessionsRepository.findByUserAndDateRange(
        userId,
        startDate,
        endDate,
        timezone
      )

    const weekDates = Array.from({ length: 7 }, (_, i) =>
      startOfWeek.add(i, 'day')
    )

    const planned = context?.daysThrough(
      startOfWeek.add(6, 'day').format('YYYY-MM-DD')
    )
    const weekStatus: CalendarWeekStatus[] = weekDates.map((date) => {
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

    return { week: weekStatus }
  }
}

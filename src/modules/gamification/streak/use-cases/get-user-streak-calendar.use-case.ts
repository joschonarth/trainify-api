import dayjs from 'dayjs'
import timezonePlugin from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import type { UsersRepository } from '@/modules/user/repositories/users.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { getZonedMonthRange } from '@/shared/utils/date-timezone'
import type { StreakPlansRepository } from '../repositories/streak-plans.repository'
import type { UserStreakLogsRepository } from '../repositories/user-streak-logs.repository'
import { activityBusinessDate } from '../utils/activity-business-day'
import type { PlannedDayStatus } from '../utils/calculate-planned-streak'
import { evaluateTracking } from '../utils/evaluate-tracking'

dayjs.extend(utc)
dayjs.extend(timezonePlugin)

interface CalendarDayStatus {
  date: string
  completed: boolean
  status: PlannedDayStatus
}

interface GetUserStreakCalendarRequest {
  userId: string
  month?: number
  year?: number
}

interface GetUserStreakCalendarResponse {
  days: CalendarDayStatus[]
}

export class GetUserStreakCalendarUseCase {
  constructor(
    private readonly userStreakLogsRepository: UserStreakLogsRepository,
    private readonly usersRepository: Pick<UsersRepository, 'findById'>,
    private readonly plans: StreakPlansRepository
  ) {}

  async execute({
    userId,
    month,
    year,
  }: GetUserStreakCalendarRequest): Promise<GetUserStreakCalendarResponse> {
    const user = await this.usersRepository.findById(userId)
    if (!user) {
      throw new ResourceNotFoundError('User not found.')
    }

    const plan = await this.plans.findByUser(userId)
    const today = dayjs().tz(plan?.timezone ?? user.timezone)
    const currentYear = year ?? today.year()
    const currentMonth = (month ?? today.month() + 1) - 1 // dayjs months are 0-based

    const { start, end, startDay, endDay } = getZonedMonthRange(
      currentYear,
      currentMonth + 1,
      plan?.timezone ?? user.timezone
    )

    const [timestampLogs, businessDateLogs] = await Promise.all([
      this.userStreakLogsRepository.findByUserAndDateRange(userId, start, end),
      this.userStreakLogsRepository.findByBusinessDateRange(
        userId,
        startDay.format('YYYY-MM-DD'),
        endDay.format('YYYY-MM-DD')
      ),
    ])
    const logs = [
      ...timestampLogs.filter((log) => !log.businessDate),
      ...businessDateLogs,
    ]

    const totalDays = endDay.date()
    const daysArray = Array.from({ length: totalDays }, (_, i) =>
      startDay.add(i, 'day')
    )

    const completedDates = new Set(
      logs.map((log) =>
        activityBusinessDate(log, plan?.timezone ?? user.timezone)
      )
    )
    const planned = evaluateTracking(
      plan,
      [...completedDates],
      new Date(),
      endDay.format('YYYY-MM-DD')
    )
    const byDate = new Map(planned.days.map((day) => [day.date, day]))
    const days: CalendarDayStatus[] = daysArray.map((date) => {
      const calendarDate = date.format('YYYY-MM-DD')
      return {
        date: calendarDate,
        completed: completedDates.has(calendarDate),
        status: byDate.get(calendarDate)?.status ?? 'unplanned',
      }
    })

    return { days }
  }
}

import dayjs from 'dayjs'

import type { WorkoutSessionsRepository } from '@/modules/session/repositories/workout-sessions.repository'

interface CalendarDayStatus {
  date: string
  completed: boolean
}

interface GetMonthlyWorkoutCalendarResponse {
  days: CalendarDayStatus[]
}

export class GetMonthlyWorkoutCalendarUseCase {
  constructor(private workoutSessionsRepository: WorkoutSessionsRepository) {}

  async execute(
    userId: string,
    year?: number,
    month?: number
  ): Promise<GetMonthlyWorkoutCalendarResponse> {
    const today = dayjs()
    const currentYear = year ?? today.year()
    const currentMonth = month ?? today.month()

    const startOfMonth = dayjs(new Date(currentYear, currentMonth, 1))
    const endOfMonth = startOfMonth.endOf('month')

    const sessions = await this.workoutSessionsRepository.findAllByUser(userId)

    const totalDays = endOfMonth.date()
    const daysArray = Array.from({ length: totalDays }, (_, i) =>
      startOfMonth.add(i, 'day')
    )

    const days: CalendarDayStatus[] = daysArray.map((date) => {
      const session = sessions.find((s) => dayjs(s.date).isSame(date, 'day'))
      return {
        date: date.format('YYYY-MM-DD'),
        completed: session?.status === 'COMPLETED',
      }
    })

    return { days }
  }
}

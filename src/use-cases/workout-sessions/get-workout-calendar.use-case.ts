import dayjs from 'dayjs'

import { WorkoutSessionsRepository } from '@/repositories/workout-sessions.repository'

interface CalendarDayStatus {
  date: string
  completed: boolean
}

interface GetWorkoutCalendarRequest {
  userId: string
  month?: number
  year?: number
}

interface GetWorkoutCalendarResponse {
  days: CalendarDayStatus[]
}

export class GetWorkoutCalendarUseCase {
  constructor(private workoutSessionsRepository: WorkoutSessionsRepository) {}

  async execute({
    userId,
    year,
    month,
  }: GetWorkoutCalendarRequest): Promise<GetWorkoutCalendarResponse> {
    const today = dayjs()
    const currentYear = year ?? today.year()
    const currentMonth = (month ?? today.month() + 1) - 1 // dayjs months are 0-based

    const startOfMonth = dayjs(new Date(currentYear, currentMonth, 1))
    const endOfMonth = startOfMonth.endOf('month')

    const sessions =
      await this.workoutSessionsRepository.findByUserAndDateRange(
        userId,
        startOfMonth.toDate(),
        endOfMonth.toDate(),
      )

    const totalDays = endOfMonth.date()
    const daysArray = Array.from({ length: totalDays }, (_, i) =>
      startOfMonth.add(i, 'day'),
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

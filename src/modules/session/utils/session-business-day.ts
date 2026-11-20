import dayjs from 'dayjs'
import { AppError } from '@/shared/errors/app.error'
import { DEFAULT_TIMEZONE } from '@/shared/utils/date-timezone'

export interface SessionBusinessDay {
  date: Date
  dailyIdentity?: { businessDate: string; timezone: string } | null
}

export function getSessionBusinessDay(session: SessionBusinessDay) {
  return {
    businessDate:
      session.dailyIdentity?.businessDate ??
      dayjs(session.date).tz(DEFAULT_TIMEZONE).format('YYYY-MM-DD'),
    timezone: session.dailyIdentity?.timezone ?? DEFAULT_TIMEZONE,
  }
}

export function assertSessionBusinessDay(
  session: SessionBusinessDay,
  now = new Date()
) {
  const day = getSessionBusinessDay(session)
  if (dayjs(now).tz(day.timezone).format('YYYY-MM-DD') !== day.businessDate) {
    throw new AppError(
      409,
      'Workout session can only be executed on its business day.'
    )
  }
  return day
}

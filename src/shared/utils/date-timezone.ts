import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(timezone)

export const DEFAULT_TIMEZONE = 'America/Sao_Paulo'

export function getZonedDayRange(date: Date, timezoneName: string) {
  const start = dayjs(date).tz(timezoneName).startOf('day')

  return {
    start: start.toDate(),
    end: start.add(1, 'day').subtract(1, 'millisecond').toDate(),
  }
}

export function getZonedMonthRange(
  year: number,
  month: number,
  timezoneName: string
) {
  const start = dayjs
    .tz(`${year}-${String(month).padStart(2, '0')}-01`, timezoneName)
    .startOf('day')
  const end = start.endOf('month')

  return {
    start: start.toDate(),
    end: end.toDate(),
    startDay: start,
    endDay: end,
  }
}

export function getZonedMonthRangeForDate(date: Date, timezoneName: string) {
  const month = dayjs(date).tz(timezoneName).startOf('month')

  return {
    start: month.toDate(),
    end: month.endOf('month').toDate(),
    startDay: month,
    endDay: month.endOf('month'),
  }
}

export function getZonedWeekRange(date: Date, timezoneName: string) {
  const start = dayjs(date).tz(timezoneName).startOf('isoWeek')
  const end = start.endOf('isoWeek')

  return {
    start: start.toDate(),
    end: end.toDate(),
    startDay: start,
    endDay: end,
  }
}

export function getZonedDayDifference(
  startDate: Date,
  endDate: Date,
  timezoneName: string
): number {
  const start = dayjs(startDate).tz(timezoneName).startOf('day')
  const end = dayjs(endDate).tz(timezoneName).startOf('day')

  return end.diff(start, 'day')
}

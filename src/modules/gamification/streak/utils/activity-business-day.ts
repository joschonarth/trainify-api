import dayjs from 'dayjs'

export function activityBusinessDate(
  log: { date: Date; businessDate?: string | null },
  timezone: string
) {
  return log.businessDate ?? dayjs(log.date).tz(timezone).format('YYYY-MM-DD')
}

export function activityDate(
  log: { date: Date; businessDate?: string | null },
  timezone: string
) {
  return log.businessDate
    ? dayjs.tz(log.businessDate, timezone).toDate()
    : log.date
}

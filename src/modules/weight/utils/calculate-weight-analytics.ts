import type { WeightLog } from 'generated/prisma'

interface WeightDataPoint {
  date: Date
  weight: number
}

interface WeightAnalyticsCalculation {
  dataPoints: WeightDataPoint[]
  avgChangePerWeek: number
  trendDirection: 'increasing' | 'decreasing' | 'stable'
}

const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000

export function calculateWeightAnalytics(
  logs: WeightLog[]
): WeightAnalyticsCalculation {
  const sortedLogs = logs
    .filter(
      (log) =>
        Number.isFinite(log.date.getTime()) && Number.isFinite(log.weight)
    )
    .sort(
      (a, b) => a.date.getTime() - b.date.getTime() || a.id.localeCompare(b.id)
    )

  const dataPoints = sortedLogs.map(({ date, weight }) => ({ date, weight }))

  if (sortedLogs.length < 2) {
    return { dataPoints, avgChangePerWeek: 0, trendDirection: 'stable' }
  }

  const firstLog = sortedLogs[0]
  const lastLog = sortedLogs.at(-1)

  if (!(firstLog && lastLog)) {
    return { dataPoints: [], avgChangePerWeek: 0, trendDirection: 'stable' }
  }

  const elapsedWeeks =
    (lastLog.date.getTime() - firstLog.date.getTime()) / millisecondsPerWeek

  if (elapsedWeeks <= 0) {
    return { dataPoints, avgChangePerWeek: 0, trendDirection: 'stable' }
  }

  const calculatedRate = (lastLog.weight - firstLog.weight) / elapsedWeeks
  const avgChangePerWeek = Number.isFinite(calculatedRate) ? calculatedRate : 0

  let trendDirection: WeightAnalyticsCalculation['trendDirection'] = 'stable'

  if (Math.abs(avgChangePerWeek) >= 0.1) {
    trendDirection = avgChangePerWeek > 0 ? 'increasing' : 'decreasing'
  }

  return { dataPoints, avgChangePerWeek, trendDirection }
}

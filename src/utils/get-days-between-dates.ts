/**
 * Calculates the difference in whole days between two dates.
 * Ignores hours, minutes, and seconds (considers only year/month/day).
 */
export function daysBetweenDates(a: Date, b: Date): number {
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())
  const diffMs = utcB - utcA
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

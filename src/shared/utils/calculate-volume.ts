import type { Measurement } from 'generated/prisma'

export function calculateVolume(
  sets: number,
  reps: number,
  weight: number | null | undefined,
  measurement: Measurement = 'REPS'
): number {
  return measurement === 'DURATION' ? 0 : sets * reps * (weight ?? 0)
}

export function getLogVolume(
  log: { volume: number },
  measurement: Measurement
): number {
  return measurement === 'DURATION' ? 0 : log.volume
}

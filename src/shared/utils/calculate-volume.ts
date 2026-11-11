export function calculateVolume(
  sets: number,
  reps: number,
  weight: number | null | undefined
): number {
  return sets * reps * (weight ?? 0)
}

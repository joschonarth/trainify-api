import { UnlockAllBadgesUseCase } from '../unlock-all-badges.use-case'
import { makeUnlockWorkoutBadgesUseCase } from './make-unlock-workout-badges-use-case'

export function makeUnlockAllBadgesUseCase() {
  const unlockWorkoutBadgesUseCase = makeUnlockWorkoutBadgesUseCase()

  const unlockAllBadgesUseCase = new UnlockAllBadgesUseCase(
    unlockWorkoutBadgesUseCase,
  )

  return unlockAllBadgesUseCase
}

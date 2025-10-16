import { UnlockAllBadgesUseCase } from '../unlock-all-badges.use-case'
import { makeUnlockExerciseBadgesUseCase } from './make-unlock-exercise-badges-use-case'
import { makeUnlockWorkoutBadgesUseCase } from './make-unlock-workout-badges-use-case'

export function makeUnlockAllBadgesUseCase() {
  const unlockWorkoutBadgesUseCase = makeUnlockWorkoutBadgesUseCase()
  const unlockExerciseBadgesUseCase = makeUnlockExerciseBadgesUseCase()

  const unlockAllBadgesUseCase = new UnlockAllBadgesUseCase(
    unlockWorkoutBadgesUseCase,
    unlockExerciseBadgesUseCase,
  )

  return unlockAllBadgesUseCase
}

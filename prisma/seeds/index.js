import { seedBadges } from './badges.seed.js'
import { seedDemoBadges } from './demo-badges.seed.js'
import { prisma } from './prisma.js'
import { seedUser } from './user.seed.js'
import { seedWeights } from './weight.seed.js'
import { seedWorkoutExercises } from './workout-exercises.seed.js'
import { seedWorkoutSchedule } from './workout-schedules.seed.js'
import { seedWorkoutSessions } from './workout-sessions.seed.js'
import { seedWorkouts } from './workouts.seed.js'

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Demo fixtures are disabled in production. Use npm run seed:catalog.'
    )
  }
  await prisma.$transaction(
    async (tx) => {
      // Serialize retries before checking any fixture identities.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(706006)`
      await seedBadges(tx)
      const user = await seedUser(tx)
      const workouts = await seedWorkouts(tx, user.id)
      await seedWorkoutExercises(tx, user.id, workouts)
      await seedWorkoutSchedule(tx, user.id, workouts)
      await seedWorkoutSessions(tx, user.id)
      await seedDemoBadges(tx, user.id)
      await seedWeights(tx, user.id)
    },
    { timeout: 120_000 }
  )
  console.log('All demo fixtures synchronized successfully.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())

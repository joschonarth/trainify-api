import { PrismaClient } from '@prisma/client'

import { seedBadges } from './badges.seed.js'
import { seedUser } from './user.seed.js'
import { seedWorkoutExercises } from './workout-exercises.seed.js'
import { seedWorkoutSchedule } from './workout-schedules.seed.js'
import { seedWorkoutSessions } from './workout-sessions.seed.js'
import { seedWorkouts } from './workouts.seed.js'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  const user = await seedUser()
  const workouts = await seedWorkouts(user.id)
  await seedWorkoutExercises(user.id, workouts)
  await seedWorkoutSchedule(user.id, workouts)
  await seedWorkoutSessions(user.id)
  await seedBadges()

  console.log('🎉 All seeds executed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

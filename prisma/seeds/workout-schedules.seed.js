import { PrismaClient } from 'generated/prisma'

const prisma = new PrismaClient()

export async function seedWorkoutSchedule(userId, workouts) {
  console.log('📅 Seeding workout schedule...')

  if (!userId) {
    console.warn('⚠️ No userId provided, skipping workout schedule seed.')
    return
  }

  if (!workouts || workouts.length === 0) {
    console.warn('⚠️ No workouts provided, skipping workout schedule seed.')
    return
  }

  const weekDays = [1, 2, 3, 4, 5, 6, 0]

  let workoutIndex = 0

  for (const dayOfWeek of weekDays) {
    const workout = workouts[workoutIndex % workouts.length]

    await prisma.workoutSchedule.upsert({
      where: {
        userId_dayOfWeek: {
          userId,
          dayOfWeek,
        },
      },
      update: {},
      create: {
        userId,
        workoutId: workout.id,
        dayOfWeek,
      },
    })

    console.log(`✅ Assigned workout "${workout.name}" on day ${dayOfWeek}`)

    workoutIndex++
  }

  console.log('🎉 Finished seeding workout schedule!')
}

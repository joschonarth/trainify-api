import { GoalType, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedWeights(userId) {
  console.log('⚖️ Seeding weight goals and logs...')

  const existingGoal = await prisma.weightGoal.findFirst({
    where: { userId, name: 'Meta de Verão' },
  })

  const goal =
    existingGoal ??
    (await prisma.weightGoal.create({
      data: {
        userId,
        name: 'Meta de Verão',
        description: 'Perder 20kg até o verão',
        goalType: GoalType.LOSE,
        startWeight: 100,
        targetWeight: 80,
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 2)),
        isActive: true,
      },
    }))

  console.log(`✅ Weight goal created: ${goal.name}`)

  const logs = []
  let currentWeight = 100
  const date = new Date(goal.startDate)

  while (currentWeight > 84) {
    const change = Math.floor(Math.random() * 3)
    currentWeight -= change
    if (currentWeight < 84) {
      currentWeight = 84
    }

    logs.push({
      userId,
      goalId: goal.id,
      date: new Date(date),
      weight: currentWeight,
      note: 'Pesei de jejum',
    })

    date.setDate(date.getDate() + 1)
  }

  for (const log of logs) {
    await prisma.weightLog.create({ data: log })
  }

  const startWeight = goal.startWeight ?? 100
  const targetWeight = goal.targetWeight
  const lost = startWeight - currentWeight
  const totalToLose = startWeight - targetWeight
  const progress = Math.min((lost / totalToLose) * 100, 100)

  await prisma.weightGoal.update({
    where: { id: goal.id },
    data: { progress },
  })

  console.log(
    `✅ ${logs.length} weight logs created, progress up to ${currentWeight}kg`
  )
}

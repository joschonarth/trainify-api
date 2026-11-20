import { GoalType } from '../../generated/prisma/index.js'
import { dayjs } from './dates.js'

export async function seedWeights(prisma, userId) {
  console.log('⚖️ Seeding weight goals and logs...')

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } })
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
        startDate: dayjs
          .utc(dayjs(user.createdAt).tz(user.timezone).format('YYYY-MM-DD'))
          .subtract(2, 'month')
          .toDate(),
        isActive: true,
      },
    }))

  console.log(`✅ Weight goal created: ${goal.name}`)

  const logs = Array.from({ length: 17 }, (_, index) => {
    const date = dayjs.utc(goal.startDate).add(index, 'day').toDate()
    return {
      userId,
      goalId: goal.id,
      date,
      weight: 100 - index,
      note: 'Pesei de jejum',
    }
  })

  for (const log of logs) {
    const existingLog = await prisma.weightLog.findFirst({
      where: { userId, goalId: goal.id, date: log.date },
    })
    if (!existingLog) {
      await prisma.weightLog.create({ data: log })
    }
  }

  const latest = await prisma.weightLog.findFirstOrThrow({
    where: { userId },
    orderBy: [{ date: 'desc' }, { id: 'desc' }],
  })
  await prisma.user.update({
    where: { id: userId },
    data: { weight: latest.weight },
  })

  const startWeight = goal.startWeight ?? 100
  const targetWeight = goal.targetWeight
  const lost = startWeight - 84
  const totalToLose = startWeight - targetWeight
  const progress = Math.min((lost / totalToLose) * 100, 100)

  await prisma.weightGoal.update({
    where: { id: goal.id },
    data: { progress },
  })

  console.log(`✅ ${logs.length} weight logs ensured, progress up to 84kg`)
}

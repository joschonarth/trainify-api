import { BadgeType, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 🏋️‍♂️ Badges baseadas em treinos completados
const workoutBadges = [
  {
    name: 'Primeiro Passo',
    description: 'Completar o 1º treino',
    type: BadgeType.WORKOUT,
    milestone: 1,
  },
  {
    name: 'Aquecimento',
    description: 'Completar 10 treinos',
    type: BadgeType.WORKOUT,
    milestone: 10,
  },
  {
    name: 'Ritmo Constante',
    description: 'Completar 25 treinos',
    type: BadgeType.WORKOUT,
    milestone: 25,
  },
  {
    name: 'Persistente',
    description: 'Completar 50 treinos',
    type: BadgeType.WORKOUT,
    milestone: 50,
  },
  {
    name: 'Veterano',
    description: 'Completar 100 treinos',
    type: BadgeType.WORKOUT,
    milestone: 100,
  },
]

// 💪 Badges baseadas em exercícios concluídos
const exerciseBadges = [
  {
    name: 'Força Inicial',
    description: 'Completar 10 exercícios',
    type: BadgeType.EXERCISE,
    milestone: 10,
  },
  {
    name: 'Constância',
    description: 'Completar 25 exercícios',
    type: BadgeType.EXERCISE,
    milestone: 25,
  },
  {
    name: 'Explosão de Energia',
    description: 'Completar 50 exercícios',
    type: BadgeType.EXERCISE,
    milestone: 50,
  },
  {
    name: 'Máquina de Treinar',
    description: 'Completar 100 exercícios',
    type: BadgeType.EXERCISE,
    milestone: 100,
  },
  {
    name: 'Lenda do Treino',
    description: 'Completar 500 exercícios',
    type: BadgeType.EXERCISE,
    milestone: 500,
  },
]

// 🔥 Badges baseadas em streaks (dias consecutivos)
const streakBadges = [
  {
    name: 'Começo da Jornada',
    description: 'Treinar 3 dias seguidos',
    type: BadgeType.STREAK,
    milestone: 3,
  },
  {
    name: 'Consistente',
    description: 'Treinar 7 dias seguidos',
    type: BadgeType.STREAK,
    milestone: 7,
  },
  {
    name: 'Foco Total',
    description: 'Treinar 14 dias seguidos',
    type: BadgeType.STREAK,
    milestone: 14,
  },
  {
    name: 'Imparável',
    description: 'Treinar 30 dias seguidos',
    type: BadgeType.STREAK,
    milestone: 30,
  },
  {
    name: 'Lenda da Disciplina',
    description: 'Treinar 100 dias seguidos',
    type: BadgeType.STREAK,
    milestone: 100,
  },
]

export async function seedBadges() {
  console.log('🏅 Starting badges seed...')

  const staticBadges = [...workoutBadges, ...exerciseBadges, ...streakBadges]

  for (const badge of staticBadges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: badge,
    })
  }

  const allBadges = await prisma.badge.findMany()

  console.log(`✅ Successfully inserted ${allBadges.length} badges!`)

  const user = await prisma.user.findUnique({
    where: { email: 'joao@example.com' },
  })

  if (!user) throw new Error('User not found!')

  const totalWorkouts = await prisma.workoutSession.count({
    where: { userId: user.id, status: 'COMPLETED' },
  })

  const totalExercises = await prisma.exerciseSession.count({
    where: { completed: true, workoutSession: { userId: user.id } },
  })

  const streak = await prisma.userStreak.findUnique({
    where: { userId: user.id },
  })

  const currentStreak = streak?.bestStreak ?? 0

  console.log({
    totalWorkouts,
    totalExercises,
    currentStreak,
  })

  const badgesToUnlock = allBadges.filter((badge) => {
    if (badge.type === 'WORKOUT') {
      return totalWorkouts >= badge.milestone
    }
    if (badge.type === 'EXERCISE') {
      return totalExercises >= badge.milestone
    }
    if (badge.type === 'STREAK') {
      return currentStreak >= badge.milestone
    }
    return false
  })

  const firstSession = await prisma.workoutSession.findFirst({
    where: { userId: user.id },
    orderBy: { date: 'asc' },
  })
  const baseDate = firstSession?.date ?? new Date()

  for (const badge of badgesToUnlock) {
    const unlockedAt = new Date(baseDate)
    unlockedAt.setDate(unlockedAt.getDate() + badge.milestone)

    await prisma.userBadge.upsert({
      where: {
        userId_badgeId: {
          userId: user.id,
          badgeId: badge.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        badgeId: badge.id,
        unlockedAt,
      },
    })
  }

  console.log(`🎉 Unlocked initial badges for user ${user.name}`)
}

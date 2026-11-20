import { BadgeType } from '../../generated/prisma/index.js'

// 🏋️‍♂️ Badges baseadas em treinos completados
const workoutBadges = [
  {
    code: 'WORKOUT_1',
    name: 'Primeiro Passo',
    description: 'Completar o 1º treino',
    type: BadgeType.WORKOUT,
    milestone: 1,
  },
  {
    code: 'WORKOUT_10',
    name: 'Aquecimento',
    description: 'Completar 10 treinos',
    type: BadgeType.WORKOUT,
    milestone: 10,
  },
  {
    code: 'WORKOUT_25',
    name: 'Ritmo Constante',
    description: 'Completar 25 treinos',
    type: BadgeType.WORKOUT,
    milestone: 25,
  },
  {
    code: 'WORKOUT_50',
    name: 'Persistente',
    description: 'Completar 50 treinos',
    type: BadgeType.WORKOUT,
    milestone: 50,
  },
  {
    code: 'WORKOUT_100',
    name: 'Veterano',
    description: 'Completar 100 treinos',
    type: BadgeType.WORKOUT,
    milestone: 100,
  },
]

// 💪 Badges baseadas em exercícios concluídos
const exerciseBadges = [
  {
    code: 'EXERCISE_10',
    name: 'Força Inicial',
    description: 'Completar 10 exercícios',
    type: BadgeType.EXERCISE,
    milestone: 10,
  },
  {
    code: 'EXERCISE_25',
    name: 'Constância',
    description: 'Completar 25 exercícios',
    type: BadgeType.EXERCISE,
    milestone: 25,
  },
  {
    code: 'EXERCISE_50',
    name: 'Explosão de Energia',
    description: 'Completar 50 exercícios',
    type: BadgeType.EXERCISE,
    milestone: 50,
  },
  {
    code: 'EXERCISE_100',
    name: 'Máquina de Treinar',
    description: 'Completar 100 exercícios',
    type: BadgeType.EXERCISE,
    milestone: 100,
  },
  {
    code: 'EXERCISE_500',
    name: 'Lenda do Treino',
    description: 'Completar 500 exercícios',
    type: BadgeType.EXERCISE,
    milestone: 500,
  },
]

// 🔥 Badges baseadas em streaks (dias consecutivos)
const streakBadges = [
  {
    code: 'STREAK_3',
    name: 'Começo da Jornada',
    description: 'Treinar 3 dias seguidos',
    type: BadgeType.STREAK,
    milestone: 3,
  },
  {
    code: 'STREAK_7',
    name: 'Consistente',
    description: 'Treinar 7 dias seguidos',
    type: BadgeType.STREAK,
    milestone: 7,
  },
  {
    code: 'STREAK_14',
    name: 'Foco Total',
    description: 'Treinar 14 dias seguidos',
    type: BadgeType.STREAK,
    milestone: 14,
  },
  {
    code: 'STREAK_30',
    name: 'Imparável',
    description: 'Treinar 30 dias seguidos',
    type: BadgeType.STREAK,
    milestone: 30,
  },
  {
    code: 'STREAK_100',
    name: 'Lenda da Disciplina',
    description: 'Treinar 100 dias seguidos',
    type: BadgeType.STREAK,
    milestone: 100,
  },
]

export async function seedBadges(prisma) {
  console.log('🏅 Starting badges seed...')

  const staticBadges = [...workoutBadges, ...exerciseBadges, ...streakBadges]

  for (const badge of staticBadges) {
    const existing = await prisma.badge.findUnique({
      where: { code: badge.code },
    })
    // Adopt pre-code catalog rows once, retaining IDs and user awards.
    const legacy = existing
      ? null
      : await prisma.badge.findUnique({ where: { name: badge.name } })
    if (legacy?.code && legacy.code !== badge.code) {
      throw new Error(
        `Badge name already belongs to another code: ${badge.code}`
      )
    }
    const current = existing ?? legacy
    if (
      current &&
      (current.type !== badge.type || current.milestone !== badge.milestone)
    ) {
      throw new Error(
        `Badge rule change rejected for ${badge.code}. Create a new badge code or apply an explicit data migration with an award policy.`
      )
    }
    if (current) {
      await prisma.badge.update({
        where: { id: current.id },
        data: {
          code: badge.code,
          name: badge.name,
          description: badge.description,
        },
      })
    } else {
      await prisma.badge.create({ data: badge })
    }
  }

  const allBadges = await prisma.badge.findMany()

  console.log(`✅ Successfully inserted ${allBadges.length} badges!`)
}

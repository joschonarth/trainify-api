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
    description: 'Completar 50 exercícios',
    type: BadgeType.EXERCISE,
    milestone: 50,
  },
  {
    name: 'Explosão de Energia',
    description: 'Completar 100 exercícios',
    type: BadgeType.EXERCISE,
    milestone: 100,
  },
  {
    name: 'Máquina de Treinar',
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

async function main() {
  console.log('🌱 Starting badges seed...')

  const allBadges = [...workoutBadges, ...exerciseBadges, ...streakBadges]

  for (const badge of allBadges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: badge,
    })
  }

  console.log(`✅ Successfully inserted ${allBadges.length} badges!`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

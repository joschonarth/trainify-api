import { prisma as prismaBadges, seedBadges } from './badges.seed'
import { prisma as prismaExercises, seedExercises } from './exercises.seed'

async function main() {
  await seedBadges()
  await seedExercises()

  console.log('🎉 All seeds executed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prismaBadges.$disconnect()
    await prismaExercises.$disconnect()
  })

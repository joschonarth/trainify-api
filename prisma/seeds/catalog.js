import { seedBadges } from './badges.seed.js'
import { prisma } from './prisma.js'

prisma
  .$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(706006)`
      await seedBadges(tx)
    },
    { timeout: 120_000 }
  )
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())

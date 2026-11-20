export async function seedDemoBadges(prisma, userId) {
  const allBadges = await prisma.badge.findMany()
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new Error('User not found!')
  }

  const totalWorkouts = await prisma.workoutSession.count({
    where: { userId: user.id, status: 'COMPLETED' },
  })

  const totalExercises = await prisma.exerciseSession.count({
    where: { completed: true, workoutSession: { userId: user.id } },
  })

  const streak = await prisma.userStreak.findUnique({
    where: { userId: user.id },
  })

  const bestStreak = streak?.bestStreak ?? 0

  console.log({
    totalWorkouts,
    totalExercises,
    bestStreak,
  })

  const badgesToUnlock = allBadges.filter((badge) => {
    if (badge.type === 'WORKOUT') {
      return totalWorkouts >= badge.milestone
    }
    if (badge.type === 'EXERCISE') {
      return totalExercises >= badge.milestone
    }
    if (badge.type === 'STREAK') {
      return bestStreak >= badge.milestone
    }
    return false
  })

  for (const badge of badgesToUnlock) {
    const unlockedAt = new Date()

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

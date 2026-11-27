import { randomUUID } from 'node:crypto'
import { afterAll, describe, expect, it } from 'vitest'
import { prisma } from '@/lib/prisma'
import { PrismaWorkoutExercisesRepository } from '@/modules/workout/repositories/prisma/prisma-workout-exercises.repository'
import { ExerciseUnavailableError } from '../../errors/exercise-unavailable.error'
import { AdminGlobalExercisesUseCase } from '../../use-cases/admin-global-exercises.use-case'
import { PrismaExercisesRepository } from './prisma-exercises.repository'
import { PrismaMyExercisesRepository } from './prisma-my-exercises.repository'

const enabled = process.env.TRAINIFY_ADMIN_DB_TEST === '1'
if (enabled) {
  const database = new URL(process.env.DATABASE_URL ?? '').pathname.slice(1)
  if (!database.startsWith('trainify_admin_test_')) {
    throw new Error(
      'Integration tests require a dedicated trainify_admin_test_ database.'
    )
  }
}

describe.skipIf(!enabled)(
  'Admin global exercises PostgreSQL integration',
  () => {
    const exercises = new PrismaExercisesRepository()
    const library = new PrismaMyExercisesRepository()
    const workouts = new PrismaWorkoutExercisesRepository()
    const admin = new AdminGlobalExercisesUseCase(exercises)

    afterAll(async () => {
      await prisma.$disconnect()
    })

    async function fixture() {
      const user = await prisma.user.create({
        data: { name: 'Integration', email: `${randomUUID()}@example.test` },
      })
      const workout = await prisma.workout.create({
        data: { name: 'Integration', userId: user.id },
      })
      const exercise = await exercises.create({
        name: randomUUID(),
        isCustom: false,
      })
      return { user, workout, exercise }
    }

    it('defaults users to USER and preserves existing library and workout references through archive and restore', async () => {
      const { user, workout, exercise } = await fixture()
      expect(user.role).toBe('USER')
      const entry = await library.addExercise(user.id, exercise.id)
      const link = await workouts.addExerciseAtNextPosition(workout.id, {
        workout: { connect: { id: workout.id } },
        exercise: { connect: { id: exercise.id } },
      })
      await admin.setArchived(exercise.id, true)
      await admin.setArchived(exercise.id, true)
      expect(await library.findById(entry.id)).not.toBeNull()
      expect(await workouts.findById(link.id)).not.toBeNull()
      expect(await exercises.findGlobalById(exercise.id)).toBeNull()
      await admin.setArchived(exercise.id, false)
      await admin.setArchived(exercise.id, false)
      expect(await exercises.findGlobalById(exercise.id)).toMatchObject({
        id: exercise.id,
        name: exercise.name,
      })
    })

    it('enforces concurrent case insensitive uniqueness and reserves archived names', async () => {
      const name = randomUUID()
      const results = await Promise.allSettled([
        exercises.create({ name, isCustom: false }),
        exercises.create({ name: name.toUpperCase(), isCustom: false }),
      ])
      expect(
        results.filter((result) => result.status === 'fulfilled')
      ).toHaveLength(1)
      expect(
        results.find((result) => result.status === 'rejected')
      ).toMatchObject({ reason: { code: 'P2002' } })
      const winner = await exercises.findGlobalByName(name)
      expect(winner).not.toBeNull()
      if (!winner) {
        throw new Error('Expected global exercise')
      }
      await admin.setArchived(winner.id, true)
      await expect(
        exercises.create({ name, isCustom: false })
      ).rejects.toMatchObject({ code: 'P2002' })
    })

    it.each([
      'library',
      'workout',
    ] as const)('rejects a pending %s association after the archive transaction commits', async (target) => {
      const { user, workout, exercise } = await fixture()
      let release: () => void = () => undefined
      let locked: () => void = () => undefined
      const gate = new Promise<void>((resolve) => {
        release = resolve
      })
      const ready = new Promise<void>((resolve) => {
        locked = resolve
      })
      const archive = prisma.$transaction(
        async (tx) => {
          await tx.$queryRaw`SELECT id FROM exercises WHERE id = ${exercise.id} FOR UPDATE`
          await tx.exercise.update({
            where: { id: exercise.id },
            data: { archivedAt: new Date() },
          })
          locked()
          await gate
        },
        { timeout: 15_000 }
      )
      await ready
      const association =
        target === 'library'
          ? library.addExercise(user.id, exercise.id)
          : workouts.addExerciseAtNextPosition(workout.id, {
              workout: { connect: { id: workout.id } },
              exercise: { connect: { id: exercise.id } },
            })
      const result = association.catch((error: unknown) => error)
      try {
        const deadline = Date.now() + 5000
        let blocked = false
        while (Date.now() < deadline && !blocked) {
          const rows = await prisma.$queryRaw<Array<{ blocked: boolean }>>`
          SELECT EXISTS (
            SELECT 1 FROM pg_stat_activity
            WHERE datname = current_database() AND wait_event_type = 'Lock'
              AND query LIKE '%SELECT id FROM exercises%FOR UPDATE%'
          ) AS blocked
        `
          blocked = rows[0]?.blocked ?? false
        }
        expect(blocked).toBe(true)
      } finally {
        release()
        await archive
      }
      expect(await result).toBeInstanceOf(ExerciseUnavailableError)
      expect(
        await library.findByUserAndExercise(user.id, exercise.id)
      ).toBeNull()
      expect(
        await workouts.findByWorkoutAndExercise(workout.id, exercise.id)
      ).toBeNull()
    })
  }
)

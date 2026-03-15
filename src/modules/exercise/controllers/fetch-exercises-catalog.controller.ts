import type { FastifyReply, FastifyRequest } from 'fastify'
import { ExerciseCategory } from 'generated/prisma'
import z from 'zod'
import { makeFetchExercisesCatalogUseCase } from '../use-cases/factories/make-fetch-exercises-catalog-use-case'

export async function fetchExercisesCatalogController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const fetchExercisesCatalogSchema = z.object({
    query: z.string().optional().default(''),
    category: z.enum(ExerciseCategory).optional().default(undefined),
    page: z.coerce.number().min(1).default(1),
  })

  const { query, category, page } = fetchExercisesCatalogSchema.parse(
    request.query
  )

  const fetchExercisesCatalogUseCase = makeFetchExercisesCatalogUseCase()

  const { exercises } = await fetchExercisesCatalogUseCase.execute({
    query,
    category,
    page,
  })

  return reply.status(200).send({ exercises })
}

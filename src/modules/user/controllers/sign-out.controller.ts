import { FastifyReply, FastifyRequest } from 'fastify'

import { makeSignOutUseCase } from '@/modules/user/use-cases/factories/make-sign-out-use-case'

export async function signOutController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const signOutUseCase = makeSignOutUseCase()

  await signOutUseCase.execute()

  reply.clearCookie('token', {
    path: '/',
  })

  return reply.status(200).send()
}

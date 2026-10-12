import type { FastifyReply, FastifyRequest } from 'fastify'

import { makeChangePasswordUseCase } from '@/modules/user/use-cases/factories/make-change-password-use-case'
import type { ChangePasswordBody } from '../schemas/change-password.schema'

export async function changePasswordController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { currentPassword, newPassword, passwordConfirmation } =
    request.body as ChangePasswordBody

  const changePasswordUseCase = makeChangePasswordUseCase()

  await changePasswordUseCase.execute({
    userId: request.user.sub,
    currentPassword,
    newPassword,
    passwordConfirmation,
  })

  return reply.status(200).send()
}

import type { FastifyReply, FastifyRequest } from 'fastify'

import { makeChangePasswordUseCase } from '@/modules/user/use-cases/factories/make-change-password-use-case'
import { issueAuthTokens } from '@/modules/user/utils/auth-tokens'
import type { ChangePasswordBody } from '../schemas/change-password.schema'

export async function changePasswordController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { currentPassword, newPassword, passwordConfirmation } =
    request.body as ChangePasswordBody

  const changePasswordUseCase = makeChangePasswordUseCase()

  const { user } = await changePasswordUseCase.execute({
    userId: request.user.sub,
    currentPassword,
    newPassword,
    passwordConfirmation,
  })
  const { token } = await issueAuthTokens(reply, user)

  return reply.status(200).send({ token })
}

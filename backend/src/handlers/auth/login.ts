import { createSessionToken, isAdminEmail, isValidEmail, verifyPassword } from '../../lib/auth.js'
import { badRequest, ok, parseBody, unauthorized, withErrors } from '../../lib/http.js'
import { getRepository } from '../../repository/factory.js'
import { loadMyRanking } from '../../services/boardService.js'
import { toPublicUser } from '../../domain/types.js'

interface Body { email?: string; password?: string }

/** POST /auth/login — acceso con credenciales de una cuenta creada previamente. */
export const handler = withErrors('POST /auth/login', async (event) => {
  const body = parseBody<Body>(event)
  const email = (body.email ?? '').trim().toLowerCase()
  const password = body.password ?? ''
  if (!isValidEmail(email) || password.length < 1 || password.length > 200) {
    throw badRequest('Introduce un correo y una contraseña válidos.')
  }
  const repository = getRepository()
  const user = await repository.findUserByEmail(email)
  // Mismo error para cuenta inexistente y contraseña incorrecta.
  if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    throw unauthorized('Correo o contraseña incorrectos.')
  }
  if (user.emailVerified === false) {
  throw unauthorized('Debes confirmar tu correo antes de iniciar sesión.')
}
  const [ranking, admin] = await Promise.all([
    loadMyRanking(repository, user.id), isAdminEmail(user.email),
  ])
  return ok({
    sessionToken: await createSessionToken(user.id, user.email),
    user: toPublicUser(user, ranking.myRank ?? ranking.totalPlayers + 1, ranking.myPoints, admin),
  })
})

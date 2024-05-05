// Este bloque de código importa varios módulos y tipos necesarios para el funcionamiento del servidor.
// Incluye tipos relacionados con el contexto de Express, errores TRPC y solicitudes de carga útil.
import { User } from '@/payload-types'
import { ExpressContext } from '@/server'
import { TRPCError, initTRPC } from '@trpc/server'
import { PayloadRequest } from 'payload/types'
// Se inicializa TRPC con el contexto de Express y se crea un middleware.
const t = initTRPC.context<ExpressContext>().create()
const middleware = t.middleware
// Se define un middleware de autenticación que verifica si el usuario está autenticado.
const isAuth = middleware(async ({ ctx, next }) => {
   // Se obtiene la solicitud del contexto de Express.
  const req = ctx.req as PayloadRequest
// Se extrae el usuario de la solicitud.
  const { user } = req as { user: User | null }
  // Se verifica si existe un usuario autenticado.
  if (!user || !user.id) {
     // Si no hay usuario autenticado, se lanza un error de TRPC de "no autorizado".
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
// Si el usuario está autenticado, se pasa al siguiente middleware
  return next({
    ctx: {
      user,
    },
  })
})
// Se exportan las siguientes constantes:
// - router: el enrutador TRPC
// - publicProcedure: un procedimiento TRPC público
// - privateProcedure: un procedimiento TRPC privado que utiliza el middleware de autenticación
export const router = t.router
export const publicProcedure = t.procedure
export const privateProcedure = t.procedure.use(isAuth)

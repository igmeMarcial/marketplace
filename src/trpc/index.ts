// Este bloque de código define un enrutador de aplicación que gestiona varias rutas y procedimientos,
// incluidos procedimientos para la autenticación, pagos y recuperación de productos paginados.
// Cada procedimiento define su propia lógica de negocio para manejar las solicitudes entrantes y
// devolver una respuesta adecuada.
import { z } from 'zod'
import { authRouter } from './auth-router'
import { publicProcedure, router } from './trpc'
import { QueryValidator } from '../lib/validators/query-validator'
import { getPayloadClient } from '../get-payload'
import { paymentRouter } from './payment-router'
// Se define un enrutador de aplicación que contiene varias rutas y procedimientos.
export const appRouter = router({
   // Se definen las rutas para la autenticación y los pagos.
  auth: authRouter,
  payment: paymentRouter,
// Se define un procedimiento público llamado `getInfiniteProducts` que acepta una entrada (un esquema validado)
  // y devuelve una lista de productos paginada basada en los parámetros de entrada.
  getInfiniteProducts: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100),
        cursor: z.number().nullish(),
        query: QueryValidator,
      })
    )
    .query(async ({ input }) => {
      // Se extraen los parámetros de entrada.
      const { query, cursor } = input
      const { sort, limit, ...queryOpts } = query
// Se obtiene el cliente de carga útil.
      const payload = await getPayloadClient()
// Se inicializa un objeto para almacenar las opciones de consulta analizadas.
      const parsedQueryOpts: Record<
        string,
        { equals: string }
      > = {}
// Se recorren las opciones de consulta y se almacenan en el objeto analizado.
      Object.entries(queryOpts).forEach(([key, value]) => {
        parsedQueryOpts[key] = {
          equals: value,
        }
      })
  // Se establece el número de página actual.
      const page = cursor || 1
 // Se realiza una consulta al cliente de carga útil para obtener los productos paginados.
      const {
        docs: items,
        hasNextPage,
        nextPage,
      } = await payload.find({
        collection: 'products',
        where: {
          approvedForSale: {
            equals: 'approved',
          },
          ...parsedQueryOpts,
        },
        sort,
        depth: 1,
        limit,
        page,
      })
 // Se devuelve la lista de productos y la siguiente página si existe.
      return {
        items,
        nextPage: hasNextPage ? nextPage : null,
      }
    }),
})
// Se define un tipo `AppRouter` que representa el tipo de datos del enrutador de la aplicación (`appRouter`).
export type AppRouter = typeof appRouter

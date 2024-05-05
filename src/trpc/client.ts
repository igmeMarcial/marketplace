/*En resumen, este archivo define y exporta un cliente TRPC React que se puede utilizar para
 realizar solicitudes TRPC desde el lado del cliente en una aplicación React, utilizando el enrutador
  TRPC definido en tu aplicación.*/

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from ".";
export const trpc = createTRPCReact<AppRouter>({});

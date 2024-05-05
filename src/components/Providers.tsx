"use client";

import { PropsWithChildren, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc } from "@/trpc/client";
import { httpBatchLink } from "@trpc/client";

// Componente Providers
const Providers = ({ children }: PropsWithChildren) => {
  // Estado local para el cliente de consulta y el cliente trpc
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    // Crea un cliente trpc con un enlace httpBatchLink
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/trpc`, // URL del servidor trpc
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: "include", // Incluye las credenciales al hacer la solicitud
            });
          },
        }),
      ],
    })
  );
  // Retorna los proveedores trpc y QueryClientProvider que envuelven a los hijos
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};

export default Providers;

/*
En resumen, este código establece la configuración inicial para la gestión de solicitudes y 
datos en una aplicación React utilizando trpc para la comunicación cliente-servidor y react-query 
para la gestión de consultas y caché de datos. El componente Providers envuelve a los componentes 
hijos con estos proveedores para que puedan acceder a las funcionalidades de comunicación y consulta 
de datos proporcionadas por trpc y react-query.*/

"use client";

import { Icons } from "@/components/Icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { toast } from "sonner";
import { ZodError } from "zod";
import { useRouter } from "next/navigation";
import {
  AuthCredentialsValidator,
  TAuthCredentialsValidator,
} from "@/lib/validators/account-credentials-validator";
import { trpc } from "@/trpc/client";

const Page = () => {
  // Inicializa el formulario y maneja su estado y validación utilizando `useForm` del hook `react-hook-form`.
  // Define el esquema de validación utilizando `zodResolver` y el validador `AuthCredentialsValidator`.
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TAuthCredentialsValidator>({
    resolver: zodResolver(AuthCredentialsValidator),
  });
  // Obtiene acceso al objeto de enrutamiento utilizando el hook `useRouter` de `next/navigation`.

  const router = useRouter();

  // El siguiente bloque de código define una mutación utilizando `trpc.auth.createPayloadUser.useMutation`.
  // Esta mutación se utiliza para enviar datos al servidor y manejar su resultado.
  // Se define una función `onError` que se ejecutará si hay un error en la mutación.
  // En el caso de un error de conflicto (CONFLICT), se muestra un mensaje de error indicando que el correo electrónico ya está en uso.
  // Si el error es una instancia de `ZodError`, se muestra el primer mensaje de error.
  // Si ocurre cualquier otro tipo de error, se muestra un mensaje de error genérico.
  // Se define una función `onSuccess` que se ejecutará si la mutación tiene éxito.
  // En este caso, se muestra un mensaje de éxito indicando que se ha enviado un correo electrónico de verificación y se redirige al usuario a la página de verificación de correo electrónico.

  const { mutate, isLoading } = trpc.auth.createPayloadUser.useMutation({
    onError: (err) => {
      if (err.data?.code === "CONFLICT") {
        toast.error("This email is already in use. Sign in instead?");

        return;
      }

      if (err instanceof ZodError) {
        toast.error(err.issues[0].message);

        return;
      }

      toast.error("Something went wrong. Please try again.");
    },
    onSuccess: ({ sentToEmail }) => {
      toast.success(`Verification email sent to ${sentToEmail}.`);
      router.push("/verify-email?to=" + sentToEmail);
    },
  });

  const onSubmit = ({ email, password }: TAuthCredentialsValidator) => {
    mutate({ email, password });
  };

  return (
    <>
      <div className="container relative flex pt-20 flex-col items-center justify-center lg:px-0">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col items-center space-y-2 text-center">
            <Icons.logo className="h-20 w-20" />
            <h1 className="text-2xl font-semibold tracking-tight">
              Crear una cuenta
            </h1>

            <Link
              className={buttonVariants({
                variant: "link",
                className: "gap-1.5",
              })}
              href="/sign-in"
            >
              ¿Ya tienes una cuenta? Iniciar sesión
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-2">
                <div className="grid gap-1 py-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    {...register("email")}
                    className={cn({
                      "focus-visible:ring-red-500": errors.email,
                    })}
                    placeholder="tucorreo@example.com"
                  />
                  {errors?.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-1 py-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    {...register("password")}
                    type="password"
                    className={cn({
                      "focus-visible:ring-red-500": errors.password,
                    })}
                    placeholder="Password"
                  />
                  {errors?.password && (
                    <p className="text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button>Crear</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div></div>
    </>
  );
};

export default Page;

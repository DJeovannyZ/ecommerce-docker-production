import type { Metadata } from "next";
import Link from "next/link";

import { RegisterForm } from "@/components/auth/register-form";
import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Registrate para comprar y consultar el historial de tus ordenes.",
  robots: { index: false, follow: true },
};

export default function RegisterPage() {
  return (
    <Container className="py-14">
      <div className="mx-auto max-w-md space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Crear cuenta</h1>
          <p className="text-sm text-slate-600">
            El registro llama a{" "}
            <code className="rounded bg-slate-100 px-1">POST /auth/register</code> mediante un
            Server Action y guarda el token en una cookie httpOnly.
          </p>
        </header>

        <RegisterForm />

        <p className="text-sm text-slate-600">
          Ya tienes cuenta?{" "}
          <Link href="/login" className="font-semibold text-indigo-700 hover:underline">
            Inicia sesion
          </Link>
        </p>
      </div>
    </Container>
  );
}

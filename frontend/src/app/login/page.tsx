import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { Container } from "@/components/layout/container";
import { Alert } from "@/components/ui/alert";
import { safeNextPath } from "@/lib/auth/redirect";

export const metadata: Metadata = {
  title: "Iniciar sesion",
  description: "Accede a tu cuenta para crear ordenes y consultar tu historial de compras.",
  robots: { index: false, follow: true },
};

export default function LoginPage(props: PageProps<"/login">) {
  return (
    <Container className="py-14">
      <div className="mx-auto max-w-md space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Ingresar</h1>
          <p className="text-sm text-slate-600">
            La sesion se guarda como cookie httpOnly emitida por el servidor.
          </p>
        </header>

        <Suspense fallback={<div className="wv-skeleton h-72 w-full rounded-2xl" />}>
          <LoginSection searchParams={props.searchParams} />
        </Suspense>
      </div>
    </Container>
  );
}

async function LoginSection({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const params = await searchParams;
  const next = safeNextPath(typeof params.next === "string" ? params.next : null);
  const reason = typeof params.reason === "string" ? params.reason : "";

  return (
    <div className="space-y-5">
      {reason === "session-expired" ? (
        <Alert tone="warning" title="Tu sesion expiro">
          El token JWT vencio. Ingresa nuevamente para continuar.
        </Alert>
      ) : null}

      <LoginForm next={next} />

      <div className="space-y-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
        <p className="font-semibold text-slate-900">Cuentas de demostracion</p>
        <p>
          Cliente: <code className="rounded bg-slate-100 px-1">customer@example.com</code> /{" "}
          <code className="rounded bg-slate-100 px-1">password</code>
        </p>
        <p>
          Admin: <code className="rounded bg-slate-100 px-1">admin@example.com</code> /{" "}
          <code className="rounded bg-slate-100 px-1">password</code>
        </p>
      </div>

      <p className="text-sm text-slate-600">
        No tienes cuenta?{" "}
        <Link href="/register" className="font-semibold text-indigo-700 hover:underline">
          Crear una cuenta
        </Link>
      </p>
    </div>
  );
}

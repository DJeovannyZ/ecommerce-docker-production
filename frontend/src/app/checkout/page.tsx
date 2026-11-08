import type { Metadata } from "next";
import { Suspense } from "react";

import { CheckoutView } from "@/components/checkout/checkout-view";
import { Container } from "@/components/layout/container";
import { Alert } from "@/components/ui/alert";
import { Card, CardBody } from "@/components/ui/card";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Confirma tu orden y completa el pago con Stripe Checkout.",
  robots: { index: false, follow: false },
};

const STEPS = ["Carrito", "Datos de la orden", "Pago en Stripe", "Confirmacion"] as const;

function CheckoutSteps({ current = 2 }: { current?: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-3 text-sm">
      {STEPS.map((step, index) => {
        const position = index + 1;
        const isDone = position < current;
        const isCurrent = position === current;

        return (
          <li key={step} className="flex items-center gap-2">
            <span
              className={
                isCurrent
                  ? "inline-flex size-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white"
                  : isDone
                    ? "inline-flex size-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white"
                    : "inline-flex size-6 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600"
              }
            >
              {position}
            </span>
            <span className={isCurrent ? "font-semibold text-slate-900" : "text-slate-500"}>
              {step}
            </span>
            {position < STEPS.length ? (
              <span aria-hidden="true" className="text-slate-300">
                /
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

/** Lee la sesion en el servidor: por eso vive dentro de un limite <Suspense>. */
async function CheckoutSection() {
  const user = await getSessionUser();

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-6">
        <Card>
          <CardBody className="space-y-2 text-sm">
            <h2 className="text-sm font-bold text-slate-900">Cuenta del comprador</h2>
            {user ? (
              <p className="text-slate-600">
                Orden a nombre de <span className="font-semibold text-slate-900">{user.name}</span>{" "}
                ({user.email}).
              </p>
            ) : (
              <Alert tone="warning" title="Sesion no detectada">
                Necesitas iniciar sesion para crear la orden y pagar.
              </Alert>
            )}
            <p className="text-xs text-slate-500">
              El JWT viaja en una cookie httpOnly enviada al servidor; nunca se expone al navegador.
            </p>
          </CardBody>
        </Card>

        <CheckoutView />
      </div>

      <aside className="space-y-4">
        <Card>
          <CardBody className="space-y-3 text-sm text-slate-600">
            <h2 className="text-sm font-bold text-slate-900">Protecciones aplicadas</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>La orden se crea con un Server Action autenticado.</li>
              <li>La cookie de sesion es httpOnly y SameSite=Lax.</li>
              <li>
                El catalogo se revalida con <code>revalidateTag(&quot;products&quot;)</code>.
              </li>
              <li>El historial se revalida tras confirmar el pago.</li>
            </ul>
          </CardBody>
        </Card>
      </aside>
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div aria-hidden="true" className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-6">
        <div className="wv-skeleton h-24 w-full rounded-2xl" />
        <div className="wv-skeleton h-72 w-full rounded-2xl" />
      </div>
      <div className="wv-skeleton h-56 w-full rounded-2xl" />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Container className="space-y-8 py-12">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Checkout</h1>
        <CheckoutSteps current={2} />
      </header>

      <Suspense fallback={<CheckoutSkeleton />}>
        <CheckoutSection />
      </Suspense>
    </Container>
  );
}

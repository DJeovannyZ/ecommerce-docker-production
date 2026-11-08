import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Pago cancelado",
  description: "El pago fue cancelado. Tu carrito sigue disponible.",
  robots: { index: false, follow: false },
};

export default function CheckoutCancelPage() {
  return (
    <Container className="space-y-8 py-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Pago cancelado</h1>
        <p className="text-sm text-slate-600">
          No se realizo ningun cobro. Puedes retomar tu compra cuando quieras.
        </p>
      </header>

      <Alert tone="warning" title="La orden quedo pendiente">
        Stripe informo que cancelaste el checkout. La orden sigue registrada como pendiente en la
        API, pero el stock no se decrementa hasta que el pago se confirme.
      </Alert>

      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/checkout">Reintentar el pago</ButtonLink>
        <ButtonLink href="/cart" variant="secondary">
          Revisar el carrito
        </ButtonLink>
        <ButtonLink href="/products" variant="ghost">
          Seguir comprando
        </ButtonLink>
      </div>
    </Container>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";

import { ClearCartOnMount } from "@/components/checkout/clear-cart-on-mount";
import { PaymentStatusPanel } from "@/components/checkout/payment-status-panel";
import { Container } from "@/components/layout/container";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { isApiError } from "@/lib/api/errors";
import { getOrderPayment } from "@/lib/api/orders";
import { getPendingOrder, getSessionToken } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Confirmacion de compra",
  description: "Estado del pago de tu orden despues de pagar con Stripe.",
  robots: { index: false, follow: false },
};

function parseOrderParam(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export default function CheckoutSuccessPage(props: PageProps<"/checkout/success">) {
  return (
    <Container className="space-y-8 py-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Confirmacion de compra</h1>
        <p className="text-sm text-slate-600">
          Verificamos el estado del pago contra la API usando tu sesion httpOnly.
        </p>
      </header>

      <Suspense fallback={<PaymentSkeleton />}>
        <PaymentResult searchParams={props.searchParams} />
      </Suspense>
    </Container>
  );
}

async function PaymentResult({
  searchParams,
}: Pick<PageProps<"/checkout/success">, "searchParams">) {
  const params = await searchParams;
  const sessionId = typeof params.session_id === "string" ? params.session_id : "";
  const isDemo = params.demo === "1";
  const demoReason = typeof params.reason === "string" ? params.reason : "";
  const orderFromQuery = parseOrderParam(params.order);

  const [pendingOrder, token] = await Promise.all([getPendingOrder(), getSessionToken()]);
  const orderId = pendingOrder ?? orderFromQuery;

  if (!orderId) {
    return (
      <Alert tone="warning" title="No encontramos una orden pendiente">
        Vuelve al catalogo y crea una orden nueva. Si ya pagaste, revisa tu historial de compras.
      </Alert>
    );
  }

  if (!token) {
    return (
      <Alert tone="warning" title="Tu sesion expiro">
        Inicia sesion nuevamente para consultar el estado del pago de la orden #{orderId}.
      </Alert>
    );
  }

  let payment = null;

  try {
    payment = await getOrderPayment(token, orderId);
  } catch (error) {
    if (isApiError(error) && error.isUnauthorized) {
      return (
        <Alert tone="warning" title="Tu sesion expiro">
          Inicia sesion nuevamente para consultar el estado del pago de la orden #{orderId}.
        </Alert>
      );
    }

    throw error;
  }

  return (
    <>
      <ClearCartOnMount />

      {isDemo ? (
        <Alert tone="warning" title="Modo demo: Stripe no esta configurado">
          <p>
            La orden <strong>#{orderId}</strong> se creo correctamente en la API, pero no se pudo
            iniciar el pago porque el backend no tiene claves de Stripe. No hubo redireccion al
            checkout de Stripe.
          </p>
          {demoReason ? <p className="mt-1 font-mono text-xs">Detalle: {demoReason}</p> : null}
          <p className="mt-1">
            Para el flujo real define <code>STRIPE_KEY</code> y <code>STRIPE_SECRET</code> en el
            <code>.env</code> de la API y repite el checkout.
          </p>
        </Alert>
      ) : null}

      <PaymentStatusPanel
        orderId={orderId}
        sessionId={sessionId}
        initialPayment={payment}
        demo={isDemo}
      />

      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/checkout" variant="secondary">
          Reintentar el checkout
        </ButtonLink>
        <ButtonLink href="/products" variant="ghost">
          Volver al catalogo
        </ButtonLink>
      </div>
    </>
  );
}

function PaymentSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-4">
      <div className="wv-skeleton h-28 w-full rounded-2xl" />
      <div className="wv-skeleton h-40 w-full rounded-2xl" />
    </div>
  );
}

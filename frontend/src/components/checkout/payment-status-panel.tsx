"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { simulatePaymentAction } from "@/actions/payments";
import { Alert } from "@/components/ui/alert";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/card";
import type { PaymentDto } from "@/lib/api/types";
import { formatCurrency, formatDate } from "@/lib/format";

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 20;

interface PaymentApiResponse {
  ok: boolean;
  payment: PaymentDto | null;
  message?: string;
}

/**
 * Estado del pago de la orden.
 *
 * Mientras el pago esta `pending` se consulta `GET /api/orders/{id}/payment` a
 * traves de un Route Handler propio: el JWT sigue en la cookie httpOnly y nunca
 * llega al JavaScript del navegador.
 */
export function PaymentStatusPanel({
  orderId,
  sessionId,
  initialPayment,
  demo = false,
}: {
  orderId: number;
  sessionId: string;
  initialPayment: PaymentDto | null;
  demo?: boolean;
}) {
  const router = useRouter();
  const [payment, setPayment] = useState<PaymentDto | null>(initialPayment);
  const [pollCount, setPollCount] = useState(0);
  const [polling, setPolling] = useState(initialPayment?.status === "pending");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const fetchPayment = useCallback(async (): Promise<PaymentDto | null> => {
    try {
      const response = await fetch(`/api/orders/${orderId}/payment`, { cache: "no-store" });

      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as PaymentApiResponse;

      return payload.payment;
    } catch {
      return null;
    }
  }, [orderId]);

  useEffect(() => {
    if (!polling || pollCount >= MAX_POLLS) {
      return;
    }

    const timer = window.setTimeout(async () => {
      const next = await fetchPayment();

      if (next) {
        setPayment(next);

        if (next.status !== "pending") {
          setPolling(false);
          router.refresh();
          return;
        }
      }

      setPollCount((count) => count + 1);
    }, POLL_INTERVAL_MS);

    return () => window.clearTimeout(timer);
  }, [polling, pollCount, fetchPayment, router]);

  function handleSimulate() {
    setError(null);
    setNotice(null);

    startTransition(async () => {
      const result = await simulatePaymentAction({ orderId, sessionId });

      if (!result.ok) {
        setError(result.message);
        return;
      }

      const next = await fetchPayment();

      setPayment(next);
      setPolling(false);
      setNotice(result.message);
      router.refresh();
    });
  }

  const status = payment?.status ?? "pending";
  const isPaid = status === "paid";
  const isFailed = status === "failed" || status === "refunded";
  const canSimulate = sessionId.length > 0 && !isPaid;

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Orden #{orderId}</h2>
          <p className="text-xs text-slate-500">
            {payment ? `Pago creado el ${formatDate(payment.created_at)}` : "Sin pago registrado"}
          </p>
        </div>
        <Badge tone={payment ? statusTone(status) : "neutral"}>
          {payment?.status_label ?? "Sin pago"}
        </Badge>
      </CardHeader>

      <CardBody className="space-y-4">
        {!payment ? (
          <Alert tone="warning" title="La API no registro un pago para esta orden">
            {demo
              ? "El modo demo no pudo crear la Checkout Session de Stripe, por lo que no existe una sesion de pago asociada. Configura STRIPE_KEY y STRIPE_SECRET en el backend y repite el checkout para ver el flujo real."
              : "Todavia no existe un pago asociado. Vuelve al checkout para iniciar el pago."}
          </Alert>
        ) : isPaid ? (
          <Alert tone="success" title="Pago confirmado">
            La API marco el pago como pagado, decremento el stock y revalido el catalogo y tu
            historial.
          </Alert>
        ) : isFailed ? (
          <Alert tone="danger" title="El pago no se completo" role="alert">
            {payment.failure_reason ?? "Stripe reporto un pago fallido para esta orden."}
          </Alert>
        ) : (
          <Alert tone="warning" title="Pago pendiente">
            Stripe todavia no confirmo el pago de esta orden.
            {polling ? " Consultando el estado automaticamente..." : ""}
          </Alert>
        )}

        {notice ? (
          <Alert tone="success" title="Pago confirmado">
            {notice}
          </Alert>
        ) : null}

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs tracking-wide text-slate-500 uppercase">Monto</dt>
            <dd className="font-semibold text-slate-900">{formatCurrency(payment?.amount ?? 0)}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs tracking-wide text-slate-500 uppercase">Sesion de Stripe</dt>
            <dd className="truncate font-mono text-xs text-slate-700">
              {payment?.stripe_session_id ?? sessionId ?? "No disponible"}
            </dd>
          </div>
        </dl>

        {error ? (
          <Alert tone="danger" role="alert" title="No se pudo confirmar el pago">
            {error}
          </Alert>
        ) : null}

        {!isPaid ? (
          <div className="space-y-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-600">
              Demostracion del ciclo completo: este boton envia a la API el evento{" "}
              <code className="rounded bg-white px-1">checkout.session.completed</code> que Stripe
              dispararia por webhook (la API omite la verificacion de firma cuando{" "}
              <code className="rounded bg-white px-1">STRIPE_WEBHOOK_SECRET</code> esta vacio).
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleSimulate}
              disabled={pending || !canSimulate}
              title={canSimulate ? undefined : "Requiere una Checkout Session creada por Stripe"}
            >
              {pending ? "Enviando evento..." : "Simular webhook de pago confirmado"}
            </Button>
            {!canSimulate ? (
              <p className="text-xs text-slate-500">
                Disponible solo cuando la API pudo crear la Checkout Session de Stripe.
              </p>
            ) : null}
          </div>
        ) : null}
      </CardBody>

      <CardFooter className="flex flex-wrap gap-3">
        <ButtonLink href="/orders" variant="secondary">
          Ver mi historial
        </ButtonLink>
        <ButtonLink href="/products" variant="ghost">
          Seguir comprando
        </ButtonLink>
      </CardFooter>
    </Card>
  );
}

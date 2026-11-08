import "server-only";

import { apiConfig } from "@/lib/config";
import { ApiError } from "@/lib/api/errors";

export interface SimulatedCheckoutEvent {
  sessionId: string;
  orderId: number;
  orderNumber?: string;
}

/**
 * Envia al webhook de la API el evento `checkout.session.completed` que Stripe
 * enviaria tras un pago exitoso.
 *
 * La API solo verifica la firma cuando `STRIPE_WEBHOOK_SECRET` esta definido
 * (`StripePaymentService::parseEvent`), de modo que en desarrollo local el
 * evento se puede inyectar sin la CLI de Stripe para demostrar el ciclo
 * completo: orden `pending` -> `paid` y decremento de stock.
 */
export async function sendSimulatedCheckoutCompleted({
  sessionId,
  orderId,
  orderNumber,
}: SimulatedCheckoutEvent): Promise<void> {
  const url = `${apiConfig.baseUrl}${apiConfig.prefix}/payments/webhook`;

  const event = {
    id: `evt_simulated_${orderId}`,
    object: "event",
    type: "checkout.session.completed",
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: sessionId,
        object: "checkout.session",
        payment_intent: `pi_simulated_${orderId}`,
        client_reference_id: String(orderId),
        metadata: {
          order_id: String(orderId),
          order_number: orderNumber ?? "",
        },
      },
    },
  };

  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(event),
      cache: "no-store",
      signal: AbortSignal.timeout(apiConfig.timeoutMs),
    });
  } catch (error) {
    console.error("[payments] no se pudo enviar el webhook simulado", error);
    throw ApiError.network("No se pudo enviar el webhook simulado a la API.");
  }

  if (!response.ok) {
    throw new ApiError({
      status: response.status,
      message:
        response.status === 400
          ? "La API rechazo el webhook (revisa STRIPE_WEBHOOK_SECRET)."
          : "La API no pudo procesar el webhook simulado.",
      code: "WEBHOOK_FAILED",
    });
  }
}

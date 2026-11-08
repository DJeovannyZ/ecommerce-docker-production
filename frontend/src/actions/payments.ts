"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { toUserMessage } from "@/lib/api/errors";
import { getOrder, getOrderPayment } from "@/lib/api/orders";
import { sendSimulatedCheckoutCompleted } from "@/lib/api/payments";
import { PRODUCTS_TAG } from "@/lib/api/products";
import { getSessionToken } from "@/lib/auth/session";
import type { ActionResult } from "@/lib/action-state";

interface SimulatePaymentInput {
  orderId: number;
  sessionId: string;
}

/**
 * Reproduce el evento `checkout.session.completed` que Stripe enviaria al
 * webhook de la API.
 *
 * Se autoriza antes de disparar el evento consultando la orden con el token del
 * usuario: el webhook de la API es publico, por lo que el gate vive aqui.
 */
export async function simulatePaymentAction(input: SimulatePaymentInput): Promise<ActionResult> {
  const token = await getSessionToken();

  if (!token) {
    return { ok: false, message: "Tu sesion expiro. Inicia sesion nuevamente." };
  }

  const orderId = Math.trunc(Number(input.orderId));
  const sessionId = typeof input.sessionId === "string" ? input.sessionId.trim() : "";

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return { ok: false, message: "La orden indicada no es valida." };
  }

  if (sessionId.length === 0) {
    return { ok: false, message: "No se recibio el identificador de la sesion de Stripe." };
  }

  try {
    const order = await getOrder(token, orderId);

    await sendSimulatedCheckoutCompleted({
      sessionId,
      orderId,
      orderNumber: order.order_number,
    });
  } catch (error) {
    return { ok: false, message: toUserMessage(error) };
  }

  // El pago confirmado decrementa stock en la API: catalogo e historial deben
  // dejar de servirse desde cache.
  revalidateTag(PRODUCTS_TAG, "max");
  revalidatePath("/orders");
  revalidatePath("/checkout/success");

  // La API acepta el evento aunque no encuentre un pago asociado (responde 200
  // y no hace nada). Se verifica el estado real para no reportar un falso
  // positivo, por ejemplo cuando Stripe nunca creo la sesion.
  const payment = await getOrderPayment(token, orderId);

  if (!payment) {
    return {
      ok: false,
      message:
        "La API recibio el evento pero no tiene un pago registrado para esta orden. Configura STRIPE_KEY y STRIPE_SECRET en el backend y repite el checkout.",
    };
  }

  if (payment.status !== "paid") {
    return {
      ok: false,
      message: `La API recibio el evento pero el pago sigue en estado "${payment.status_label}".`,
    };
  }

  return { ok: true, message: "Pago confirmado. El stock y la orden ya estan actualizados." };
}

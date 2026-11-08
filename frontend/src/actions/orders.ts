"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { isApiError, toUserMessage } from "@/lib/api/errors";
import { createCheckoutSession, createOrder } from "@/lib/api/orders";
import { PRODUCTS_TAG } from "@/lib/api/products";
import { getSessionToken, setPendingOrder } from "@/lib/auth/session";
import { demoConfig } from "@/lib/config";
import type { ActionResult } from "@/lib/action-state";

interface CheckoutItemInput {
  product_id: number;
  quantity: number;
}

/**
 * La API exige `items[].product_id` distinto y `quantity` entre 1 y 1000, con un
 * maximo de 50 lineas. Se sanea en el servidor porque un Server Action es
 * invocable por POST directo.
 */
function sanitizeItems(items: CheckoutItemInput[]): CheckoutItemInput[] {
  if (!Array.isArray(items)) {
    return [];
  }

  const seen = new Set<number>();
  const sanitized: CheckoutItemInput[] = [];

  for (const item of items) {
    const productId = Math.trunc(Number(item?.product_id));
    const quantity = Math.trunc(Number(item?.quantity));

    if (!Number.isInteger(productId) || productId <= 0) {
      continue;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      continue;
    }

    if (seen.has(productId)) {
      continue;
    }

    seen.add(productId);
    sanitized.push({ product_id: productId, quantity: Math.min(quantity, 1000) });

    if (sanitized.length >= 50) {
      break;
    }
  }

  return sanitized;
}

/**
 * Stripe no configurado (claves vacias o API caida) se manifiesta como 5xx en
 * el endpoint de checkout. Se detecta para poder entrar en modo demo.
 */
function isCheckoutUnavailable(error: unknown): boolean {
  if (!isApiError(error)) {
    return false;
  }

  return error.status >= 500 || /stripe|api_key/i.test(error.message);
}

/**
 * Mutacion principal del checkout: crea la orden, abre la Checkout Session de
 * Stripe y redirige al checkout hospedado.
 *
 * Tras la mutacion invalida el catalogo (el stock cambia cuando Stripe confirma
 * el pago) y el historial, para que la UI nunca quede desactualizada.
 */
export async function createOrderAndCheckoutAction(
  items: CheckoutItemInput[],
): Promise<ActionResult> {
  const token = await getSessionToken();

  if (!token) {
    redirect("/login?next=/checkout");
  }

  const sanitized = sanitizeItems(items);

  if (sanitized.length === 0) {
    return { ok: false, message: "Tu carrito esta vacio o los productos no son validos." };
  }

  let orderId: number;

  try {
    const order = await createOrder(token, sanitized);

    orderId = order.id;
    await setPendingOrder(order.id);
  } catch (error) {
    if (isApiError(error) && error.isUnauthorized) {
      redirect("/login?next=/checkout");
    }

    return { ok: false, message: toUserMessage(error) };
  }

  let checkoutUrl: string | null = null;
  let demoReason: string | null = null;

  try {
    const session = await createCheckoutSession(token, orderId);

    checkoutUrl = session.checkout_url;
  } catch (error) {
    if (!demoConfig.checkoutFallback || !isCheckoutUnavailable(error)) {
      return { ok: false, message: toUserMessage(error) };
    }

    // Modo demo: la orden existe, pero Stripe no esta configurado. Se avisa de
    // forma explicita en la pantalla de confirmacion.
    demoReason = toUserMessage(error);
  }

  revalidateTag(PRODUCTS_TAG, "max");
  revalidatePath("/orders");

  if (checkoutUrl) {
    redirect(checkoutUrl);
  }

  const query = new URLSearchParams({ demo: "1", order: String(orderId) });

  if (demoReason) {
    query.set("reason", demoReason.slice(0, 300));
  }

  redirect(`/checkout/success?${query.toString()}`);
}

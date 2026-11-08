import "server-only";

import { apiCollection, apiResource, withQuery } from "@/lib/api/client";
import { isApiError } from "@/lib/api/errors";
import type { CheckoutSessionDto, OrderDto, Paginated, PaymentDto } from "@/lib/api/types";

export const ORDERS_PER_PAGE = 10;

/**
 * Historial de compras del usuario autenticado (`GET /api/v1/orders`).
 * No se cachea: es un dato privado que debe reflejar cada mutacion.
 */
export async function getOrders(
  token: string,
  page = 1,
  perPage: number = ORDERS_PER_PAGE,
): Promise<Paginated<OrderDto>> {
  const safePage = Number.isFinite(page) && page > 0 ? Math.trunc(page) : 1;

  return apiCollection<OrderDto>(withQuery("/orders", { page: safePage, per_page: perPage }), {
    token,
  });
}

export async function getOrder(token: string, orderId: number): Promise<OrderDto> {
  return apiResource<OrderDto>(`/orders/${orderId}`, { token });
}

/**
 * Estado del pago de una orden (`GET /api/v1/orders/{id}/payment`).
 * Devuelve `null` cuando todavia no existe un pago asociado (HTTP 404).
 */
export async function getOrderPayment(token: string, orderId: number): Promise<PaymentDto | null> {
  try {
    return await apiResource<PaymentDto>(`/orders/${orderId}/payment`, { token });
  } catch (error) {
    if (isApiError(error) && error.isNotFound) {
      return null;
    }

    throw error;
  }
}

/** Crea la orden (`POST /api/v1/orders`). */
export async function createOrder(
  token: string,
  items: Array<{ product_id: number; quantity: number }>,
): Promise<OrderDto> {
  return apiResource<OrderDto>("/orders", { method: "POST", token, body: { items } });
}

/** Crea la Checkout Session de Stripe (`POST /api/v1/orders/{id}/checkout`). */
export async function createCheckoutSession(
  token: string,
  orderId: number,
): Promise<CheckoutSessionDto> {
  return apiResource<CheckoutSessionDto>(`/orders/${orderId}/checkout`, {
    method: "POST",
    token,
  });
}

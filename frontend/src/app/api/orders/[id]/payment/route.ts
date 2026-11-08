import { NextResponse, type NextRequest } from "next/server";

import { isApiError, toUserMessage } from "@/lib/api/errors";
import { getOrderPayment } from "@/lib/api/orders";
import { getSessionToken } from "@/lib/auth/session";

/**
 * Estado del pago de una orden para el polling del cliente.
 *
 * El navegador nunca maneja el JWT: este handler lee la cookie httpOnly y
 * consulta `GET /orders/{id}/payment` en la API.
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext<"/api/orders/[id]/payment">,
) {
  const token = await getSessionToken();

  if (!token) {
    return NextResponse.json({ ok: false, message: "No autenticado." }, { status: 401 });
  }

  const { id } = await context.params;
  const orderId = Number.parseInt(id, 10);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return NextResponse.json({ ok: false, message: "Orden invalida." }, { status: 400 });
  }

  try {
    const payment = await getOrderPayment(token, orderId);

    return NextResponse.json({ ok: true, payment });
  } catch (error) {
    const status = isApiError(error) ? (error.status === 0 ? 502 : error.status) : 500;

    return NextResponse.json({ ok: false, message: toUserMessage(error) }, { status });
  }
}

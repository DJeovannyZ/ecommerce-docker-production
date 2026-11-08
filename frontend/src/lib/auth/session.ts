import "server-only";

import { cookies } from "next/headers";

import type { AuthUserDto } from "@/lib/api/types";
import { sessionConfig } from "@/lib/config";

export interface SessionUser {
  id: number;
  name: string;
  email: string;
}

function baseCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: sessionConfig.secure,
    path: "/",
  };
}

/**
 * Persiste el JWT en una cookie httpOnly.
 * Solo puede invocarse desde un Server Action o un Route Handler: son los unicos
 * contextos donde Next.js permite escribir cookies de respuesta.
 */
export async function createSession(input: {
  token: string;
  user: AuthUserDto;
  expiresIn: number;
}): Promise<void> {
  const cookieStore = await cookies();
  const options = baseCookieOptions();
  const maxAge = Number.isFinite(input.expiresIn) && input.expiresIn > 0 ? input.expiresIn : 3600;

  cookieStore.set(sessionConfig.tokenCookie, input.token, { ...options, maxAge });

  const user: SessionUser = {
    id: input.user.id,
    name: input.user.name,
    email: input.user.email,
  };

  cookieStore.set(sessionConfig.userCookie, encodeURIComponent(JSON.stringify(user)), {
    ...options,
    maxAge,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(sessionConfig.tokenCookie);
  cookieStore.delete(sessionConfig.userCookie);
  cookieStore.delete(sessionConfig.pendingOrderCookie);
}

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionConfig.tokenCookie)?.value;

  return token && token.length > 0 ? token : null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(sessionConfig.userCookie)?.value;

  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(raw));

    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }

    const candidate = parsed as Record<string, unknown>;

    if (typeof candidate.id !== "number" || typeof candidate.name !== "string") {
      return null;
    }

    return {
      id: candidate.id,
      name: candidate.name,
      email: typeof candidate.email === "string" ? candidate.email : "",
    };
  } catch {
    return null;
  }
}

/** Recuerda la orden creada para poder mostrar el estado del pago al volver de Stripe. */
export async function setPendingOrder(orderId: number): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(sessionConfig.pendingOrderCookie, String(orderId), {
    ...baseCookieOptions(),
    maxAge: 60 * 60,
  });
}

export async function getPendingOrder(): Promise<number | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(sessionConfig.pendingOrderCookie)?.value;
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function clearPendingOrder(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(sessionConfig.pendingOrderCookie);
}

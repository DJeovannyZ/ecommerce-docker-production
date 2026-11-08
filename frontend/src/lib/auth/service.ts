import "server-only";

import { apiRequest } from "@/lib/api/client";
import { ApiError, isApiError } from "@/lib/api/errors";
import { createSession } from "@/lib/auth/session";
import type { AuthTokenDto, ResourcePayload } from "@/lib/api/types";

export interface AuthServiceFailure {
  ok: false;
  message: string;
  fieldErrors: Record<string, string[]>;
  code: string | null;
}

export interface AuthServiceSuccess {
  ok: true;
}

export type AuthServiceResult = AuthServiceSuccess | AuthServiceFailure;

const GENERIC_MESSAGE = "No se pudo iniciar la sesion. Revisa tus credenciales.";

/**
 * Consumido tanto por los Server Actions del formulario como por los Route
 * Handlers `/api/auth/*`: un unico lugar autentica contra la API y persiste el
 * JWT en la cookie httpOnly.
 */
export async function authenticate(
  endpoint: "/auth/login" | "/auth/register",
  body: Record<string, unknown>,
): Promise<AuthServiceResult> {
  try {
    const payload = await apiRequest<ResourcePayload<AuthTokenDto>>(endpoint, {
      method: "POST",
      body,
    });

    await createSession({
      token: payload.data.access_token,
      user: payload.data.user,
      expiresIn: payload.data.expires_in,
    });

    return { ok: true };
  } catch (error) {
    if (isApiError(error)) {
      return {
        ok: false,
        message: error.isNetwork ? error.message : (error.firstFieldError ?? GENERIC_MESSAGE),
        fieldErrors: error.errors,
        code: error.code,
      };
    }

    console.error("[auth] error inesperado", error);

    return {
      ok: false,
      message: "Ocurrio un error inesperado al autenticar.",
      fieldErrors: {},
      code: null,
    };
  }
}

/** Cierra la sesion en la API (best-effort) y limpia las cookies locales. */
export async function revokeRemoteToken(token: string | null): Promise<void> {
  if (!token) {
    return;
  }

  try {
    await apiRequest("/auth/logout", { method: "POST", token });
  } catch (error) {
    // Un token ya expirado o una API caida no deben impedir el logout local.
    if (!(error instanceof ApiError)) {
      console.error("[auth] error inesperado al cerrar sesion", error);
    }
  }
}

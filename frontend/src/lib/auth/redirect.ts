/** Rutas de autenticacion del frontend. */
export const AUTH_LOGIN_PATH = "/login";
export const AUTH_REGISTER_PATH = "/register";

/**
 * Evita redirecciones abiertas: solo se permiten rutas internas absolutas.
 * Se usa como destino post-login (`?next=`) y en el guard de `proxy.ts`.
 */
export function safeNextPath(value: string | null | undefined, fallback = "/orders"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}

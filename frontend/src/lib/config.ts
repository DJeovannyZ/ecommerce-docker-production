/**
 * Configuracion central derivada de variables de entorno.
 * Solo se lee en el servidor: el bundle del cliente nunca ve la URL del API.
 */

function normalizeUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

export const apiConfig = {
  /** BASE_URL de la API REST (Laravel 12 + Swagger). */
  baseUrl: normalizeUrl(process.env.API_BASE_URL ?? "http://localhost:8000"),
  /** Prefijo de versionado de la API. */
  prefix: normalizeUrl(process.env.API_PREFIX ?? "/api/v1"),
  /** Timeout por peticion en milisegundos. */
  timeoutMs: Number.parseInt(process.env.API_TIMEOUT_MS ?? "8000", 10),
} as const;

export const sessionConfig = {
  tokenCookie: "ecommerce_token",
  userCookie: "ecommerce_user",
  pendingOrderCookie: "ecommerce_pending_order",
  secure: process.env.SESSION_COOKIE_SECURE === "true",
} as const;

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "Web Vitals Store",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description:
    "Tienda de tecnologia construida en Next.js que consume una API REST de e-commerce con pagos por Stripe.",
} as const;

export const storeConfig = {
  currency: "USD",
  locale: "en-US",
  dateLocale: "es-EC",
} as const;

export const demoConfig = {
  /**
   * Cuando la API no tiene claves de Stripe configuradas, `POST /orders/{id}/checkout`
   * falla con 5xx. Con esta bandera activa el checkout continua a la pantalla de
   * confirmacion en modo demo (la orden queda creada y la UI avisa explicitamente
   * que no hubo redireccion a Stripe). Ponla en `false` para propagar el error.
   */
  checkoutFallback: process.env.DEMO_CHECKOUT_FALLBACK !== "false",
} as const;

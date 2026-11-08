import "server-only";

import { apiConfig } from "@/lib/config";
import { ApiError } from "@/lib/api/errors";
import type { CollectionPayload, ErrorPayload, Paginated, ResourcePayload } from "@/lib/api/types";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestOptions {
  method?: HttpMethod;
  body?: unknown;
  /** Token JWT leido de la cookie httpOnly en el servidor. */
  token?: string | null;
  timeoutMs?: number;
}

export type QueryValue = string | number | boolean | undefined | null;

/**
 * Cliente HTTP server-side. Nunca se ejecuta en el navegador: el token JWT y la
 * BASE_URL de la API quedan fuera del bundle del cliente.
 */
export async function apiRequest<T>(
  path: string,
  { method = "GET", body, token, timeoutMs }: ApiRequestOptions = {},
): Promise<T> {
  const url = `${apiConfig.baseUrl}${apiConfig.prefix}${path}`;

  const headers: Record<string, string> = { Accept: "application/json" };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs ?? apiConfig.timeoutMs),
      // Con Cache Components el cacheo se declara de forma explicita con
      // `use cache`; aqui siempre se quiere el dato mas reciente disponible.
      cache: "no-store",
    });
  } catch (error) {
    // Cuando Next aborta una lectura dinamica al terminar un prerender, React
    // maneja la interrupcion: se propaga tal cual en lugar de convertirla en un
    // error de red (evita falsos negativos en los logs).
    if (isPrerenderInterruption(error)) {
      throw error;
    }

    console.error(`[api] ${method} ${url} fallo de red`, error);
    throw ApiError.network();
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await readJson(response);

  if (!response.ok) {
    const errorPayload: ErrorPayload = isErrorPayload(payload)
      ? payload
      : { success: false, message: response.statusText, errors: {}, code: null };

    throw ApiError.fromPayload(response.status, errorPayload);
  }

  return payload as T;
}

/** Ejecuta la peticion y devuelve el `data` de `ApiResponse::resource()`. */
export async function apiResource<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const payload = await apiRequest<ResourcePayload<T>>(path, options);
  return payload.data;
}

/** Ejecuta la peticion y devuelve la coleccion paginada + su `meta`. */
export async function apiCollection<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<Paginated<T>> {
  const payload = await apiRequest<CollectionPayload<T>>(path, options);

  return {
    items: Array.isArray(payload.data) ? payload.data : [],
    meta: payload.meta,
  };
}

export function withQuery(path: string, query: Record<string, QueryValue>): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    search.set(key, String(value));
  }

  const queryString = search.toString();

  return queryString ? `${path}?${queryString}` : path;
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();

  if (text.length === 0) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function isErrorPayload(value: unknown): value is ErrorPayload {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof (value as { message: unknown }).message === "string"
  );
}

/**
 * Next.js aborta las lecturas dinamicas cuando termina un prerender; React
 * maneja esa interrupcion y no debe reportarse como un fallo de red.
 */
function isPrerenderInterruption(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const digest = "digest" in error ? String((error as { digest?: unknown }).digest ?? "") : "";

  return (
    digest.startsWith("HANGING_PROMISE_REJECTION") ||
    digest.startsWith("NEXT_PRERENDER_INTERRUPTED") ||
    digest.startsWith("DYNAMIC_SERVER_USAGE")
  );
}

import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { apiCollection, apiResource, withQuery } from "@/lib/api/client";
import { isApiError } from "@/lib/api/errors";
import type { Paginated, ProductDto } from "@/lib/api/types";

/** Tag unico del catalogo: se invalida tras cada mutacion de inventario. */
export const PRODUCTS_TAG = "products";
/** 4 columnas x 2 filas: el seeder de la API trae 10 productos, lo que deja 2 paginas. */
export const PRODUCTS_PER_PAGE = 8;
export const FEATURED_PRODUCTS_LIMIT = 8;

/**
 * Listado paginado del catalogo publico (`GET /api/v1/products`).
 *
 * Se cachea con `use cache` + `cacheTag`: la pagina pedida forma parte de la
 * cache key, y `revalidateTag(PRODUCTS_TAG)` la invalida tras una mutacion.
 */
export async function getProductsPage(
  page: number,
  perPage: number = PRODUCTS_PER_PAGE,
): Promise<Paginated<ProductDto>> {
  "use cache";
  cacheLife("minutes");
  cacheTag(PRODUCTS_TAG);

  const safePage = Number.isFinite(page) && page > 0 ? Math.trunc(page) : 1;
  const safePerPage = Math.min(Math.max(Math.trunc(perPage), 1), 100);

  return apiCollection<ProductDto>(
    withQuery("/products", { page: safePage, per_page: safePerPage }),
  );
}

/** Productos destacados para la portada. */
export async function getFeaturedProducts(
  limit: number = FEATURED_PRODUCTS_LIMIT,
): Promise<Paginated<ProductDto>> {
  "use cache";
  cacheLife("minutes");
  cacheTag(PRODUCTS_TAG);

  return apiCollection<ProductDto>(withQuery("/products", { page: 1, per_page: limit }));
}

/**
 * Detalle de producto (`GET /api/v1/products/{id}`).
 * Devuelve `null` cuando la API responde 404 para poder renderizar `notFound()`.
 */
export async function getProduct(id: number): Promise<ProductDto | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(PRODUCTS_TAG);

  try {
    return await apiResource<ProductDto>(`/products/${id}`);
  } catch (error) {
    if (isApiError(error) && error.isNotFound) {
      return null;
    }

    throw error;
  }
}

export function parsePageParam(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;

  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export function parseProductId(value: string): number {
  const parsed = Number.parseInt(value, 10);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : Number.NaN;
}

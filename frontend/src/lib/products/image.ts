import type { ProductDto } from "@/lib/api/types";

/**
 * La API entrega `image_url` en `null` en su seeder, por lo que se resuelve un
 * placeholder local determinista por producto. Cuando la API empiece a entregar
 * URLs reales, `next/image` las optimiza igualmente (remotePatterns en
 * next.config.ts).
 */
const PLACEHOLDERS = [
  "/products/placeholder-1.png",
  "/products/placeholder-2.png",
  "/products/placeholder-3.png",
  "/products/placeholder-4.png",
  "/products/placeholder-5.png",
  "/products/placeholder-6.png",
  "/products/placeholder-7.png",
  "/products/placeholder-8.png",
] as const;

export const DEFAULT_PRODUCT_IMAGE = PLACEHOLDERS[0];

export function resolveProductImage(product: Pick<ProductDto, "id" | "image_url">): string {
  if (product.image_url && product.image_url.trim().length > 0) {
    return product.image_url;
  }

  const index = Math.abs(product.id) % PLACEHOLDERS.length;

  return PLACEHOLDERS[index];
}

export function isRemoteImage(source: string): boolean {
  return /^https?:\/\//i.test(source);
}

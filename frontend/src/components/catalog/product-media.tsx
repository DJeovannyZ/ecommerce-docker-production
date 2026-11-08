import Image from "next/image";

import type { ProductDto } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { resolveProductImage } from "@/lib/products/image";

interface ProductMediaProps {
  product: Pick<ProductDto, "id" | "name" | "image_url">;
  sizes: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
}

/**
 * Imagen de producto optimizada con `next/image` (AVIF/WebP + resize).
 * Requiere un contenedor con dimensiones porque usa `fill`.
 */
export function ProductMedia({
  product,
  sizes,
  priority = false,
  className,
  imageClassName,
}: ProductMediaProps) {
  return (
    <div className={cn("relative overflow-hidden bg-slate-100", className)}>
      <Image
        src={resolveProductImage(product)}
        alt={`Imagen de ${product.name}`}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", imageClassName)}
      />
    </div>
  );
}

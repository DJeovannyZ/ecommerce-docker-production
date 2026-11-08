import Link from "next/link";

import { AddToCartButton } from "@/components/catalog/add-to-cart-button";
import { ProductMedia } from "@/components/catalog/product-media";
import { Badge } from "@/components/ui/badge";
import type { ProductDto } from "@/lib/api/types";
import { formatCurrency, stockLabel } from "@/lib/format";

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductDto;
  priority?: boolean;
}) {
  const isSoldOut = product.stock <= 0;
  const href = `/products/${product.id}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link
        href={href}
        prefetch={true}
        className="block"
        aria-label={`Ver detalle de ${product.name}`}
      >
        <ProductMedia
          product={product}
          priority={priority}
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
          className="aspect-square"
          imageClassName="transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-900">
            <Link href={href} prefetch={true} className="hover:text-indigo-700">
              {product.name}
            </Link>
          </h3>
          <p className="shrink-0 text-sm font-bold text-slate-900">
            {formatCurrency(product.price)}
          </p>
        </div>

        <p className="line-clamp-2 text-xs text-slate-500">{product.description}</p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <Badge tone={isSoldOut ? "danger" : product.stock <= 5 ? "warning" : "success"}>
            {isSoldOut ? "Agotado" : stockLabel(product.stock)}
          </Badge>
          <AddToCartButton product={product} label="Agregar" />
        </div>
      </div>
    </article>
  );
}

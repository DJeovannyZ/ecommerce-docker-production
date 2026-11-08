import { ProductCard } from "@/components/catalog/product-card";
import type { ProductDto } from "@/lib/api/types";

export function ProductGrid({ products }: { products: ProductDto[] }) {
  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard product={product} priority={index < 4} />
        </li>
      ))}
    </ul>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul
      aria-hidden="true"
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
      data-testid="product-grid-skeleton"
    >
      {Array.from({ length: count }).map((_, index) => (
        <li
          key={index}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="wv-skeleton aspect-square rounded-none" />
          <div className="space-y-3 p-4">
            <div className="wv-skeleton h-4 w-3/4" />
            <div className="wv-skeleton h-3 w-full" />
            <div className="flex items-center justify-between">
              <div className="wv-skeleton h-6 w-24 rounded-full" />
              <div className="wv-skeleton h-8 w-20" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

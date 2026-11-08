import { ProductGridSkeleton } from "@/components/catalog/product-grid";
import { Container } from "@/components/layout/container";
import { PRODUCTS_PER_PAGE } from "@/lib/api/products";

export default function ProductsLoading() {
  return (
    <Container className="space-y-8 py-12">
      <div className="space-y-3">
        <div className="wv-skeleton h-8 w-56" />
        <div className="wv-skeleton h-4 w-full max-w-2xl" />
      </div>
      <div className="wv-skeleton h-4 w-72" />
      <ProductGridSkeleton count={PRODUCTS_PER_PAGE} />
    </Container>
  );
}

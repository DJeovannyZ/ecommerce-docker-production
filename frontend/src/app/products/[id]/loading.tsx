import { ProductDetailSkeleton } from "@/components/catalog/product-detail";
import { Container } from "@/components/layout/container";

export default function ProductDetailLoading() {
  return (
    <Container className="py-12">
      <ProductDetailSkeleton />
    </Container>
  );
}

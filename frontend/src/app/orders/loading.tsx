import { Container } from "@/components/layout/container";
import { OrdersSkeleton } from "@/components/orders/order-list";

export default function OrdersLoading() {
  return (
    <Container className="space-y-8 py-12">
      <div className="space-y-3">
        <div className="wv-skeleton h-8 w-64" />
        <div className="wv-skeleton h-4 w-full max-w-xl" />
      </div>
      <OrdersSkeleton />
    </Container>
  );
}

import { Container } from "@/components/layout/container";

export default function CheckoutLoading() {
  return (
    <Container className="space-y-8 py-12">
      <div className="space-y-4">
        <div className="wv-skeleton h-8 w-40" />
        <div className="wv-skeleton h-5 w-80" />
      </div>
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <div className="wv-skeleton h-24 w-full rounded-2xl" />
          <div className="wv-skeleton h-72 w-full rounded-2xl" />
        </div>
        <div className="wv-skeleton h-56 w-full rounded-2xl" />
      </div>
    </Container>
  );
}

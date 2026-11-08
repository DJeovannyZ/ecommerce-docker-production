"use client";

import { Container } from "@/components/layout/container";
import { ErrorState } from "@/components/ui/error-state";

export default function CheckoutError({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <Container className="py-12">
      <ErrorState
        title="El checkout no esta disponible"
        description="No pudimos preparar el resumen de tu orden. Tu carrito sigue intacto: reintenta o vuelve al carrito."
        error={error}
        onRetry={retry}
      />
    </Container>
  );
}

"use client";

import { Container } from "@/components/layout/container";
import { ErrorState } from "@/components/ui/error-state";

export default function ProductDetailError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <Container className="py-12">
      <ErrorState
        title="No pudimos cargar este producto"
        description="El detalle del producto no esta disponible en este momento. Puedes reintentar o volver al catalogo."
        error={error}
        onRetry={retry}
      />
    </Container>
  );
}

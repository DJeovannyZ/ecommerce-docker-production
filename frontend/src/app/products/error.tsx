"use client";

import { Container } from "@/components/layout/container";
import { ErrorState } from "@/components/ui/error-state";

export default function ProductsError({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <Container className="py-12">
      <ErrorState
        title="No pudimos cargar el catalogo"
        description="La API de productos no respondio correctamente. Revisa que el backend este en ejecucion y reintenta."
        error={error}
        onRetry={retry}
      />
    </Container>
  );
}

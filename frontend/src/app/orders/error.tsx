"use client";

import { Container } from "@/components/layout/container";
import { ErrorState } from "@/components/ui/error-state";

export default function OrdersError({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <Container className="py-12">
      <ErrorState
        title="No pudimos cargar tu historial"
        description="La API no respondio con tus ordenes. Puedes reintentar la consulta."
        error={error}
        onRetry={retry}
      />
    </Container>
  );
}

"use client";

import { Container } from "@/components/layout/container";
import { ErrorState } from "@/components/ui/error-state";

export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <Container className="py-20">
      <ErrorState
        title="La aplicacion fallo"
        description="Ocurrio un error inesperado al renderizar esta vista. Puedes reintentar la carga."
        error={error}
        onRetry={retry}
      />
    </Container>
  );
}

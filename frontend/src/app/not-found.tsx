import Link from "next/link";

import { Container } from "@/components/layout/container";

export default function NotFound() {
  return (
    <Container className="py-20">
      <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
        <p className="text-sm font-semibold text-indigo-600">Error 404</p>
        <h1 className="text-2xl font-bold text-slate-900">No encontramos esta pagina</h1>
        <p className="text-sm text-slate-600">
          El recurso solicitado no existe o ya no esta disponible en el catalogo.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            href="/products"
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Ver catalogo
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </Container>
  );
}

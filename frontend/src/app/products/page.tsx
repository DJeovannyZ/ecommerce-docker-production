import type { Metadata } from "next";
import { Suspense } from "react";

import { Pagination } from "@/components/catalog/pagination";
import { ProductGrid, ProductGridSkeleton } from "@/components/catalog/product-grid";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getProductsPage, parsePageParam, PRODUCTS_PER_PAGE } from "@/lib/api/products";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "Catalogo de productos",
  description:
    "Explora el catalogo publico de tecnologia: lectura server-side, paginacion y cache revalidado por tags.",
  alternates: { canonical: "/products" },
};

/**
 * La pagina se limita a un shell estatico: el listado depende de `searchParams`
 * (dato de peticion) y se resuelve dentro de un limite <Suspense> granular, con
 * `loading.tsx` cubriendo la navegacion inicial.
 */
export default function ProductsPage(props: PageProps<"/products">) {
  return (
    <Container className="space-y-8 py-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Catalogo</h1>
        <p className="text-sm text-slate-600">
          Productos activos obtenidos con <code className="rounded bg-slate-100 px-1">fetch</code>{" "}
          en el servidor y cacheados con{" "}
          <code className="rounded bg-slate-100 px-1">use cache</code> + tag{" "}
          <code className="rounded bg-slate-100 px-1">products</code>.
        </p>
      </header>

      <Suspense fallback={<ProductGridSkeleton count={PRODUCTS_PER_PAGE} />}>
        <ProductResults searchParams={props.searchParams} />
      </Suspense>
    </Container>
  );
}

async function ProductResults({ searchParams }: Pick<PageProps<"/products">, "searchParams">) {
  const params = await searchParams;
  const page = parsePageParam(params.page);
  const { items, meta } = await getProductsPage(page);

  if (items.length === 0) {
    return (
      <EmptyState
        title="No hay productos en esta pagina"
        description="Puede que el catalogo haya cambiado. Vuelve a la primera pagina para ver el listado completo."
        action={<ButtonLink href="/products">Ver la primera pagina</ButtonLink>}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-slate-700">Resultados del catalogo</h2>
        <p className="text-sm text-slate-500" aria-live="polite">
          Mostrando {formatNumber(meta.from ?? 0)}-{formatNumber(meta.to ?? 0)} de{" "}
          {formatNumber(meta.total)} productos (pagina {meta.current_page} de {meta.last_page}).
        </p>
      </div>

      <ProductGrid products={items} />

      <Pagination basePath="/products" meta={meta} />
    </div>
  );
}

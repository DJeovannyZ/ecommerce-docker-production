import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";

import { Pagination } from "@/components/catalog/pagination";
import { Container } from "@/components/layout/container";
import { OrderList, OrdersSkeleton } from "@/components/orders/order-list";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { isApiError } from "@/lib/api/errors";
import { getOrders } from "@/lib/api/orders";
import { parsePageParam } from "@/lib/api/products";
import { getSessionToken } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Historial de compras",
  description: "Consulta las ordenes y el estado de pago de tu cuenta.",
  robots: { index: false, follow: false },
};

export default function OrdersPage(props: PageProps<"/orders">) {
  return (
    <Container className="space-y-8 py-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Historial de compras</h1>
        <p className="text-sm text-slate-600">
          Vista protegida: la API solo devuelve las ordenes del usuario autenticado.
        </p>
      </header>

      <Suspense fallback={<OrdersSkeleton />}>
        <OrdersSection searchParams={props.searchParams} />
      </Suspense>
    </Container>
  );
}

async function OrdersSection({ searchParams }: Pick<PageProps<"/orders">, "searchParams">) {
  const params = await searchParams;
  const page = parsePageParam(params.page);
  const token = await getSessionToken();

  if (!token) {
    redirect("/login?next=/orders");
  }

  let result;

  try {
    result = await getOrders(token, page);
  } catch (error) {
    if (isApiError(error) && error.isUnauthorized) {
      redirect("/login?next=/orders&reason=session-expired");
    }

    throw error;
  }

  if (result.items.length === 0) {
    return (
      <EmptyState
        title="Todavia no tienes compras"
        description="Cuando completes tu primera orden aparecera aqui con su estado de pago."
        action={<ButtonLink href="/products">Explorar el catalogo</ButtonLink>}
      />
    );
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-slate-500" aria-live="polite">
        {result.meta.total} orden{result.meta.total === 1 ? "" : "es"} en total (pagina{" "}
        {result.meta.current_page} de {result.meta.last_page}).
      </p>

      <OrderList orders={result.items} />

      <Pagination basePath="/orders" meta={result.meta} />
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";

import { createOrderAndCheckoutAction } from "@/actions/orders";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { useIsMounted } from "@/lib/hooks/use-is-mounted";
import { selectSubtotal, selectTotalItems, toOrderItems, useCartStore } from "@/store/cart";

/**
 * Mutacion del checkout: envia el carrito local al Server Action, que crea la
 * orden, abre la Checkout Session de Stripe y redirige al checkout hospedado.
 */
export function CheckoutView() {
  const lines = useCartStore((state) => state.lines);
  const subtotal = useCartStore(selectSubtotal);
  const totalItems = useCartStore(selectTotalItems);
  const mounted = useIsMounted();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!mounted) {
    return (
      <div aria-hidden="true" className="space-y-4">
        <div className="wv-skeleton h-28 w-full rounded-2xl" />
        <div className="wv-skeleton h-28 w-full rounded-2xl" />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <EmptyState
        title="No hay productos para pagar"
        description="Tu carrito esta vacio. Agrega productos antes de iniciar el pago."
        action={<ButtonLink href="/products">Ir al catalogo</ButtonLink>}
      />
    );
  }

  function handleSubmit() {
    setError(null);
    const items = toOrderItems(lines);

    startTransition(async () => {
      const result = await createOrderAndCheckoutAction(items);

      if (!result.ok) {
        setError(result.message);
      }
    });
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-bold text-slate-900">Tu orden</h2>
        <span className="text-xs text-slate-500">
          {totalItems} articulo{totalItems === 1 ? "" : "s"}
        </span>
      </CardHeader>

      <CardBody className="space-y-3">
        <ul className="divide-y divide-slate-100">
          {lines.map((line) => (
            <li
              key={line.productId}
              className="flex items-center justify-between gap-4 py-2 text-sm"
            >
              <span className="min-w-0 truncate text-slate-700">
                {line.name}
                <span className="text-slate-400"> x{line.quantity}</span>
              </span>
              <span className="shrink-0 font-semibold text-slate-900">
                {formatCurrency(line.unitPrice * line.quantity)}
              </span>
            </li>
          ))}
        </ul>

        {error ? (
          <Alert tone="danger" title="No se pudo crear la orden" role="alert">
            {error}
          </Alert>
        ) : null}

        <Alert tone="info">
          Al continuar se crea la orden en la API y te redirigimos a Stripe Checkout. El stock y el
          historial se revalidan automaticamente despues del pago.
        </Alert>
      </CardBody>

      <CardFooter className="space-y-3">
        <div className="flex items-center justify-between text-base font-bold text-slate-900">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={handleSubmit}
          disabled={pending}
          aria-busy={pending}
        >
          {pending ? "Creando orden..." : "Pagar con Stripe"}
        </Button>
        <ButtonLink href="/cart" variant="ghost" size="sm" className="w-full">
          Volver al carrito
        </ButtonLink>
      </CardFooter>
    </Card>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";

import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/format";
import { useIsMounted } from "@/lib/hooks/use-is-mounted";
import { selectSubtotal, selectTotalItems, useCartStore } from "@/store/cart";

export function CartView() {
  const lines = useCartStore((state) => state.lines);
  const subtotal = useCartStore(selectSubtotal);
  const totalItems = useCartStore(selectTotalItems);
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);
  const removeItem = useCartStore((state) => state.removeItem);
  const clear = useCartStore((state) => state.clear);
  const mounted = useIsMounted();

  if (!mounted) {
    return (
      <div aria-hidden="true" className="space-y-4">
        <div className="wv-skeleton h-24 w-full rounded-2xl" />
        <div className="wv-skeleton h-24 w-full rounded-2xl" />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <EmptyState
        title="Tu carrito esta vacio"
        description="Agrega productos desde el catalogo para iniciar una orden."
        action={<ButtonLink href="/products">Ir al catalogo</ButtonLink>}
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
      <ul className="space-y-4">
        {lines.map((line) => (
          <li key={line.productId}>
            <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <Link href={`/products/${line.productId}`} className="shrink-0">
                <Image
                  src={line.imageUrl}
                  alt={`Imagen de ${line.name}`}
                  width={84}
                  height={84}
                  sizes="84px"
                  className="size-21 rounded-xl object-cover"
                />
              </Link>

              <div className="min-w-0 flex-1 space-y-1">
                <h2 className="truncate text-sm font-semibold text-slate-900">
                  <Link href={`/products/${line.productId}`} className="hover:text-indigo-700">
                    {line.name}
                  </Link>
                </h2>
                <p className="text-xs text-slate-500">
                  {formatCurrency(line.unitPrice)} por unidad - {line.stock} en stock
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {formatCurrency(line.unitPrice * line.quantity)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => decrement(line.productId)}
                    disabled={line.quantity <= 1}
                    aria-label={`Quitar una unidad de ${line.name}`}
                  >
                    &minus;
                  </Button>
                  <span className="w-10 text-center text-sm font-semibold" aria-live="polite">
                    {line.quantity}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => increment(line.productId)}
                    disabled={line.quantity >= line.stock}
                    aria-label={`Agregar una unidad de ${line.name}`}
                  >
                    +
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => removeItem(line.productId)}
                >
                  Quitar
                </Button>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-bold text-slate-900">Resumen del carrito</h2>
          </CardHeader>
          <CardBody className="space-y-2 text-sm">
            <div className="flex items-center justify-between text-slate-600">
              <span>Articulos</span>
              <span className="font-semibold text-slate-900">{totalItems}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Impuestos</span>
              <span className="text-slate-500">Se calculan en la API</span>
            </div>
          </CardBody>
          <CardFooter className="space-y-3">
            <div className="flex items-center justify-between text-base font-bold text-slate-900">
              <span>Total estimado</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <ButtonLink href="/checkout" size="lg" className="w-full">
              Continuar al checkout
            </ButtonLink>
            <Button type="button" variant="ghost" size="sm" className="w-full" onClick={clear}>
              Vaciar carrito
            </Button>
          </CardFooter>
        </Card>

        <p className="text-xs text-slate-500">
          El carrito vive en el estado local (Zustand + persist) y solo se envia al servidor al
          crear la orden.
        </p>
      </div>
    </div>
  );
}

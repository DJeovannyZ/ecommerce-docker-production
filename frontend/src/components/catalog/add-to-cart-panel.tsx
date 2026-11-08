"use client";

import { useState } from "react";

import { AddToCartButton } from "@/components/catalog/add-to-cart-button";
import { Button } from "@/components/ui/button";
import type { ProductDto } from "@/lib/api/types";
import { formatCurrency } from "@/lib/format";

export function AddToCartPanel({
  product,
}: {
  product: Pick<ProductDto, "id" | "name" | "slug" | "price" | "stock" | "image_url">;
}) {
  const [quantity, setQuantity] = useState(1);
  const max = Math.max(1, Math.min(product.stock, 1000));
  const isSoldOut = product.stock <= 0;

  function change(delta: number) {
    setQuantity((current) => Math.min(Math.max(current + delta, 1), max));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => change(-1)}
            disabled={isSoldOut || quantity <= 1}
            aria-label="Quitar una unidad"
          >
            &minus;
          </Button>
          <label className="sr-only" htmlFor="quantity">
            Cantidad
          </label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            inputMode="numeric"
            min={1}
            max={max}
            value={quantity}
            readOnly
            className="w-12 border-0 bg-transparent text-center text-sm font-semibold text-slate-900 focus:outline-none"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => change(1)}
            disabled={isSoldOut || quantity >= max}
            aria-label="Agregar una unidad"
          >
            +
          </Button>
        </div>

        <AddToCartButton
          product={product}
          quantity={quantity}
          size="lg"
          label={isSoldOut ? "Agotado" : `Agregar ${formatCurrency(product.price * quantity)}`}
        />
      </div>
      <p className="text-xs text-slate-500">
        Se agregan {quantity} unidad{quantity === 1 ? "" : "es"} al carrito local (persistido en
        este navegador).
      </p>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";

import { useCartStore } from "@/store/cart";

/**
 * Vacia el carrito local al llegar a la confirmacion de compra: la orden ya
 * existe en la API, por lo que el carrito deja de ser necesario.
 */
export function ClearCartOnMount() {
  const clear = useCartStore((state) => state.clear);
  const cleared = useRef(false);

  useEffect(() => {
    if (cleared.current) {
      return;
    }

    cleared.current = true;
    clear();
  }, [clear]);

  return null;
}

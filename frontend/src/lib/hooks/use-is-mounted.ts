"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Detecta el cliente sin provocar desajustes de hidratacion: el servidor
 * renderiza `false` y React cambia el snapshot a `true` al hidratar.
 * Se usa para mostrar estado que solo existe en el navegador (carrito persistido).
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

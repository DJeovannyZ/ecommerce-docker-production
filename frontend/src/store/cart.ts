import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface CartLine {
  productId: number;
  name: string;
  slug: string;
  unitPrice: number;
  imageUrl: string;
  stock: number;
  quantity: number;
}

export interface NewCartLine {
  productId: number;
  name: string;
  slug: string;
  unitPrice: number;
  imageUrl: string;
  stock: number;
}

interface CartState {
  lines: CartLine[];
  addItem: (line: NewCartLine, quantity?: number) => void;
  removeItem: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  increment: (productId: number) => void;
  decrement: (productId: number) => void;
  clear: () => void;
}

/** Limite que impone la API (`items` acepta como maximo 50 lineas). */
export const MAX_CART_LINES = 50;

function clampQuantity(quantity: number, stock: number): number {
  const available = stock > 0 ? stock : 1;
  const normalized = Number.isFinite(quantity) ? Math.trunc(quantity) : 1;

  return Math.min(Math.max(normalized, 1), available);
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],

      addItem: (line, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find((item) => item.productId === line.productId);

          if (existing) {
            return {
              lines: state.lines.map((item) =>
                item.productId === line.productId
                  ? {
                      ...item,
                      // Refresca los datos del catalogo por si cambiaron.
                      name: line.name,
                      unitPrice: line.unitPrice,
                      imageUrl: line.imageUrl,
                      stock: line.stock,
                      quantity: clampQuantity(item.quantity + quantity, line.stock),
                    }
                  : item,
              ),
            };
          }

          if (state.lines.length >= MAX_CART_LINES) {
            return state;
          }

          return {
            lines: [...state.lines, { ...line, quantity: clampQuantity(quantity, line.stock) }],
          };
        }),

      removeItem: (productId) =>
        set((state) => ({
          lines: state.lines.filter((item) => item.productId !== productId),
        })),

      setQuantity: (productId, quantity) =>
        set((state) => ({
          lines: state.lines.map((item) =>
            item.productId === productId
              ? { ...item, quantity: clampQuantity(quantity, item.stock) }
              : item,
          ),
        })),

      increment: (productId) =>
        set((state) => ({
          lines: state.lines.map((item) =>
            item.productId === productId
              ? { ...item, quantity: clampQuantity(item.quantity + 1, item.stock) }
              : item,
          ),
        })),

      decrement: (productId) =>
        set((state) => ({
          lines: state.lines.map((item) =>
            item.productId === productId
              ? { ...item, quantity: clampQuantity(item.quantity - 1, item.stock) }
              : item,
          ),
        })),

      clear: () => set({ lines: [] }),
    }),
    {
      name: "web-vitals-cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ lines: state.lines }),
    },
  ),
);

export const selectTotalItems = (state: CartState): number =>
  state.lines.reduce((total, line) => total + line.quantity, 0);

export const selectSubtotal = (state: CartState): number =>
  state.lines.reduce((total, line) => total + line.unitPrice * line.quantity, 0);

/** Payload que espera `POST /api/v1/orders`. */
export function toOrderItems(lines: CartLine[]): Array<{ product_id: number; quantity: number }> {
  return lines.map((line) => ({ product_id: line.productId, quantity: line.quantity }));
}

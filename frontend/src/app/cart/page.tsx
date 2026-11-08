import type { Metadata } from "next";

import { CartView } from "@/components/cart/cart-view";
import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "Carrito de compras",
  description: "Revisa y ajusta los productos de tu carrito antes de crear la orden.",
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <Container className="space-y-8 py-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tu carrito</h1>
        <p className="text-sm text-slate-600">
          Estado local persistido en el navegador; la orden se crea en el servidor.
        </p>
      </header>

      <CartView />
    </Container>
  );
}

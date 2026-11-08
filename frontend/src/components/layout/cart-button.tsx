"use client";

import Link from "next/link";

import { useIsMounted } from "@/lib/hooks/use-is-mounted";
import { selectTotalItems, useCartStore } from "@/store/cart";

export function CartButton() {
  const totalItems = useCartStore(selectTotalItems);
  const mounted = useIsMounted();
  const count = mounted ? totalItems : 0;

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
      aria-label={count > 0 ? `Carrito con ${count} articulos` : "Carrito vacio"}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        className="size-5"
      >
        <path d="M3 4h2l2.4 10.5a2 2 0 0 0 2 1.5h7.7a2 2 0 0 0 2-1.6L20.5 8H6" />
        <circle cx="9.5" cy="19.5" r="1.4" />
        <circle cx="17" cy="19.5" r="1.4" />
      </svg>
      <span className="hidden sm:inline">Carrito</span>
      {count > 0 ? (
        <span
          aria-hidden="true"
          className="inline-flex min-w-6 items-center justify-center rounded-full bg-indigo-600 px-1.5 py-0.5 text-xs font-bold text-white"
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}

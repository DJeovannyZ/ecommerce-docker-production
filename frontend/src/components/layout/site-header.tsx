import { Suspense } from "react";
import Link from "next/link";

import { CartButton } from "@/components/layout/cart-button";
import { Container } from "@/components/layout/container";
import { UserArea, UserAreaFallback } from "@/components/layout/user-area";
import { siteConfig } from "@/lib/config";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/products", label: "Catalogo" },
  { href: "/orders", label: "Mis compras" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-base font-bold text-slate-900">
            <span
              aria-hidden="true"
              className="inline-flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-black text-white"
            >
              WV
            </span>
            <span className="sr-only sm:not-sr-only">{siteConfig.name}</span>
          </Link>

          <nav aria-label="Navegacion principal" className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <CartButton />
          <Suspense fallback={<UserAreaFallback />}>
            <UserArea />
          </Suspense>
        </div>
      </Container>
    </header>
  );
}

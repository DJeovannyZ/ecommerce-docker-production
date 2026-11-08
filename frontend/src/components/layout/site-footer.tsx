import Link from "next/link";

import { Container } from "@/components/layout/container";
import { siteConfig } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <Container className="flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900">{siteConfig.name}</p>
          <p className="text-sm text-slate-500">
            Next.js 16 (App Router) + Server Components + Server Actions sobre una API REST Laravel.
          </p>
        </div>
        <nav aria-label="Enlaces del pie" className="flex flex-wrap gap-4 text-sm text-slate-600">
          <Link href="/products" className="hover:text-slate-900">
            Catalogo
          </Link>
          <Link href="/cart" className="hover:text-slate-900">
            Carrito
          </Link>
          <Link href="/orders" className="hover:text-slate-900">
            Historial
          </Link>
        </nav>
      </Container>
    </footer>
  );
}

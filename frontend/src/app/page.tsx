import { Suspense } from "react";
import { connection } from "next/server";

import { ProductGrid, ProductGridSkeleton } from "@/components/catalog/product-grid";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getFeaturedProducts } from "@/lib/api/products";
import { siteConfig } from "@/lib/config";

const HIGHLIGHTS = [
  {
    title: "Server Components",
    description: "El catalogo se lee en el servidor con fetch cacheado y tags.",
  },
  {
    title: "Server Actions",
    description: "Login, orden y pago se mutan con acciones server-side, sin exponer el token.",
  },
  {
    title: "Web Vitals",
    description: "Loading y error por segmento, Suspense granular e imagenes optimizadas.",
  },
] as const;

function Hero() {
  return (
    <section className="border-b border-slate-200 bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 text-white">
      <Container className="grid gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
        <div className="space-y-6">
          <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide uppercase ring-1 ring-white/20 ring-inset">
            Next.js 16 - App Router
          </p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Compra tecnologia con una experiencia rapida y segura
          </h1>
          <p className="max-w-xl text-base text-indigo-100">
            {siteConfig.name} consume la API REST del e-commerce (Laravel 12 + Stripe) usando Server
            Components para las lecturas y Server Actions para las mutaciones.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink
              href="/products"
              size="lg"
              className="bg-white text-indigo-700 hover:bg-indigo-50"
            >
              Explorar catalogo
            </ButtonLink>
            <ButtonLink
              href="/orders"
              size="lg"
              variant="ghost"
              className="border border-white/40 text-white hover:bg-white/10"
            >
              Mis compras
            </ButtonLink>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-4 self-center">
          {[
            { label: "Lecturas", value: "Server Components" },
            { label: "Mutaciones", value: "Server Actions" },
            { label: "Sesion", value: "Cookie httpOnly" },
            { label: "Pagos", value: "Stripe Checkout" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/15 bg-white/10 px-4 py-5 backdrop-blur"
            >
              <dt className="text-xs tracking-wide text-indigo-100 uppercase">{item.label}</dt>
              <dd className="mt-1 text-sm font-semibold text-white">{item.value}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}

function Highlights() {
  return (
    <section className="border-b border-slate-200 bg-white">
      <Container className="grid gap-6 py-12 sm:grid-cols-3">
        {HIGHLIGHTS.map((item) => (
          <div key={item.title} className="space-y-1">
            <h2 className="text-sm font-bold text-slate-900">{item.title}</h2>
            <p className="text-sm text-slate-600">{item.description}</p>
          </div>
        ))}
      </Container>
    </section>
  );
}

/**
 * Lee el catalogo en tiempo de peticion. `connection()` evita que el build de
 * produccion dependa de que la API este disponible: el catalogo entra por
 * streaming dentro del limite <Suspense>.
 */
async function FeaturedProducts() {
  await connection();

  const { items } = await getFeaturedProducts(8);

  if (items.length === 0) {
    return (
      <EmptyState
        title="Catalogo vacio"
        description="La API no devolvio productos activos. Ejecuta `php artisan migrate --seed` en el backend."
        action={<ButtonLink href="/products">Reintentar</ButtonLink>}
      />
    );
  }

  return <ProductGrid products={items} />;
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <Highlights />

      <Container className="space-y-6 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Productos destacados
            </h2>
            <p className="text-sm text-slate-600">
              Los primeros resultados del catalogo publico, servidos desde la API.
            </p>
          </div>
          <ButtonLink href="/products" variant="secondary">
            Ver todo el catalogo
          </ButtonLink>
        </div>

        <Suspense fallback={<ProductGridSkeleton count={4} />}>
          <FeaturedProducts />
        </Suspense>
      </Container>
    </>
  );
}

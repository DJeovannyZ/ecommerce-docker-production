import Link from "next/link";

import { AddToCartPanel } from "@/components/catalog/add-to-cart-panel";
import { ProductMedia } from "@/components/catalog/product-media";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import type { ProductDto } from "@/lib/api/types";
import { formatCurrency, formatNumber } from "@/lib/format";
import { resolveProductImage } from "@/lib/products/image";
import { siteConfig, storeConfig } from "@/lib/config";

function productJsonLd(product: ProductDto) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    sku: String(product.id),
    image: `${siteConfig.url}${resolveProductImage(product)}`,
    brand: { "@type": "Brand", name: siteConfig.name },
    offers: {
      "@type": "Offer",
      url: `${siteConfig.url}/products/${product.id}`,
      priceCurrency: storeConfig.currency,
      price: product.price.toFixed(2),
      itemCondition: "https://schema.org/NewCondition",
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };
}

export function ProductDetail({ product }: { product: ProductDto }) {
  const isSoldOut = product.stock <= 0;

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }}
      />

      <nav aria-label="Ruta de navegacion" className="text-sm text-slate-500">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-slate-900">
              Inicio
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/products" className="hover:text-slate-900">
              Catalogo
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-slate-900">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <ProductMedia
          product={product}
          priority
          sizes="(max-width: 1023px) 100vw, 50vw"
          className="aspect-square rounded-2xl border border-slate-200"
        />

        <div className="flex flex-col gap-5">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={isSoldOut ? "danger" : product.stock <= 5 ? "warning" : "success"}>
                {isSoldOut ? "Agotado" : `${formatNumber(product.stock)} en stock`}
              </Badge>
              <Badge tone="neutral">SKU #{product.id}</Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {product.name}
            </h1>
            <p className="text-3xl font-black text-slate-900">{formatCurrency(product.price)}</p>
            <p className="text-sm/6 text-slate-600">
              {product.description ?? "Producto del catalogo sin descripcion ampliada."}
            </p>
          </div>

          <AddToCartPanel product={product} />

          <Card>
            <CardBody className="space-y-3 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Como funciona la compra</p>
              <ol className="list-decimal space-y-1 pl-5">
                <li>Agrega los productos al carrito local.</li>
                <li>
                  El checkout crea la orden en la API mediante un{" "}
                  <span className="font-medium text-slate-900">Server Action</span>.
                </li>
                <li>Pagas en la pagina segura de Stripe Checkout.</li>
                <li>Vuelves al frontend y confirmas el pago de tu orden.</li>
              </ol>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div aria-hidden="true" className="grid gap-8 lg:grid-cols-2">
      <div className="wv-skeleton aspect-square rounded-2xl" />
      <div className="space-y-4">
        <div className="wv-skeleton h-6 w-40 rounded-full" />
        <div className="wv-skeleton h-8 w-3/4" />
        <div className="wv-skeleton h-9 w-32" />
        <div className="wv-skeleton h-20 w-full" />
        <div className="wv-skeleton h-12 w-64" />
      </div>
    </div>
  );
}

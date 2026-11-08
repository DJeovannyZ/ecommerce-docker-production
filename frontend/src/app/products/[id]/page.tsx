import type { Metadata } from "next";
import { Suspense } from "react";

import { ProductDetail, ProductDetailSkeleton } from "@/components/catalog/product-detail";
import { Container } from "@/components/layout/container";
import { getProduct, parseProductId } from "@/lib/api/products";
import { siteConfig } from "@/lib/config";
import { notFound } from "next/navigation";

interface ProductPageParams {
  params: Promise<{ id: string }>;
}

/** Metadata SEO por producto (title, description, canonical y OpenGraph). */
export async function generateMetadata({ params }: ProductPageParams): Promise<Metadata> {
  const { id } = await params;
  const productId = parseProductId(id);

  if (!Number.isInteger(productId)) {
    return { title: "Producto no encontrado", robots: { index: false, follow: false } };
  }

  const product = await getProduct(productId);

  if (!product) {
    return { title: "Producto no encontrado", robots: { index: false, follow: false } };
  }

  const description =
    product.description ?? `${product.name} disponible en ${siteConfig.name} con envio inmediato.`;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${product.id}` },
    openGraph: {
      type: "website",
      title: `${product.name} | ${siteConfig.name}`,
      description,
      url: `/products/${product.id}`,
    },
  };
}

export default function ProductPage(props: ProductPageParams) {
  return (
    <Container className="py-12">
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetailSection params={props.params} />
      </Suspense>
    </Container>
  );
}

async function ProductDetailSection({ params }: ProductPageParams) {
  const { id } = await params;
  const productId = parseProductId(id);

  if (!Number.isInteger(productId)) {
    notFound();
  }

  const product = await getProduct(productId);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}

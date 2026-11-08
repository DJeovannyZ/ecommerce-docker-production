"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { resolveProductImage } from "@/lib/products/image";
import type { ProductDto } from "@/lib/api/types";
import { useCartStore } from "@/store/cart";

type Variant = "primary" | "secondary";
type Size = "sm" | "md" | "lg";

export function AddToCartButton({
  product,
  quantity = 1,
  label = "Agregar al carrito",
  variant = "primary",
  size = "sm",
  className,
}: {
  product: Pick<ProductDto, "id" | "name" | "slug" | "price" | "stock" | "image_url">;
  quantity?: number;
  label?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const [feedback, setFeedback] = useState<"idle" | "added">("idle");
  const isSoldOut = product.stock <= 0;

  function handleClick() {
    addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        unitPrice: product.price,
        imageUrl: resolveProductImage(product),
        stock: product.stock,
      },
      quantity,
    );

    setFeedback("added");
    window.setTimeout(() => setFeedback("idle"), 1800);
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      disabled={isSoldOut}
      onClick={handleClick}
      aria-live="polite"
    >
      {isSoldOut ? "Agotado" : feedback === "added" ? "Agregado" : label}
    </Button>
  );
}

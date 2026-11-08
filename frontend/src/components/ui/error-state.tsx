"use client";

import { useEffect } from "react";

import { cn } from "@/lib/cn";

/**
 * Fallback reutilizable para los `error.tsx` de cada segmento.
 * Expone accion de reintento ("retry" vuelve a pedir y renderizar el segmento).
 */
export function ErrorState({
  title,
  description,
  error,
  onRetry,
  className,
}: {
  title: string;
  description: string;
  error?: unknown;
  onRetry: () => void;
  className?: string;
}) {
  useEffect(() => {
    console.error("[segment-error]", error);
  }, [error]);

  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String((error as { digest?: unknown }).digest ?? "")
      : "";

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center gap-4 rounded-2xl border border-rose-200 bg-white px-6 py-12 text-center shadow-sm",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="inline-flex size-11 items-center justify-center rounded-full bg-rose-50 text-lg font-black text-rose-600"
      >
        !
      </span>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mx-auto max-w-md text-sm text-slate-600">{description}</p>
        {digest ? <p className="text-xs text-slate-400">Referencia: {digest}</p> : null}
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
      >
        Reintentar
      </button>
    </div>
  );
}

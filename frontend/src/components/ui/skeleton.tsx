import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("wv-skeleton rounded-lg", className)} />;
}

export function Spinner({ className, label = "Cargando" }: { className?: string; label?: string }) {
  return (
    <span role="status" className="inline-flex items-center gap-2 text-sm text-slate-600">
      <span
        aria-hidden="true"
        className={cn(
          "size-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600",
          className,
        )}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

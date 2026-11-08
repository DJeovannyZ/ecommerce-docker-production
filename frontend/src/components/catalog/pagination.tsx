import Link from "next/link";

import { cn } from "@/lib/cn";
import type { PaginationMeta } from "@/lib/api/types";

function pageWindow(current: number, last: number, radius = 2): number[] {
  const start = Math.max(1, current - radius);
  const end = Math.min(last, current + radius);
  const pages: number[] = [];

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  return pages;
}

export function Pagination({ basePath, meta }: { basePath: string; meta: PaginationMeta }) {
  if (meta.last_page <= 1) {
    return null;
  }

  const hrefFor = (page: number) => (page <= 1 ? basePath : `${basePath}?page=${page}`);
  const linkClass =
    "inline-flex min-w-10 items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold transition-colors";

  return (
    <nav aria-label="Paginacion del catalogo" className="flex items-center justify-center gap-2">
      {meta.current_page > 1 ? (
        <Link
          href={hrefFor(meta.current_page - 1)}
          prefetch={true}
          rel="prev"
          className={cn(linkClass, "border-slate-200 bg-white text-slate-700 hover:bg-slate-100")}
        >
          Anterior
        </Link>
      ) : null}

      {pageWindow(meta.current_page, meta.last_page).map((page) => {
        const isCurrent = page === meta.current_page;

        return (
          <Link
            key={page}
            href={hrefFor(page)}
            prefetch={true}
            aria-current={isCurrent ? "page" : undefined}
            className={cn(
              linkClass,
              isCurrent
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100",
            )}
          >
            {page}
          </Link>
        );
      })}

      {meta.current_page < meta.last_page ? (
        <Link
          href={hrefFor(meta.current_page + 1)}
          prefetch={true}
          rel="next"
          className={cn(linkClass, "border-slate-200 bg-white text-slate-700 hover:bg-slate-100")}
        >
          Siguiente
        </Link>
      ) : null}
    </nav>
  );
}

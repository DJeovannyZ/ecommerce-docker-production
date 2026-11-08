import Link from "next/link";

import { logoutAction } from "@/actions/auth";
import { getSessionUser } from "@/lib/auth/session";
import { initials } from "@/lib/format";

/**
 * Lee la cookie httpOnly de sesion en el servidor. Al depender de `cookies()`
 * siempre se monta dentro de un limite <Suspense> en el layout.
 */
export async function UserArea() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
        >
          Ingresar
        </Link>
        <Link
          href="/register"
          className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          Crear cuenta
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/orders"
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
        title={user.email}
      >
        <span
          aria-hidden="true"
          className="inline-flex size-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white"
        >
          {initials(user.name)}
        </span>
        <span className="hidden max-w-32 truncate md:inline">{user.name}</span>
      </Link>
      <form action={logoutAction}>
        <button
          type="submit"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
        >
          Salir
        </button>
      </form>
    </div>
  );
}

export function UserAreaFallback() {
  return (
    <div
      aria-hidden="true"
      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2"
    >
      <span className="wv-skeleton size-7 rounded-full" />
      <span className="wv-skeleton hidden h-3 w-16 rounded md:block" />
    </div>
  );
}

import { NextResponse } from "next/server";

import { revokeRemoteToken } from "@/lib/auth/service";
import { destroySession, getSessionToken } from "@/lib/auth/session";

/** Route Handler de logout: invalida el token en la API y limpia las cookies. */
export async function POST() {
  const token = await getSessionToken();

  await revokeRemoteToken(token);
  await destroySession();

  return NextResponse.json({ ok: true, message: "Sesion cerrada." });
}

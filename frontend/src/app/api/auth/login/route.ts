import { NextResponse, type NextRequest } from "next/server";

import { authenticate } from "@/lib/auth/service";
import { readJsonBody, stringField } from "@/lib/http";

/**
 * Route Handler de login.
 *
 * Expone por HTTP el mismo contrato que usa el formulario: delega en
 * `authenticate()` y este persiste el JWT en una cookie httpOnly.
 */
export async function POST(request: NextRequest) {
  const body = await readJsonBody(request);
  const email = stringField(body, "email").toLowerCase();
  const password = stringField(body, "password");

  if (!email || !password) {
    return NextResponse.json(
      {
        ok: false,
        message: "El correo y la contrasena son obligatorios.",
        errors: {
          ...(email ? {} : { email: ["El correo es obligatorio."] }),
          ...(password ? {} : { password: ["La contrasena es obligatoria."] }),
        },
      },
      { status: 422 },
    );
  }

  const result = await authenticate("/auth/login", { email, password });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: result.message, errors: result.fieldErrors },
      { status: result.code === "INVALID_CREDENTIALS" ? 401 : 422 },
    );
  }

  return NextResponse.json({ ok: true, message: "Sesion iniciada.", user: email });
}

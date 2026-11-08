import { NextResponse, type NextRequest } from "next/server";

import { authenticate } from "@/lib/auth/service";
import { readJsonBody, stringField } from "@/lib/http";

/** Route Handler de registro: misma logica que el Server Action del formulario. */
export async function POST(request: NextRequest) {
  const body = await readJsonBody(request);
  const name = stringField(body, "name");
  const email = stringField(body, "email").toLowerCase();
  const password = stringField(body, "password");
  const passwordConfirmation = stringField(body, "password_confirmation");
  const phone = stringField(body, "phone");

  const errors: Record<string, string[]> = {};

  if (!name) {
    errors.name = ["El nombre es obligatorio."];
  }

  if (!email) {
    errors.email = ["El correo es obligatorio."];
  }

  if (password.length < 8) {
    errors.password = ["La contrasena debe tener al menos 8 caracteres."];
  }

  if (password !== passwordConfirmation) {
    errors.password_confirmation = ["Las contrasenas no coinciden."];
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      { ok: false, message: "Revisa los campos enviados.", errors },
      { status: 422 },
    );
  }

  const result = await authenticate("/auth/register", {
    name,
    email,
    password,
    password_confirmation: passwordConfirmation,
    ...(phone ? { phone } : {}),
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: result.message, errors: result.fieldErrors },
      { status: 422 },
    );
  }

  return NextResponse.json(
    { ok: true, message: "Cuenta creada y sesion iniciada." },
    { status: 201 },
  );
}

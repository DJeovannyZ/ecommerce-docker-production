"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { authenticate, revokeRemoteToken } from "@/lib/auth/service";
import { destroySession, getSessionToken } from "@/lib/auth/session";
import { safeNextPath } from "@/lib/auth/redirect";
import type { AuthFormState } from "@/lib/auth/form-state";

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function fail(
  message: string,
  values: AuthFormState["values"],
  fieldErrors: Record<string, string[]> = {},
): AuthFormState {
  return { status: "error", message, fieldErrors, values };
}

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = readString(formData, "email").toLowerCase();
  const password = readString(formData, "password");
  const next = safeNextPath(readString(formData, "next"), "/orders");
  const values = { name: "", email };

  if (!email || !password) {
    return fail("Ingresa tu correo y contrasena.", values, {
      ...(email ? {} : { email: ["El correo es obligatorio."] }),
      ...(password ? {} : { password: ["La contrasena es obligatoria."] }),
    });
  }

  const result = await authenticate("/auth/login", { email, password });

  if (!result.ok) {
    return fail(result.message, values, result.fieldErrors);
  }

  // El layout raiz muestra el estado de sesion: se revalida para no servir
  // una cabecera desactualizada tras el login.
  revalidatePath("/", "layout");
  redirect(next);
}

export async function registerAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = readString(formData, "name");
  const email = readString(formData, "email").toLowerCase();
  const password = readString(formData, "password");
  const passwordConfirmation = readString(formData, "password_confirmation");
  const phone = readString(formData, "phone");
  const values = { name, email };

  const localErrors: Record<string, string[]> = {};

  if (!name) {
    localErrors.name = ["El nombre es obligatorio."];
  }

  if (!email) {
    localErrors.email = ["El correo es obligatorio."];
  }

  if (password.length < 8) {
    localErrors.password = ["La contrasena debe tener al menos 8 caracteres."];
  }

  if (password !== passwordConfirmation) {
    localErrors.password_confirmation = ["Las contrasenas no coinciden."];
  }

  if (Object.keys(localErrors).length > 0) {
    return fail("Revisa los campos marcados.", values, localErrors);
  }

  const result = await authenticate("/auth/register", {
    name,
    email,
    password,
    password_confirmation: passwordConfirmation,
    ...(phone ? { phone } : {}),
  });

  if (!result.ok) {
    return fail(result.message, values, result.fieldErrors);
  }

  revalidatePath("/", "layout");
  redirect("/orders");
}

export async function logoutAction(): Promise<void> {
  const token = await getSessionToken();

  await revokeRemoteToken(token);
  await destroySession();

  revalidatePath("/", "layout");
  redirect("/");
}

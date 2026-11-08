"use client";

import { useActionState } from "react";

import { registerAction } from "@/actions/auth";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { initialAuthFormState, type AuthFormState } from "@/lib/auth/form-state";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    registerAction,
    initialAuthFormState,
  );

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.status === "error" ? (
        <Alert tone="danger" role="alert" title="No pudimos crear tu cuenta">
          {state.message}
        </Alert>
      ) : null}

      <Field
        key={`name-${state.values.name}`}
        label="Nombre completo"
        name="name"
        type="text"
        autoComplete="name"
        placeholder="Jane Doe"
        defaultValue={state.values.name}
        error={state.fieldErrors.name?.[0]}
        required
      />

      <Field
        key={`email-${state.values.email}`}
        label="Correo electronico"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="jane@example.com"
        defaultValue={state.values.email}
        error={state.fieldErrors.email?.[0]}
        required
      />

      <Field
        label="Telefono (opcional)"
        name="phone"
        type="tel"
        autoComplete="tel"
        placeholder="+593 999 999 999"
        error={state.fieldErrors.phone?.[0]}
      />

      <Field
        label="Contrasena"
        name="password"
        type="password"
        autoComplete="new-password"
        hint="Minimo 8 caracteres."
        error={state.fieldErrors.password?.[0]}
        required
      />

      <Field
        label="Confirmar contrasena"
        name="password_confirmation"
        type="password"
        autoComplete="new-password"
        error={state.fieldErrors.password_confirmation?.[0]}
        required
      />

      <Button type="submit" size="lg" className="w-full" disabled={pending} aria-busy={pending}>
        {pending ? "Creando cuenta..." : "Crear cuenta"}
      </Button>
    </form>
  );
}

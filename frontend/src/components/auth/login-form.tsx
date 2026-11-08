"use client";

import { useActionState } from "react";

import { loginAction } from "@/actions/auth";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { initialAuthFormState, type AuthFormState } from "@/lib/auth/form-state";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    loginAction,
    initialAuthFormState,
  );

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next} />

      {state.status === "error" ? (
        <Alert tone="danger" role="alert" title="No pudimos iniciar sesion">
          {state.message}
        </Alert>
      ) : null}

      <Field
        key={state.values.email}
        label="Correo electronico"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="customer@example.com"
        defaultValue={state.values.email}
        error={state.fieldErrors.email?.[0]}
        required
      />

      <Field
        label="Contrasena"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="Tu contrasena"
        error={state.fieldErrors.password?.[0]}
        required
      />

      <Button type="submit" size="lg" className="w-full" disabled={pending} aria-busy={pending}>
        {pending ? "Ingresando..." : "Ingresar"}
      </Button>
    </form>
  );
}

/** Estado compartido por los formularios de autenticacion (useActionState). */
export interface AuthFormState {
  status: "idle" | "error";
  message: string;
  fieldErrors: Record<string, string[]>;
  values: {
    name: string;
    email: string;
  };
}

export const initialAuthFormState: AuthFormState = {
  status: "idle",
  message: "",
  fieldErrors: {},
  values: { name: "", email: "" },
};

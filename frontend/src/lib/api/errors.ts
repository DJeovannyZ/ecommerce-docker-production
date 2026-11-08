import type { ErrorPayload } from "@/lib/api/types";

/**
 * Error normalizado de la API. Modela los errores esperados como valores para
 * que Server Actions y Server Components puedan decidir como reaccionar sin
 * depender de `try/catch` genericos.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string | null;
  readonly errors: Record<string, string[]>;

  constructor(input: {
    status: number;
    message: string;
    code?: string | null;
    errors?: Record<string, string[]>;
  }) {
    super(input.message);
    this.name = "ApiError";
    this.status = input.status;
    this.code = input.code ?? null;
    this.errors = input.errors ?? {};
  }

  static fromPayload(status: number, payload: ErrorPayload): ApiError {
    return new ApiError({
      status,
      message: payload.message || "La API respondio con un error.",
      code: payload.code,
      errors: payload.errors ?? {},
    });
  }

  static network(
    message = "No se pudo contactar la API. Verifica que el backend este en ejecucion.",
  ) {
    return new ApiError({ status: 0, message, code: "NETWORK_ERROR" });
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isValidation(): boolean {
    return this.status === 422;
  }

  get isNetwork(): boolean {
    return this.status === 0;
  }

  /** Primer mensaje de validacion disponible, util para formularios. */
  get firstFieldError(): string | null {
    const values = Object.values(this.errors).flat();
    return values.length > 0 ? values[0] : null;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** Traduce un error desconocido a un mensaje mostrable al usuario. */
export function toUserMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.firstFieldError ?? error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Ocurrio un error inesperado. Intenta nuevamente.";
}

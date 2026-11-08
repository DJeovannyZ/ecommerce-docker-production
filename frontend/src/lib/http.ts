/** Utilidades compartidas por los Route Handlers. */

export async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const payload: unknown = await request.json();

    return typeof payload === "object" && payload !== null
      ? (payload as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

export function stringField(body: Record<string, unknown>, key: string): string {
  const value = body[key];

  return typeof value === "string" ? value.trim() : "";
}

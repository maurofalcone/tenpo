import { SessionExpiredError } from "@/lib/auth/session";

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function toUserMessage(error: unknown): string {
  if (error instanceof SessionExpiredError) {
    return error.message;
  }

  if (error instanceof ApiError) {
    if (error.status === 404) {
      return "No encontramos lo que buscabas.";
    }
    if (error.status === 429) {
      return "Hay demasiadas solicitudes. Probá de nuevo en un momento.";
    }
    if (error.status && error.status >= 500) {
      return "El servidor tiene un problema temporal. Intentá más tarde.";
    }
    if (error.status && error.status >= 400) {
      return "No pudimos completar la solicitud. Revisá e intentá de nuevo.";
    }
    return error.message;
  }

  if (error instanceof TypeError) {
    return "Sin conexión. Revisá tu red e intentá otra vez.";
  }

  if (error instanceof Error && /timeout|timed out|AbortError/i.test(error.message)) {
    return "La solicitud tardó demasiado. Probá de nuevo.";
  }

  return "Ocurrió un error inesperado. Intentá de nuevo.";
}

import { getValidAccessToken, SessionExpiredError } from "@/lib/auth/session";
import { ApiError } from "./errors";

const BASE_URL = "https://openaccess-api.clevelandart.org/api";
const TIMEOUT_MS = 15_000;

type RequestOptions = {
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
};

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(`${BASE_URL}${path}`);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === "" || value === false) {
        return;
      }
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

export async function apiRequest<T>({
  path,
  query,
  signal,
}: RequestOptions): Promise<T> {
  const accessToken = await getValidAccessToken();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const onAbort = () => controller.abort();
  signal?.addEventListener("abort", onAbort);

  try {
    const response = await fetch(buildUrl(path, query), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new ApiError("Request failed", response.status);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof SessionExpiredError || error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("La solicitud tardó demasiado. Probá de nuevo.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", onAbort);
  }
}

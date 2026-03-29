import { getStoredToken } from "./tokenStorage";

interface ApiRequestOptions extends RequestInit {
  withAuth?: boolean;
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { withAuth = true, headers, ...restOptions } = options;
  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (withAuth) {
    const token = getStoredToken();

    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${apiBaseUrl}/api${path}`, {
    ...restOptions,
    headers: requestHeaders,
  });

  if (!response.ok) {
    let errorMessage = "Nao foi possivel concluir a requisicao.";

    try {
      const errorData = (await response.json()) as { message?: string };
      errorMessage = errorData.message ?? errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

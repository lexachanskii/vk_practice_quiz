export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type ApiFetchOptions = RequestInit & {
  auth?: boolean;
};

function applyCustomHeaders(
  target: Record<string, string>,
  headers?: HeadersInit
) {
  if (!headers) {
    return;
  }

  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      target[key] = value;
    });
    return;
  }

  if (Array.isArray(headers)) {
    headers.forEach(([key, value]) => {
      target[key] = value;
    });
    return;
  }

  Object.assign(target, headers);
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { auth = false, headers, ...restOptions } = options;

  const isFormData =
    typeof FormData !== "undefined" && restOptions.body instanceof FormData;

  const requestHeaders: Record<string, string> = {};

  if (!isFormData) {
    requestHeaders["Content-Type"] = "application/json";
  }

  applyCustomHeaders(requestHeaders, headers);

  if (auth && typeof window !== "undefined") {
    const token = localStorage.getItem("quizflow_token");

    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...restOptions,
    headers: requestHeaders,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data as T;
}

export function getBackendFileUrl(path: string | null | undefined) {
  if (!path) {
    return "";
  }

  if (path.startsWith("http")) {
    return path;
  }

  return `${API_URL}${path}`;
}
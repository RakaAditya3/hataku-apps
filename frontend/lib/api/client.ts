const getBaseUrl = () =>
  typeof window === "undefined"
    ? (process.env.API_INTERNAL_URL ?? "")
    : (process.env.NEXT_PUBLIC_API_URL ?? "");

type FetchOptions = RequestInit & { token?: string };

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(fetchOptions.headers ?? {}),
  };

  const res = await fetch(`${getBaseUrl()}${path}`, { ...fetchOptions, headers });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  const data = (await res.json()) as T;

  if (!res.ok && res.status !== 422) {
    const msg = (data as { message?: string }).message ?? "Request failed";
    throw new Error(msg);
  }

  return data;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Type-safe API fetch helper.
 * Prepends NEXT_PUBLIC_API_URL to all paths.
 * Throws ApiError on non-2xx responses.
 *
 * @example
 * const pro = await apiFetch<Professional>('/professionisti/mario-rossi');
 * const results = await apiFetch<SearchResult[]>('/ricerca?lat=45.4&lon=9.1&category=idraulico');
 */
export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}/api${path.startsWith('/') ? path : `/${path}`}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      message = body?.message ?? body?.title ?? message;
    } catch {
      // ignore parse error
    }
    throw new ApiError(response.status, message);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json() as Promise<T>;
}

/**
 * Authenticated fetch — attaches Bearer token from NextAuth session.
 * Wrap with useSession on the client, or getServerSession on the server.
 */
export async function apiFetchAuth<T>(
  path: string,
  token: string,
  options?: RequestInit
): Promise<T> {
  return apiFetch<T>(path, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

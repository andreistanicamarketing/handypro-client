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

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options?.headers,
      },
    });
  } catch {
    // "Failed to fetch" del browser: rete giù o backend irraggiungibile
    throw new ApiError(0, 'Connessione non riuscita. Controlla la rete e riprova.');
  }

  if (!response.ok) {
    // Solo body.message (italiano, dal nostro middleware): body.title è l'inglese di ASP.NET
    let message =
      response.status === 400
        ? 'Controlla i dati inseriti e riprova.'
        : 'Si è verificato un errore. Riprova tra poco.';
    try {
      const body = await response.json();
      message = body?.message ?? message;
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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8004';

export class ApiError extends Error {
  readonly status: number;
  readonly errors?: Record<string, string[]>;
  readonly code?: string;
  readonly body?: unknown;

  constructor(
    status: number,
    message: string,
    errors?: Record<string, string[]>,
    code?: string,
    body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    this.code = code;
    this.body = body;
  }
}

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

interface RequestOptions {
  method?: Method;
  body?: unknown;
  query?: Record<string, string | number | null | undefined>;
  signal?: AbortSignal;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** Asks Laravel to set the XSRF-TOKEN cookie (Sanctum SPA flow). */
async function ensureCsrfCookie(): Promise<void> {
  await fetch(`${API_URL}/sanctum/csrf-cookie`, { credentials: 'include' });
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, signal } = options;

  if (method !== 'GET' && !getCookie('XSRF-TOKEN')) {
    await ensureCsrfCookie();
  }

  const url = new URL(`${API_URL}/api${path}`);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const xsrf = getCookie('XSRF-TOKEN');
  if (xsrf) headers['X-XSRF-TOKEN'] = xsrf;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      credentials: 'include', // send the session cookie cross-origin (3000 -> 8000)
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError(0, 'Cannot reach the server. Check your connection and try again.');
  }

  if (response.status === 204) return undefined as T;

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/auth/')) {
      onUnauthorized?.();
    }

    throw new ApiError(
      response.status,
      payload?.message ?? 'Something went wrong.',
      payload?.errors,
      payload?.code,
      payload,
    );
  }

  return payload as T;
}

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}
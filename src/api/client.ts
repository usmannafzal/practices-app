import type {
  CompletePracticeResponse,
  GetPracticesResponse,
  Practice,
  RatePracticeRequest,
  RatePracticeResponse,
  Rating,
} from '../types/practice';
import { API_BASE } from '../mocks/resolvers';

/**
 * Typed fetch wrappers. The screens/hooks never touch fetch directly — they go
 * through these functions, which centralize URL building, JSON parsing, and
 * error normalization.
 */

/** Error thrown for any non-2xx response, carrying the HTTP status so callers
 *  (e.g. the deleted-practice path) can branch on 404 specifically. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = (await response.json()) as { message?: string };
      if (body?.message) message = body.message;
    } catch {
      // non-JSON error body; keep the default message
    }
    throw new ApiError(response.status, message);
  }

  return (await response.json()) as T;
}

export async function fetchPractices(): Promise<Practice[]> {
  const data = await request<GetPracticesResponse>(`${API_BASE}/practices`);
  return data.practices;
}

export async function completePractice(id: string): Promise<Practice> {
  const data = await request<CompletePracticeResponse>(
    `${API_BASE}/practices/${id}/complete`,
    { method: 'POST' },
  );
  return data.practice;
}

export async function ratePractice(
  id: string,
  rating: Rating,
): Promise<Practice> {
  const body: RatePracticeRequest = { rating };
  const data = await request<RatePracticeResponse>(
    `${API_BASE}/practices/${id}/rate`,
    { method: 'POST', body: JSON.stringify(body) },
  );
  return data.practice;
}

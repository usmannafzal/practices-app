import type { RatePracticeRequest, Rating } from '../types/practice';
import {
  API_BASE,
  LATENCY_MS,
  resolveComplete,
  resolveGetPractices,
  resolveRate,
  type MockResult,
} from './resolvers';

/**
 * In-memory network transport for the running app.
 *
 * Why this instead of `msw/native`: React Native (Hermes) has no readable
 * `Response.body` stream, so MSW v2's interceptor matches the request but
 * delivers an empty body, breaking `response.json()`. Rather than patch MSW's
 * internals, the app swaps in this `fetch` shim, which routes through the SAME
 * resolvers the MSW handlers use. Tests still run against real MSW (`msw/node`).
 *
 * It mimics a real network: artificial latency, JSON bodies, and non-2xx status
 * codes (404 for deleted items, 500 for forced failures) so loading/error and
 * optimistic-rollback paths behave exactly as they would against the mock API.
 */

const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const COMPLETE_RE = /\/practices\/([^/]+)\/complete$/;
const RATE_RE = /\/practices\/([^/]+)\/rate$/;

function route(url: string, method: string, body: string | null): MockResult {
  if (method === 'GET' && url === `${API_BASE}/practices`) {
    return resolveGetPractices();
  }

  const completeMatch = url.match(COMPLETE_RE);
  if (method === 'POST' && completeMatch) {
    return resolveComplete(decodeURIComponent(completeMatch[1]!));
  }

  const rateMatch = url.match(RATE_RE);
  if (method === 'POST' && rateMatch) {
    const payload = (body ? JSON.parse(body) : {}) as RatePracticeRequest;
    return resolveRate(
      decodeURIComponent(rateMatch[1]!),
      payload.rating as Rating,
    );
  }

  return {
    status: 404,
    body: { message: 'Unhandled mock route', code: 'NOT_FOUND' },
  };
}

const realFetch = globalThis.fetch;

/** A fetch-compatible function backed by the in-memory mock. */
export const localFetch: typeof fetch = async (input, init) => {
  const url =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;

  // Only handle our mock API; let anything else fall through to real fetch.
  if (!url.startsWith(API_BASE)) {
    return realFetch(input, init);
  }

  const method = (init?.method ?? 'GET').toUpperCase();
  const requestBody =
    typeof init?.body === 'string' ? init.body : null;

  await wait(LATENCY_MS);
  const { status, body } = route(url, method, requestBody);

  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};

/** Install the in-memory transport as the global fetch (dev/app runtime only). */
export function installMockNetwork(): void {
  globalThis.fetch = localFetch;
}

import { http, HttpResponse, delay } from 'msw';
import type { RatePracticeRequest, Rating } from '../types/practice';
import {
  API_BASE,
  LATENCY_MS,
  resolveComplete,
  resolveGetPractices,
  resolveRate,
} from './resolvers';

export { API_BASE } from './resolvers';

/**
 * MSW v2 request handlers. Used by the Jest/Node test environment via
 * `msw/node`, where the Fetch `Response` body is fully supported, so failure
 * paths (404 / forced 500) are exercised through real MSW interception.
 *
 * The behaviour lives in `resolvers.ts` so these handlers and the app's
 * in-memory transport stay in lockstep.
 */
export const handlers = [
  http.get(`${API_BASE}/practices`, async () => {
    await delay(LATENCY_MS);
    const { status, body } = resolveGetPractices();
    return HttpResponse.json(body, { status });
  }),

  http.post(`${API_BASE}/practices/:id/complete`, async ({ params }) => {
    await delay(LATENCY_MS);
    const { status, body } = resolveComplete(String(params.id));
    return HttpResponse.json(body, { status });
  }),

  http.post(`${API_BASE}/practices/:id/rate`, async ({ params, request }) => {
    await delay(LATENCY_MS);
    const payload = (await request.json()) as RatePracticeRequest;
    const { status, body } = resolveRate(
      String(params.id),
      payload.rating as Rating,
    );
    return HttpResponse.json(body, { status });
  }),
];

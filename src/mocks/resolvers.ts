import type {
  ApiErrorBody,
  CompletePracticeResponse,
  GetPracticesResponse,
  RatePracticeResponse,
  Rating,
} from '../types/practice';
import { db } from './db';

/**
 * Shared mock logic — the single source of truth for how the "server" behaves.
 *
 * Both transports consume these resolvers so app runtime and tests can never
 * drift apart:
 *   - MSW handlers (`handlers.ts`) wrap them for the Jest/Node environment
 *     (`msw/node`), where the real Fetch `Response` body is fully supported.
 *   - The in-memory transport (`localTransport.ts`) wraps them for the running
 *     app, because MSW v2 cannot deliver a readable response body over Hermes
 *     (React Native has no `Response.body` stream — see README "Mock network").
 */

export const API_BASE = 'http://localhost:4000';

/** Simulated network latency so loading states and optimistic UI are visible. */
export const LATENCY_MS = 600;

export type MockResult = { status: number; body: object };

const notFound = (message: string): MockResult => {
  const body: ApiErrorBody = { message, code: 'NOT_FOUND' };
  return { status: 404, body };
};

const serverError = (message: string): MockResult => {
  const body: ApiErrorBody = { message, code: 'SERVER_ERROR' };
  return { status: 500, body };
};

export function resolveGetPractices(): MockResult {
  const body: GetPracticesResponse = { practices: db.list() };
  return { status: 200, body };
}

export function resolveComplete(id: string): MockResult {
  if (db.consumeForcedError(id)) {
    return serverError('Could not mark the practice complete. Try again.');
  }
  const practice = db.markComplete(id);
  if (!practice) {
    return notFound('This practice was deleted and is no longer available.');
  }
  const body: CompletePracticeResponse = { practice };
  return { status: 200, body };
}

export function resolveRate(id: string, rating: Rating): MockResult {
  if (db.consumeForcedError(id)) {
    return serverError('Could not save your rating. Try again.');
  }
  const practice = db.rate(id, rating);
  if (!practice) {
    return notFound('This practice was deleted and is no longer available.');
  }
  const body: RatePracticeResponse = { practice };
  return { status: 200, body };
}

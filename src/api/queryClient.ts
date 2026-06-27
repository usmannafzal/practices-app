import { QueryClient } from '@tanstack/react-query';

/**
 * One QueryClient for the whole app. This single cache is the source of truth
 * across tab/stack boundaries — marking a practice complete on Detail updates
 * the List and Summary with no manual prop passing.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // In-memory only; data is fresh for the session and refetched on demand.
        staleTime: 30_000,
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

/** Centralized query keys so cache reads/writes can't typo-drift apart. */
export const queryKeys = {
  practices: ['practices'] as const,
};

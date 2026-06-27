import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { fetchPractices } from '../api/client';
import { queryKeys } from '../api/queryClient';
import type { Practice } from '../types/practice';

export type PracticeSummary = {
  total: number;
  completedCount: number;
  ratedCount: number;
  /** Mean rating across completed+rated practices, or null when none rated. */
  averageRating: number | null;
  completed: Practice[];
};

/**
 * Derived summary computed from the SAME `['practices']` cache the List and
 * Detail use — via React Query `select`, so this is memoized and only recomputes
 * when the cache changes. Because a mark-complete mutation writes to that cache,
 * switching to this tab reflects the change immediately; no extra fetch, no
 * cross-screen wiring.
 */
export function useSummary() {
  const select = useCallback((list: Practice[]): PracticeSummary => {
    const completed = list.filter(p => p.completed_today);
    const ratings = completed.filter(
      (p): p is Practice & { rating: number } => p.rating != null,
    );
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, p) => sum + p.rating, 0) / ratings.length
        : null;

    return {
      total: list.length,
      completedCount: completed.length,
      ratedCount: ratings.length,
      averageRating,
      completed,
    };
  }, []);

  return useQuery({
    queryKey: queryKeys.practices,
    queryFn: fetchPractices,
    select,
  });
}

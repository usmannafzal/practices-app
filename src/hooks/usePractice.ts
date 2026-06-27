import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { fetchPractices } from '../api/client';
import { queryKeys } from '../api/queryClient';
import type { Practice } from '../types/practice';

/**
 * Single-practice hook. There is no GET-one endpoint by design: Detail derives
 * its practice from the SAME `['practices']` cache the List populates (via
 * `select`). That's what makes an optimistic mark-complete on Detail show up on
 * the List and Summary instantly — they all read one cache entry.
 *
 * `refetchOnMount: 'always'` makes opening Detail silently re-fetch in the
 * background: the cached practice renders immediately (no loading flash, since
 * `isLoading` stays false while `isFetching` is true), and React Query reconciles
 * the cache when the response arrives. Thanks to structural sharing, the UI only
 * re-renders if the server data actually differs — and because the fetch
 * refreshes the whole `['practices']` cache, the List and Summary benefit too.
 */
export function usePractice(id: string) {
  const select = useCallback(
    (list: Practice[]) => list.find(p => p.id === id),
    [id],
  );

  return useQuery({
    queryKey: queryKeys.practices,
    queryFn: fetchPractices,
    select,
    refetchOnMount: 'always',
  });
}

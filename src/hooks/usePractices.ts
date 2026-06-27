import { useQuery } from '@tanstack/react-query';
import { fetchPractices } from '../api/client';
import { queryKeys } from '../api/queryClient';

/**
 * List query hook. The single owner of the `['practices']` cache entry — every
 * screen reads practices through this (or through the cache it populates), so
 * marking a practice complete anywhere is reflected everywhere with no prop
 * drilling. Returning the raw query result keeps loading/error/refetch handling
 * in the screen where the UI states live.
 */
export function usePractices() {
  return useQuery({
    queryKey: queryKeys.practices,
    queryFn: fetchPractices,
  });
}

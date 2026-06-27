import type { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '../api/queryClient';
import type { Practice } from '../types/practice';

/**
 * Small, shared writers for the single `['practices']` cache entry. Keeping
 * these in one place means every mutation touches the cache the same way, so the
 * List, Detail, and Summary screens stay consistent without prop passing.
 */

/** Replace a single practice in the list cache by id (in place). */
export function upsertPractice(qc: QueryClient, practice: Practice): void {
  qc.setQueryData<Practice[]>(queryKeys.practices, old =>
    old ? old.map(p => (p.id === practice.id ? practice : p)) : old,
  );
}

/** Remove a practice from the list cache (deleted-on-server edge case). */
export function removePractice(qc: QueryClient, id: string): void {
  qc.setQueryData<Practice[]>(queryKeys.practices, old =>
    old ? old.filter(p => p.id !== id) : old,
  );
}

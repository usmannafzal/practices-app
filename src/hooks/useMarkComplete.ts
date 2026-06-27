import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError, completePractice } from '../api/client';
import { queryKeys } from '../api/queryClient';
import type { Practice } from '../types/practice';
import { removePractice, upsertPractice } from './practiceCache';

type Options = {
  /** Called when the server reports the practice was deleted (404). */
  onDeleted?: () => void;
};

type Context = { previous?: Practice[] };

/**
 * THE optimistic mutation (see README): mark-complete flips one boolean, so the
 * optimistic update and its rollback are trivially correct.
 *
 * - onMutate: cancel in-flight refetches, snapshot the cache, flip
 *   `completed_today` immediately so the UI reacts with zero latency.
 * - onError: roll back to the snapshot. If the failure is a 404, the practice
 *   was deleted server-side — remove it from the cache and notify the screen so
 *   it can navigate back and toast the user.
 * - onSuccess: reconcile with the authoritative server practice.
 */
export function useMarkComplete(id: string, options?: Options) {
  const qc = useQueryClient();

  return useMutation<Practice, Error, void, Context>({
    mutationFn: () => completePractice(id),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: queryKeys.practices });
      const previous = qc.getQueryData<Practice[]>(queryKeys.practices);
      qc.setQueryData<Practice[]>(queryKeys.practices, old =>
        old
          ? old.map(p => (p.id === id ? { ...p, completed_today: true } : p))
          : old,
      );
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.practices, context.previous);
      }
      if (error instanceof ApiError && error.isNotFound) {
        removePractice(qc, id);
        options?.onDeleted?.();
      }
    },
    onSuccess: practice => {
      upsertPractice(qc, practice);
    },
  });
}

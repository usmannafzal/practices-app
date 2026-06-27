import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError, ratePractice } from '../api/client';
import type { Practice, Rating } from '../types/practice';
import { removePractice, upsertPractice } from './practiceCache';

type Options = {
  /** Called when the server reports the practice was deleted (404). */
  onDeleted?: () => void;
};

/**
 * Rating mutation. Deliberately NOT optimistic: a rating change can require user
 * confirmation (the update modal), so we apply it only after the server
 * confirms, then persist the authoritative practice in the cache for the
 * session. A 404 means the practice was deleted server-side — same handling as
 * mark-complete: drop it from the cache and let the screen react.
 */
export function useRatePractice(id: string, options?: Options) {
  const qc = useQueryClient();

  return useMutation<Practice, Error, Rating>({
    mutationFn: (rating: Rating) => ratePractice(id, rating),
    onSuccess: practice => {
      upsertPractice(qc, practice);
    },
    onError: error => {
      if (error instanceof ApiError && error.isNotFound) {
        removePractice(qc, id);
        options?.onDeleted?.();
      }
    },
  });
}

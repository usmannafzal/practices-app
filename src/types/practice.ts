/**
 * Types that cross the API boundary.
 *
 * Anything serialized over the (mock) network is declared here so the client,
 * the MSW handlers, and the React Query hooks all agree on one shape.
 */

export type PracticeCategory = 'movement' | 'breath' | 'reflection' | 'rest';

/** A rating is 1-5, or null when the practice has not been rated yet. */
export type Rating = 1 | 2 | 3 | 4 | 5;

export type Practice = {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  category: PracticeCategory;
  completed_today: boolean;
  rating: Rating | null;
};

/** GET /practices */
export type GetPracticesResponse = {
  practices: Practice[];
};

/** POST /practices/:id/complete */
export type CompletePracticeResponse = {
  practice: Practice;
};

/** POST /practices/:id/rate */
export type RatePracticeRequest = {
  rating: Rating;
};

export type RatePracticeResponse = {
  practice: Practice;
};

/** Shape returned by the mock for any not-found id (deleted-practice path). */
export type ApiErrorBody = {
  message: string;
  code: 'NOT_FOUND' | 'SERVER_ERROR';
};

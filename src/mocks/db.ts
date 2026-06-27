import type { Practice, Rating } from '../types/practice';
import { createSeedPractices } from './seed';

/**
 * In-memory mock database. State lives in module memory only — it survives for
 * the session but resets on a full reload/restart, matching the "no persistence
 * across restarts" requirement.
 *
 * Tests can drive failure paths via `deletePractice` (per-id 404) and
 * `setForcedError` (force the next mutation to 500 so rollback can be asserted).
 */
class MockDb {
  private practices: Practice[] = [];
  private forcedErrorIds = new Set<string>();

  constructor() {
    this.reset();
  }

  reset(): void {
    this.practices = createSeedPractices();
    this.forcedErrorIds.clear();
  }

  list(): Practice[] {
    return this.practices.map(p => ({ ...p }));
  }

  find(id: string): Practice | undefined {
    const found = this.practices.find(p => p.id === id);
    return found ? { ...found } : undefined;
  }

  /** Remove a practice from the server so mutations against it return 404. */
  deletePractice(id: string): void {
    this.practices = this.practices.filter(p => p.id !== id);
  }

  /** Force the next mutation against `id` to fail once (for rollback tests). */
  setForcedError(id: string): void {
    this.forcedErrorIds.add(id);
  }

  /** Returns true and clears the flag if `id` was marked to fail. */
  consumeForcedError(id: string): boolean {
    if (this.forcedErrorIds.has(id)) {
      this.forcedErrorIds.delete(id);
      return true;
    }
    return false;
  }

  markComplete(id: string): Practice | undefined {
    const practice = this.practices.find(p => p.id === id);
    if (!practice) return undefined;
    practice.completed_today = true;
    return { ...practice };
  }

  rate(id: string, rating: Rating): Practice | undefined {
    const practice = this.practices.find(p => p.id === id);
    if (!practice) return undefined;
    practice.rating = rating;
    practice.completed_today = true;
    return { ...practice };
  }
}

export const db = new MockDb();

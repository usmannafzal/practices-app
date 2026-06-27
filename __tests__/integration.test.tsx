import { renderHook, waitFor } from '@testing-library/react-native';
import { useMarkComplete } from '../src/hooks/useMarkComplete';
import { useSummary } from '../src/hooks/useSummary';
import { createQueryWrapper } from '../src/test-utils/queryWrapper';

/**
 * Integration: the single React Query cache is the source of truth, so marking
 * a practice complete must flow through to the derived Summary with no manual
 * wiring. This mirrors the real "mark complete on Detail -> Summary updates"
 * flow at the hook/cache level (no navigation needed to prove the data path).
 */
describe('mark complete propagates to the summary', () => {
  it('increments the completed count after a mark-complete mutation', async () => {
    const { wrapper } = createQueryWrapper();

    const { result } = await renderHook(
      () => ({
        summary: useSummary(),
        // practice-2 is seeded as pending (only every 7th is pre-completed).
        markComplete: useMarkComplete('practice-2'),
      }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.summary.isSuccess).toBe(true));
    const before = result.current.summary.data!.completedCount;

    result.current.markComplete.mutate();

    await waitFor(() =>
      expect(result.current.summary.data!.completedCount).toBe(before + 1),
    );
  });
});

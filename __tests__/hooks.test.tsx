import { renderHook, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { queryKeys } from '../src/api/queryClient';
import { useMarkComplete } from '../src/hooks/useMarkComplete';
import { usePractices } from '../src/hooks/usePractices';
import { db } from '../src/mocks/db';
import { API_BASE } from '../src/mocks/resolvers';
import { server } from '../src/mocks/server';
import { createQueryWrapper } from '../src/test-utils/queryWrapper';
import type { Practice } from '../src/types/practice';

describe('usePractices — data-fetching states', () => {
  it('starts loading then resolves with the seeded list', async () => {
    const { wrapper } = createQueryWrapper();
    const { result } = await renderHook(() => usePractices(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(120);
  });

  it('handles an empty list', async () => {
    server.use(
      http.get(`${API_BASE}/practices`, () =>
        HttpResponse.json({ practices: [] }),
      ),
    );

    const { wrapper } = createQueryWrapper();
    const { result } = await renderHook(() => usePractices(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it('surfaces a server error (500)', async () => {
    server.use(
      http.get(`${API_BASE}/practices`, () =>
        HttpResponse.json(
          { message: 'boom', code: 'SERVER_ERROR' },
          { status: 500 },
        ),
      ),
    );

    const { wrapper } = createQueryWrapper();
    const { result } = await renderHook(() => usePractices(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('surfaces a network failure', async () => {
    server.use(
      http.get(`${API_BASE}/practices`, () => HttpResponse.error()),
    );

    const { wrapper } = createQueryWrapper();
    const { result } = await renderHook(() => usePractices(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useMarkComplete — deleted-practice edge case', () => {
  it('rolls back, removes the practice from the cache, and notifies on 404', async () => {
    const { wrapper, queryClient } = createQueryWrapper();
    // Seed the cache as the List would have.
    queryClient.setQueryData<Practice[]>(queryKeys.practices, db.list());

    // The practice is deleted server-side, so the mutation will 404.
    db.deletePractice('practice-1');

    const onDeleted = jest.fn();
    const { result } = await renderHook(
      () => useMarkComplete('practice-1', { onDeleted }),
      { wrapper },
    );

    result.current.mutate();

    await waitFor(() => expect(onDeleted).toHaveBeenCalledTimes(1));

    const cached = queryClient.getQueryData<Practice[]>(queryKeys.practices);
    expect(cached?.some(p => p.id === 'practice-1')).toBe(false);
  });
});

# Daily Practices

A small habit-tracking app: browse daily practices, open one to mark it done and
rate it, and see a summary of today's progress. Three screens, a mock API, no
real backend.

## Setup

```bash
npm install
npm start        # then press i (iOS) / a (Android), or scan the QR code
npm test         # runs the test suite
```

Expo SDK 56, React Native 0.85, TypeScript (strict). No config or env vars — the
mock network starts itself with the app.

## Time spent

~4 hours:

- Setup + mock network — 50m
- Navigation + list + states — 30m
- Detail + mutations + optimistic update — 50m
- Summary + responsive — 50m
- Tests + docs — 1h

## State management — React Query, one shared cache

I used **React Query** with all practices in a single cache (`['practices']`). No
Redux, no Context for app state.

The real challenge here is keeping data in sync across two tabs: mark a practice
complete on Detail and both the List and the Summary tab must update. So instead
of each screen keeping its own copy, every screen reads from one cache:

- **List** reads the cache.
- **Detail** has no "get one" endpoint — it picks its practice out of the same
  list cache with `select`, so its mutations change the cache everyone shares.
- **Summary** is computed from that cache with `select` (memoized), so switching
  tabs after a change shows new numbers instantly, with no refetch.

Redux would be overkill for one list; Context would mean hand-building caching
and loading/error state — a worse React Query. With one cache, cross-tab sync
needs no extra code.

## Optimistic update — mark complete

**Mark-complete is optimistic; rating is not.** Mark-complete flips one boolean,
so updating instantly and undoing on failure are both simple and safe. Rating can
need a confirm step (changing an existing rating), so it only updates after the
server confirms. Both also handle a 404 (deleted on the server): undo, drop it
from the cache, toast, and go back.

## Network layer

No real server, but it behaves like one (delays, status codes, JSON) so loading
and rollback states are real. Note: **MSW can't be the live mock on React Native**
— Hermes has no streamed response body, so MSW returns an empty body and
`response.json()` fails. So I split it: shared server logic in `resolvers.ts`, a
small `fetch` shim (`localTransport.ts`) for the app, and real MSW (`msw/node`)
for tests. App and tests run the same logic and can't drift.

## Performance

- **FlashList** for virtualization; 120 items seeded so recycling is real.
- Fixed-height, `React.memo`'d `Card` with stable `renderItem`/`keyExtractor`, so
  reused rows only re-render when their practice changes.

## Custom hooks

Split by job, not by screen: reads (`usePractices`, `usePractice`, `useSummary`),
writes (`useMarkComplete`, `useRatePractice`), one file that owns all cache writes
(`practiceCache.ts`), and a layout-only `useResponsiveColumns`. Screens never
touch the cache or `fetch` directly.

## Testing

12 tests across three layers:

- **Component** — `Card` renders title/status/rating and calls `onPress`;
  `Button` fires only when enabled.
- **Hook** — `usePractices` (loading, empty, 500, network fail); `useMarkComplete`
  optimistic flip → rollback on 500, and the 404 path. Runs against real MSW.
- **Integration** — mark-complete updates the Summary count (proves cross-screen
  sync).

Skipped: full screen/navigation tests (lots of setup for mostly wiring — tested
the logic at the hook level instead), snapshots (brittle), and the toast/modal
(presentational; *when* they fire is already covered).

## Next with another 4 hours

- `expo-haptics` on mark-complete.
- A screen-level List test (loading → tap → navigate).
- Separate rating from completion (currently rating also completes).
- Dark mode (`useColorScheme` is read but unused).
- Persist session to storage across reloads.

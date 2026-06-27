# Daily Practices

A small habit-tracking app: browse 120+ daily practices, mark them complete, rate them, and see a live summary. Built with **Expo (managed workflow)** + TypeScript (strict) + TanStack Query v5, with lists rendered by **FlashList**.

## Setup

```bash
npm install

npm run ios       # or: npm run android, npm run web
npm start         # Expo dev server (then pick a target)
npm test          # Jest (jest-expo) + React Native Testing Library
```

- Node ≥ 22 (developed on Node 26).
- No backend: a mock network starts automatically in dev (see "Mock network" below).
- No persistence: state is in-memory for the session, by design.

## Screens

- **Practices** (tab) → **List → Detail** (native stack)
  - List: `FlashList` of fixed-height cards; loading / error / empty states; pull-to-refresh; responsive columns (2 once width ≥ 600dp, i.e. tablets in either orientation; 1 on phones in portrait) that react to rotation.
  - Detail: full info, optimistic **Mark complete**, 1–5 star rating, first-time-vs-update flows, and the deleted-practice edge case.
- **Summary** (tab): completed-today count and average rating, derived from the cache, rendered with the same `Card`.

## State management — why TanStack Query

A single `QueryClient` cache (`['practices']`) is the **one source of truth**. Every screen reads it through hooks, so a mutation on Detail is reflected on the List and Summary with **no prop drilling and no global store**:

- `usePractices()` — list query (List).
- `usePractice(id)` — derives one practice from the same cache via `select` (Detail); there is intentionally no GET-one endpoint.
- `useMarkComplete(id)` / `useRatePractice(id)` — mutations that write back to that cache.
- `useSummary()` — derived/computed state (count, average) via `select`; recomputes only when the cache changes, so switching tabs after a mutation reflects it immediately.

Query handles caching, request states, mutations, optimistic updates, and rollback out of the box — exactly this app's needs — so reaching for Redux/Zustand would be over-engineering.

## Expo (managed workflow)

The app runs on the **Expo managed workflow** (`expo` SDK + `expo-router`-free, plain React Navigation). The entry point is `index.ts` → `registerRootComponent(App)`; there is no bare `android/` or `ios/` project to maintain — Expo handles the native shell, so `npm run ios|android|web` and Expo Go cover every target. The data layer (Query + mock network), navigation, virtualization, and responsive layout are all pure JS/TS and don't depend on any Expo-only native module.

## Architecture

- **Hooks** own all data/state logic (`src/hooks/`); screens stay declarative. Boundaries: one hook per query/derivation (`usePractices`, `usePractice`, `useSummary`) and one per mutation (`useMarkComplete`, `useRatePractice`), with shared cache writers in `practiceCache.ts`.
- **Reusable components** (`src/components/`): `Card` (shared by List **and** Summary), `Button`, `Stars` (display + input), `StateView`, `Toast`, `ConfirmModal`.
- **Design tokens** in one place (`src/theme/`): `colors`, `spacing`, `radius`, `typography`, plus a `normalize()` responsive-scaling helper. Components consume tokens only — no scattered hardcoded colors/margins.
- **Types that cross the API boundary** live in `src/types/practice.ts`, shared by the client, the mock, and the hooks.

## List rendering (FlashList) and what it replaced

Both lists use **FlashList** (`@shopify/flash-list` v2). FlashList recycles cell views off-screen and measures items itself, so the manual `FlatList` knobs are gone — there is no `getItemLayout`, `ROW_HEIGHT` constant, `windowSize`, `initialNumToRender`, or `removeClippedSubviews`. v2 also auto-sizes, so no `estimatedItemSize` is needed.

What's kept, and why it still matters:

- `Card` is `React.memo`'d and `renderItem` is a `useCallback`. FlashList is a `PureComponent` and recycles cells, so a stable `renderItem` plus a memoized `Card` means a recycled cell only re-renders when the `practice` bound to it changes (e.g. one item's cache entry updates) — not on every scroll tick.
- `keyExtractor` is a stable module-level function.
- The card keeps its fixed `CARD_HEIGHT` and 2-line description clamp: equal-sized cells keep the multi-column grid even and make recycling cheap.
- Responsive columns come from `numColumns`. FlashList has no `columnWrapperStyle`, so the inter-column gap is created with a half-gutter inside each cell plus a matching reduction in the list's horizontal padding (equal columns, `spacing.md` gap, `spacing.lg` edges).

## Which mutation is optimistic, and why

**Mark complete** is the optimistic one. It flips a single boolean (`completed_today`), so the optimistic update and its **rollback** are trivially correct: snapshot the cache in `onMutate`, flip the flag, and restore the snapshot in `onError`. Rating is *not* optimistic because changing an existing rating can require user confirmation — applying it only after the server confirms keeps the confirm/cancel flow honest.

## Rating flow

- **First-time rating:** applied immediately, success toast ("Rating added."), no modal.
- **Updating a rating:** tapping a different star opens a confirm modal stating the change ("from X to Y"); Confirm applies it ("Rating updated."), Keep discards it (cache untouched).

## Edge case — deleted practice (404)

If a mutation targets a practice the server no longer has, the mock returns **404**. Both mutation hooks detect `ApiError.isNotFound`, **remove it from the cache**, and notify the screen, which **navigates back to the List** and shows an error toast. A `__DEV__`-only "Simulate server deletion" button on Detail triggers this path by hand (the mock's `db.deletePractice` powers it; tests cover it programmatically).

## Mock network (MSW v2 + a React Native note)

- **Tests** run against real **MSW v2 via `msw/node`** (`src/mocks/server.ts`), which exercises real request interception including the forced-500 and 404 paths.
- **The app** uses an in-memory `fetch` transport (`src/mocks/localTransport.ts`) instead of `msw/native`. Reason: React Native (Hermes) has no readable `Response.body` stream, so MSW's interceptor matches the request but delivers an empty body (`JSON Parse error`). Rather than patch MSW's internals, the app swaps in a tiny transport that routes through the **same resolvers** (`src/mocks/resolvers.ts`) the MSW handlers use — so app behavior and tested behavior can't drift, and the mock still simulates latency + error responses. It is installed from `index.ts` under `__DEV__` before the app renders.

## Testing strategy

`npm test` — 11 tests across 3 layers (run via the real MSW server, on the `jest-expo` preset):

- **Component** (`components.test.tsx`): `Card` renders title/status/rating (and hides rating when unrated); `Button` fires on press and not when disabled.
- **Hook / edge** (`hooks.test.tsx`): `usePractices` loading→success, empty, server-error (500), and network-failure states; `useMarkComplete` deleted-practice (404) → rollback + cache removal + `onDeleted`.
- **Integration** (`integration.test.tsx`): mark-complete propagates through the single cache to `useSummary` (mirrors "Detail → Summary updates").

**Skipped, and why:** full navigation/screen render tests (high setup cost and flakiness for little extra signal — the hook/integration tests already prove the cross-screen data path); snapshot tests (brittle, low value); visual/responsive-layout assertions (better verified by eye). The goal was meaningful coverage of logic and the required failure paths, not coverage for its own sake.

## Time spent

≈ 5–6 hours. <!-- adjust to your actual time -->

## What I'd build next (with another 4 hours)

- Persist the session cache (e.g. `AsyncStorage` + Query persister) so state survives restarts.
- Make Summary cards navigate into Detail (cross-tab navigation).
- Filter/sort the List by category and completion; a category summary breakdown.
- A screen-level integration test driving the real Detail → Summary flow through navigation.
- Light/dark theme via the existing token module, and subtle animations on complete/rate.

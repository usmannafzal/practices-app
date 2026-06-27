/**
 * Test bootstrap. Runs the real MSW server (msw/node) for the whole suite so the
 * data layer is exercised against actual request interception — including the
 * forced-error and not-found failure paths. The in-memory db is reset between
 * tests so each test starts from the deterministic seed.
 */
import { db } from './src/mocks/db';
import { server } from './src/mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  server.resetHandlers();
  db.reset();
});

afterAll(() => server.close());

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * MSW server for the Jest (Node) environment. Tests import this to start/stop
 * the mock and to override individual handlers for failure-path coverage.
 */
export const server = setupServer(...handlers);

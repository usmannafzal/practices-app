import { registerRootComponent } from 'expo';

import App from './App';
import { installMockNetwork } from './src/mocks/localTransport';

// Install the in-memory mock network before the app renders. Dev-only: there is
// no real backend. See src/mocks/localTransport.ts for why this is used in the
// app instead of msw/native (tests still run against real MSW via msw/node).
if (__DEV__) {
  installMockNetwork();
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App).
registerRootComponent(App);

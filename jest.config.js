const path = require('path');

module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Extend jest-expo's transform to also cover .mjs (some MSW deps ship .mjs).
  transform: {
    '^.+\\.(js|jsx|mjs|ts|tsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    // jest-expo (via @react-native/jest-preset) injects the "react-native"
    // export condition, under which msw's "./node" subpath maps to null. Point
    // it at the CJS build directly.
    '^msw/node$': path.join(__dirname, 'node_modules/msw/lib/node/index.js'),
  },
  // jest-expo's default list, plus the MSW / React Query ESM packages that must
  // be transpiled by babel-jest.
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|standard-navigation|@tanstack|msw|@mswjs|until-async|@bundled-es-modules|headers-polyfill|outvariant|strict-event-emitter|@open-draft|graphql|rettime))',
    '/node_modules/react-native-reanimated/plugin/',
    '/node_modules/@react-native/babel-preset/',
  ],
};

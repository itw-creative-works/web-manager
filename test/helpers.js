const assert = require('assert');

// Shared test config (Firebase + Sentry disabled for unit tests)
const TEST_CONFIG = {
  brand: { id: 'test' },
  firebase: { app: { enabled: false } },
  sentry: { enabled: false },
};

// Manager singleton
let Manager;

function getManager() {
  return Manager;
}

// Mocha root hook plugin — runs before all test files
module.exports = {
  TEST_CONFIG,
  assert,
  getManager,
  mochaHooks: {
    async beforeAll() {
      const mod = await import('../src/index.js');
      Manager = mod.default;
    },
    beforeEach() {
      if (global.window) {
        global.window.localStorage.clear();
        global.window.sessionStorage.clear();
      }
    },
  },
};

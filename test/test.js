const package = require('../package.json');
const assert = require('assert');

// Setup browser environment for tests
require('./test-setup.js');

// Import the ES module - we'll use dynamic import
let Manager;

before(async () => {
  // Dynamically import the ES module
  const module = await import('../src/index.js');
  Manager = module.default;
});

beforeEach(() => {
  // Reset Manager state before each test
  if (Manager) {
    Manager.state = {
      auth: {
        user: null
      },
      serviceWorker: null
    };
    Manager.config = {};
    
    // Reset Firebase references
    Manager._firebaseApp = null;
    Manager._firebaseAuth = null;
    Manager._firebaseFirestore = null;
    Manager._firebaseMessaging = null;
  }
  
  // Clear storage
  if (global.window) {
    global.window.localStorage.clear();
    global.window.sessionStorage.clear();
  }
});

after(() => {
  // Global cleanup
});

/*
 * ============
 *  Test Cases
 * ============
 */
describe(`${package.name}`, () => {

  // Configuration & Initialization
  describe('Configuration & Initialization', () => {

    it('should initialize with new brand-centric format', (done) => {
      const config = {
        brand: {
          id: "test-brand",
          name: "Test Brand",
          description: "Test description",
          contact: {
            email: "test@example.com"
          }
        },
        firebase: {
          app: {
            enabled: true,
            config: {
              apiKey: "test-key",
              authDomain: "test.firebaseapp.com",
              projectId: "test-project",
              appId: "1:test:web:test",
              messagingSenderId: "123456789" // Add messagingSenderId for Firebase Messaging
            }
          }
        }
      };

      Manager.init(config, (err) => {
        // For now, ignore Firebase initialization errors in tests
        // The config should still be set
        assert.strictEqual(Manager.config.brand?.id, 'test-brand');
        assert.strictEqual(Manager.config.brand?.name, 'Test Brand');
        assert.strictEqual(Manager.config.firebase?.app?.enabled, true);
        assert.strictEqual(Manager.config.firebase?.app?.config?.apiKey, 'test-key');
        done();
      });
    });

    it('should support legacy configuration format', (done) => {
      const legacyConfig = {
        global: {
          app: 'legacy-app',
          version: '1.0.0',
          brand: {
            name: 'Legacy App'
          }
        },
        page: {
          settings: {
            libraries: {
              firebase_app: {
                enabled: true,
                config: {
                  apiKey: 'legacy-key'
                }
              }
            }
          }
        }
      };

      Manager.init(legacyConfig, () => {
        assert.strictEqual(Manager.config.global?.app, 'legacy-app');
        assert.strictEqual(Manager.config.global?.brand?.name, 'Legacy App');
        assert.strictEqual(Manager.config.page?.settings?.libraries?.firebase_app?.enabled, true);
        done();
      });
    });

    it('should handle validRedirectHosts configuration', (done) => {
      const config = {
        brand: { id: "test" },
        validRedirectHosts: ["app.example.com", "admin.example.com"]
      };

      Manager.init(config, () => {
        const redirectHosts = Manager.config.validRedirectHosts;
        assert(Array.isArray(redirectHosts));
        assert(redirectHosts.includes('app.example.com'));
        assert(redirectHosts.includes('admin.example.com'));
        done();
      });
    });
  });

  // Storage Module
  describe('Storage Module', () => {

    before((done) => {
      Manager.init({ 
        brand: { id: "test" },
        firebase: { app: { enabled: false } }
      }, () => done()); // Ignore errors
    });

    it('should set and get values from local storage', () => {
      const storage = Manager.storage('local');
      storage.set('testKey', 'testValue');
      assert.strictEqual(storage.get('testKey'), 'testValue');
    });

    it('should handle nested properties with dot notation', () => {
      const storage = Manager.storage('local');
      storage.set('user.profile.name', 'John Doe');
      assert.strictEqual(storage.get('user.profile.name'), 'John Doe');
    });

    it('should work with session storage', () => {
      const storage = Manager.storage('session');
      storage.set('sessionKey', 'sessionValue');
      assert.strictEqual(storage.get('sessionKey'), 'sessionValue');
    });
  });

  // Auth Module
  describe('Auth Module', () => {

    before((done) => {
      Manager.init({
        brand: { id: "test" },
        firebase: { app: { enabled: false } } // Disable Firebase for testing
      }, done);
    });

    it('should return auth module', () => {
      const auth = Manager.auth();
      assert(auth);
      assert(typeof auth.ready === 'function');
      assert(typeof auth.signIn === 'function');
    });

    it('should have ready promise', () => {
      const auth = Manager.auth();
      assert(auth.ready() instanceof Promise);
    });
  });

  // Utilities Module
  describe('Utilities Module', () => {

    before((done) => {
      Manager.init({ 
        brand: { id: "test" },
        firebase: { app: { enabled: false } }
      }, () => done()); // Ignore errors
    });

    it('should escape HTML', () => {
      const utilities = Manager.utilities();
      const escaped = utilities.escapeHTML('<script>alert("xss")</script>');
      assert.strictEqual(escaped, '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    it('should have getContext method', () => {
      const utilities = Manager.utilities();
      const context = utilities.getContext();
      assert(context.client);
      assert(typeof context.client.mobile === 'boolean');
      assert(typeof context.client.desktop === 'boolean');
    });

    it('should have clipboardCopy method', () => {
      const utilities = Manager.utilities();
      assert(typeof utilities.clipboardCopy === 'function');
    });
  });

  // DOM Module
  describe('DOM Module', () => {

    before((done) => {
      Manager.init({ 
        brand: { id: "test" },
        firebase: { app: { enabled: false } }
      }, () => done()); // Ignore errors
    });

    it('should have loadScript function', () => {
      const dom = Manager.dom();
      assert(typeof dom.loadScript === 'function');
    });
  });

  // Manager Methods
  describe('Manager Methods', () => {

    before((done) => {
      Manager.init({ 
        brand: { id: "test" },
        environment: 'development',
        firebase: { app: { enabled: false } }
      }, () => done()); // Ignore errors
    });

    it('should have configuration after init', () => {
      assert(Manager.config);
      assert.strictEqual(Manager.config.brand?.id, 'test');
    });


    it('should detect development environment', () => {
      const isDev = Manager.isDevelopment();
      assert.strictEqual(isDev, true);
    });

    it('should validate redirect URLs', () => {
      // Test with current host
      const currentHost = 'http://localhost:3000/page';
      assert.strictEqual(Manager.isValidRedirectUrl(currentHost), true);
      
      // Test with invalid host
      assert.strictEqual(Manager.isValidRedirectUrl('http://evil.com'), false);
    });
  });

})

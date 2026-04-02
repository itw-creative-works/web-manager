const { getManager, TEST_CONFIG, assert } = require('../helpers.js');

describe('Configuration & Initialization', () => {

  it('should initialize with brand-centric format', async () => {
    const Manager = getManager();
    await Manager.initialize({
      brand: {
        id: 'test-brand',
        name: 'Test Brand',
        description: 'Test description',
        contact: { email: 'test@example.com' },
      },
      firebase: {
        app: {
          enabled: false,
          config: {
            apiKey: 'test-key',
            authDomain: 'test.firebaseapp.com',
            projectId: 'test-project',
            appId: '1:test:web:test',
            messagingSenderId: '123456789',
          },
        },
      },
      sentry: { enabled: false },
    });

    assert.strictEqual(Manager.config.brand?.id, 'test-brand');
    assert.strictEqual(Manager.config.brand?.name, 'Test Brand');
    assert.strictEqual(Manager.config.firebase?.app?.enabled, false);
    assert.strictEqual(Manager.config.firebase?.app?.config?.apiKey, 'test-key');
  });

  it('should merge validRedirectHosts into config', async () => {
    const Manager = getManager();
    await Manager.initialize({
      ...TEST_CONFIG,
      validRedirectHosts: ['app.example.com', 'admin.example.com'],
    });

    const hosts = Manager.config.validRedirectHosts;
    assert(Array.isArray(hosts));
    assert(hosts.includes('app.example.com'));
    assert(hosts.includes('admin.example.com'));
  });

  it('should deep-merge defaults for missing keys', async () => {
    const Manager = getManager();
    await Manager.initialize(TEST_CONFIG);

    assert.strictEqual(Manager.config.environment, 'production');
    assert.strictEqual(typeof Manager.config.buildTime, 'number');
    assert.strictEqual(Manager.config.auth?.enabled, true);
  });
});

const { getManager, TEST_CONFIG, assert } = require('../helpers.js');

describe('Manager Methods', () => {

  it('should detect development environment', async () => {
    const Manager = getManager();
    await Manager.initialize({ ...TEST_CONFIG, environment: 'development' });
    assert.strictEqual(Manager.isDevelopment(), true);
  });

  it('should detect production environment', async () => {
    const Manager = getManager();
    await Manager.initialize({ ...TEST_CONFIG, environment: 'production' });
    assert.strictEqual(Manager.isDevelopment(), false);
  });

  it('should validate redirect URLs for current host', async () => {
    const Manager = getManager();
    await Manager.initialize(TEST_CONFIG);
    assert.strictEqual(Manager.isValidRedirectUrl('http://localhost:3000/page'), true);
  });

  it('should reject redirect URLs for unknown hosts', () => {
    assert.strictEqual(getManager().isValidRedirectUrl('http://evil.com'), false);
  });

  it('should allow redirect URLs for configured hosts', async () => {
    const Manager = getManager();
    await Manager.initialize({
      ...TEST_CONFIG,
      validRedirectHosts: ['trusted.com'],
    });
    assert.strictEqual(Manager.isValidRedirectUrl('http://trusted.com/callback'), true);
  });

  it('should reject malformed redirect URLs', () => {
    assert.strictEqual(getManager().isValidRedirectUrl('not-a-url'), false);
  });

  it('should return Functions URL for production', async () => {
    const Manager = getManager();
    await Manager.initialize({
      ...TEST_CONFIG,
      firebase: { app: { enabled: false, config: { projectId: 'my-project' } } },
    });
    assert.strictEqual(Manager.getFunctionsUrl(), 'https://us-central1-my-project.cloudfunctions.net');
  });

  it('should return Functions URL for development', async () => {
    const Manager = getManager();
    await Manager.initialize({
      ...TEST_CONFIG,
      environment: 'development',
      firebase: { app: { enabled: false, config: { projectId: 'my-project' } } },
    });
    assert.strictEqual(Manager.getFunctionsUrl(), 'http://localhost:5001/my-project/us-central1');
  });

  it('should allow overriding environment in getFunctionsUrl', async () => {
    const Manager = getManager();
    await Manager.initialize({
      ...TEST_CONFIG,
      firebase: { app: { enabled: false, config: { projectId: 'my-project' } } },
    });
    assert.strictEqual(Manager.getFunctionsUrl('development'), 'http://localhost:5001/my-project/us-central1');
  });

  it('should throw when getFunctionsUrl called without projectId', async () => {
    const Manager = getManager();
    await Manager.initialize(TEST_CONFIG);
    assert.throws(() => Manager.getFunctionsUrl(), /project ID/i);
  });

  it('should return API URL for development', async () => {
    const Manager = getManager();
    await Manager.initialize({ ...TEST_CONFIG, environment: 'development' });
    assert.strictEqual(Manager.getApiUrl(), 'http://localhost:5002');
  });

  it('should return API URL with api. subdomain for production', async () => {
    const Manager = getManager();
    await Manager.initialize({
      ...TEST_CONFIG,
      firebase: { app: { enabled: false, config: { authDomain: 'example.firebaseapp.com' } } },
    });
    assert.strictEqual(Manager.getApiUrl(), 'https://api.example.firebaseapp.com');
  });
});

describe('Module Getters', () => {

  before(async () => {
    await getManager().initialize(TEST_CONFIG);
  });

  it('should return storage module', () => { assert(getManager().storage()); });
  it('should return auth module', () => { assert(getManager().auth()); });
  it('should return bindings module', () => { assert(getManager().bindings()); });
  it('should return firestore module', () => { assert(getManager().firestore()); });
  it('should return notifications module', () => { assert(getManager().notifications()); });
  it('should return serviceWorker module', () => { assert(getManager().serviceWorker()); });
  it('should return sentry module', () => { assert(getManager().sentry()); });
  it('should return usage module', () => { assert(getManager().usage()); });
  it('should return dom module', () => { assert(getManager().dom()); });
  it('should return utilities module', () => { assert(getManager().utilities()); });
});

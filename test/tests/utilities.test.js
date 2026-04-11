const { getManager, TEST_CONFIG, assert } = require('../helpers.js');

describe('Utilities Module', () => {

  before(async () => {
    await getManager().initialize(TEST_CONFIG);
  });

  describe('escapeHTML', () => {

    it('should escape HTML strings', () => {
      const u = getManager().utilities();
      assert.strictEqual(
        u.escapeHTML('<script>alert("xss")</script>'),
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
      );
    });

    it('should escape objects recursively', () => {
      const u = getManager().utilities();
      const input = {
        name: '<b>John</b>',
        email: 'john@example.com',
        nested: { bio: '<img src=x onerror=alert(1)>', count: 42, active: true },
      };
      const escaped = u.escapeHTML(input);

      assert.strictEqual(escaped.name, '&lt;b&gt;John&lt;/b&gt;');
      assert.strictEqual(escaped.email, 'john@example.com');
      assert.strictEqual(escaped.nested.bio, '&lt;img src=x onerror=alert(1)&gt;');
      assert.strictEqual(escaped.nested.count, 42);
      assert.strictEqual(escaped.nested.active, true);

      // Original is not mutated
      assert.strictEqual(input.name, '<b>John</b>');
    });

    it('should escape arrays', () => {
      const escaped = getManager().utilities().escapeHTML(['<b>bold</b>', 'safe', 123]);
      assert.strictEqual(escaped[0], '&lt;b&gt;bold&lt;/b&gt;');
      assert.strictEqual(escaped[1], 'safe');
      assert.strictEqual(escaped[2], 123);
    });

    it('should pass through null, undefined, numbers, and booleans', () => {
      const u = getManager().utilities();
      assert.strictEqual(u.escapeHTML(null), null);
      assert.strictEqual(u.escapeHTML(undefined), undefined);
      assert.strictEqual(u.escapeHTML(42), 42);
      assert.strictEqual(u.escapeHTML(true), true);
    });

    it('should work when detached from the utilities instance', () => {
      // Methods are arrow class fields — `this` is permanently bound to the instance,
      // so destructuring, aliasing, or passing as a callback must all work.
      const utilities = getManager().utilities();

      // Destructured
      const { escapeHTML } = utilities;
      assert.strictEqual(escapeHTML('<b>x</b>'), '&lt;b&gt;x&lt;/b&gt;');

      // Aliased via property access
      const escape = utilities.escapeHTML;
      assert.strictEqual(escape('<b>x</b>'), '&lt;b&gt;x&lt;/b&gt;');

      // Passed as a callback
      const result = ['<a>', '<b>'].map(utilities.escapeHTML);
      assert.strictEqual(result[0], '&lt;a&gt;');
      assert.strictEqual(result[1], '&lt;b&gt;');
    });
  });

  describe('Detection methods', () => {

    it('getPlatform should return a string', () => {
      assert(typeof getManager().utilities().getPlatform() === 'string');
    });

    it('getBrowser should return string or null', () => {
      const browser = getManager().utilities().getBrowser();
      assert(browser === null || typeof browser === 'string');
    });

    it('getRuntime should return web by default', () => {
      assert.strictEqual(getManager().utilities().getRuntime(), 'web');
    });

    it('getRuntime should use config override', async () => {
      const Manager = getManager();
      await Manager.initialize({ ...TEST_CONFIG, runtime: 'electron' });
      assert.strictEqual(Manager.utilities().getRuntime(), 'electron');
      await Manager.initialize(TEST_CONFIG);
    });

    it('isMobile should return a boolean', () => {
      assert.strictEqual(typeof getManager().utilities().isMobile(), 'boolean');
    });

    it('getDevice should return mobile, tablet, or desktop', () => {
      const device = getManager().utilities().getDevice();
      assert(['mobile', 'tablet', 'desktop'].includes(device));
    });
  });

  describe('getContext', () => {

    it('should return client and geolocation objects', () => {
      const context = getManager().utilities().getContext();
      assert(context.client);
      assert(context.geolocation);
      assert(typeof context.client.mobile === 'boolean');
      assert(typeof context.client.device === 'string');
      assert(typeof context.client.url === 'string');
    });
  });

  it('should have clipboardCopy method', () => {
    assert(typeof getManager().utilities().clipboardCopy === 'function');
  });

  it('should have showNotification method', () => {
    assert(typeof getManager().utilities().showNotification === 'function');
  });
});

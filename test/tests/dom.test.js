const { getManager, TEST_CONFIG, assert } = require('../helpers.js');

describe('DOM Module', () => {

  before(async () => {
    await getManager().initialize(TEST_CONFIG);
  });

  it('should expose loadScript and ready', () => {
    const dom = getManager().dom();
    assert(typeof dom.loadScript === 'function');
    assert(typeof dom.ready === 'function');
  });

  it('ready should resolve immediately when DOM is complete', async () => {
    await getManager().dom().ready();
  });

  it('loadScript should reject when no src provided', async () => {
    try {
      await getManager().dom().loadScript({});
      assert.fail('Should have thrown');
    } catch (e) {
      assert(e.message.includes('source is required'));
    }
  });
});

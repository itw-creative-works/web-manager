const { getManager, TEST_CONFIG, assert } = require('../helpers.js');

describe('Usage Module', () => {

  before(async () => {
    await getManager().initialize(TEST_CONFIG);
  });

  it('should expose expected methods', () => {
    const usage = getManager().usage();
    assert(typeof usage.getUsageDuration === 'function');
    assert(typeof usage.getSessionDuration === 'function');
    assert(typeof usage.getInstalledDate === 'function');
    assert(typeof usage.getSessionCount === 'function');
    assert(typeof usage.getBindingData === 'function');
    assert(typeof usage.reset === 'function');
  });

  it('should return positive usage duration', () => {
    const ms = getManager().usage().getUsageDuration('milliseconds');
    assert(ms >= 0);
  });

  it('should return duration in different units', () => {
    const ms = getManager().usage().getUsageDuration('milliseconds');
    const sec = getManager().usage().getUsageDuration('seconds');
    assert(ms >= sec);
  });

  it('should return session count >= 1', () => {
    assert(getManager().usage().getSessionCount() >= 1);
  });

  it('should return installed date as Date object', () => {
    const date = getManager().usage().getInstalledDate();
    assert(date instanceof Date);
  });

  it('should return binding data with expected structure', () => {
    const data = getManager().usage().getBindingData();
    assert(typeof data.installed === 'number');
    assert(typeof data.session.count === 'number');
    assert(typeof data.duration.total.seconds === 'number');
    assert(typeof data.duration.session.seconds === 'number');
    assert(typeof data.version.isNew === 'boolean');
  });

  it('should reset usage data', async () => {
    const usage = getManager().usage();
    await usage.reset();
    assert.strictEqual(usage.getSessionCount(), 1);
    assert.strictEqual(usage.isNewVersion, false);
  });
});

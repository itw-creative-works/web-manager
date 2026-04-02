const { getManager, TEST_CONFIG, assert } = require('../helpers.js');

describe('Storage Module', () => {

  before(async () => {
    await getManager().initialize(TEST_CONFIG);
  });

  it('should set and get values', () => {
    const storage = getManager().storage();
    storage.set('testKey', 'testValue');
    assert.strictEqual(storage.get('testKey'), 'testValue');
  });

  it('should handle nested dot-notation paths', () => {
    const storage = getManager().storage();
    storage.set('user.profile.name', 'John Doe');
    assert.strictEqual(storage.get('user.profile.name'), 'John Doe');
  });

  it('should return default when key missing', () => {
    const storage = getManager().storage();
    assert.strictEqual(storage.get('nonexistent', 'fallback'), 'fallback');
  });

  it('should return entire storage when no path given', () => {
    const storage = getManager().storage();
    storage.set('a', 1);
    const all = storage.get();
    assert.strictEqual(typeof all, 'object');
    assert.strictEqual(all.a, 1);
  });

  it('should remove a key', () => {
    const storage = getManager().storage();
    storage.set('removeMe', 'value');
    assert.strictEqual(storage.get('removeMe'), 'value');
    storage.remove('removeMe');
    assert.strictEqual(storage.get('removeMe'), undefined);
  });

  it('should clear all storage', () => {
    const storage = getManager().storage();
    storage.set('key1', 'a');
    storage.set('key2', 'b');
    storage.clear();
    const all = storage.get();
    assert.deepStrictEqual(all, {});
  });

  it('should work with session storage', () => {
    const session = getManager().storage().session;
    session.set('sessionKey', 'sessionValue');
    assert.strictEqual(session.get('sessionKey'), 'sessionValue');
  });

  it('should remove session storage key', () => {
    const session = getManager().storage().session;
    session.set('temp', 'data');
    session.remove('temp');
    assert.strictEqual(session.get('temp'), undefined);
  });

  it('should clear session storage', () => {
    const session = getManager().storage().session;
    session.set('a', 1);
    session.set('b', 2);
    session.clear();
    assert.deepStrictEqual(session.get(), {});
  });
});

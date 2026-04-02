const { getManager, TEST_CONFIG, assert } = require('../helpers.js');

describe('Auth Module', () => {

  before(async () => {
    await getManager().initialize(TEST_CONFIG);
  });

  it('should expose expected methods', () => {
    const auth = getManager().auth();
    assert(typeof auth.listen === 'function');
    assert(typeof auth.signInWithEmailAndPassword === 'function');
    assert(typeof auth.signOut === 'function');
    assert(typeof auth.isAuthenticated === 'function');
    assert(typeof auth.getUser === 'function');
    assert(typeof auth.resolveSubscription === 'function');
  });

  it('should return unauthenticated when Firebase disabled', () => {
    assert.strictEqual(getManager().auth().isAuthenticated(), false);
    assert.strictEqual(getManager().auth().getUser(), null);
  });

  it('should call listener with null user when Firebase disabled', (done) => {
    getManager().auth().listen((state) => {
      assert.strictEqual(state.user, null);
      assert(state.account);
      assert.strictEqual(state.account.subscription.product.id, 'basic');
      done();
    });
  });

  describe('resolveSubscription', () => {

    it('should return basic plan for no account', () => {
      const result = getManager().auth().resolveSubscription(null);
      assert.strictEqual(result.plan, 'basic');
      assert.strictEqual(result.active, false);
      assert.strictEqual(result.trialing, false);
      assert.strictEqual(result.cancelling, false);
    });

    it('should return basic for basic product', () => {
      const result = getManager().auth().resolveSubscription({
        subscription: { product: { id: 'basic' }, status: 'active' },
      });
      assert.strictEqual(result.plan, 'basic');
      assert.strictEqual(result.active, false);
    });

    it('should return active for paid plan with active status', () => {
      const result = getManager().auth().resolveSubscription({
        subscription: { product: { id: 'premium' }, status: 'active' },
      });
      assert.strictEqual(result.plan, 'premium');
      assert.strictEqual(result.active, true);
      assert.strictEqual(result.trialing, false);
      assert.strictEqual(result.cancelling, false);
    });

    it('should detect trialing state', () => {
      const futureUNIX = Math.floor(Date.now() / 1000) + 86400;
      const result = getManager().auth().resolveSubscription({
        subscription: {
          product: { id: 'premium' },
          status: 'active',
          trial: { claimed: true, expires: { timestampUNIX: futureUNIX } },
        },
      });
      assert.strictEqual(result.active, true);
      assert.strictEqual(result.trialing, true);
      assert.strictEqual(result.cancelling, false);
    });

    it('should detect cancelling state', () => {
      const result = getManager().auth().resolveSubscription({
        subscription: {
          product: { id: 'premium' },
          status: 'active',
          cancellation: { pending: true },
        },
      });
      assert.strictEqual(result.active, true);
      assert.strictEqual(result.cancelling, true);
      assert.strictEqual(result.trialing, false);
    });

    it('should return basic when status is not active', () => {
      const result = getManager().auth().resolveSubscription({
        subscription: { product: { id: 'premium' }, status: 'suspended' },
      });
      assert.strictEqual(result.plan, 'basic');
      assert.strictEqual(result.active, false);
    });
  });
});

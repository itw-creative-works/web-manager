const DEFAULT_ACCOUNT = {
  auth: { uid: null, email: null, temporary: false },
  subscription: {
    product: { id: 'basic', name: 'Basic' },
    status: 'active',
    expires: { timestamp: null, timestampUNIX: null },
    trial: { claimed: false, expires: { timestamp: null, timestampUNIX: null } },
    cancellation: { pending: false, date: { timestamp: null, timestampUNIX: null } },
    payment: {
      processor: null,
      orderId: null,
      resourceId: null,
      frequency: null,
      price: 0,
      startDate: { timestamp: null, timestampUNIX: null },
      updatedBy: {
        event: { name: null, id: null },
        date: { timestamp: null, timestampUNIX: null },
      },
    },
  },
  roles: { admin: false, betaTester: false, developer: false },
  affiliate: { code: null, referrals: [] },
  activity: {
  },
  metadata: {
    created: { timestamp: null, timestampUNIX: null },
    updated: { timestamp: null, timestampUNIX: null },
  },
  api: { clientId: null, privateKey: null },
  usage: {},
  personal: { name: { first: null, last: null } },
  oauth2: {},
  attribution: {
    affiliate: { code: null, timestamp: null, url: null, page: null },
    utm: { tags: {}, timestamp: null, url: null, page: null },
  },
};

function resolveAccount(rawData, firebaseUser) {
  const user = firebaseUser || {};
  const data = rawData || {};

  // Deep merge: rawData values take precedence over defaults
  function deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (!source.hasOwnProperty(key)) continue;
      if (result[key] === null || result[key] === undefined) {
        result[key] = source[key];
      } else if (typeof result[key] === 'object' && !Array.isArray(result[key])
        && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = deepMerge(result[key], source[key]);
      }
    }
    return result;
  }

  const account = deepMerge(data, DEFAULT_ACCOUNT);

  // Set auth from firebase user if not already set
  account.auth = account.auth || {};
  account.auth.uid = account.auth.uid || user.uid || null;
  account.auth.email = account.auth.email || user.email || null;

  return account;
}

class Auth {
  constructor(manager) {
    this.manager = manager;
    this._authStateCallbacks = [];
    this._hasProcessedStateChange = false;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getUser();
  }

  // Get current user
  getUser() {
    const user = this.manager.firebaseAuth?.currentUser;
    if (!user) return null;

    // Get displayName and photoURL from providerData if not set on main user
    let displayName = user.displayName;
    let photoURL = user.photoURL;

    // If no displayName or photoURL, check providerData
    if ((!displayName || !photoURL) && user.providerData && user.providerData.length > 0) {
      for (const provider of user.providerData) {
        if (!displayName && provider.displayName) {
          displayName = provider.displayName;
        }
        if (!photoURL && provider.photoURL) {
          photoURL = provider.photoURL;
        }
        // Stop if we found both
        if (displayName && photoURL) break;
      }
    }

    // If still no displayName, use email or fallback
    if (!displayName) {
      displayName = user.email ? user.email.split('@')[0] : 'User';
    }

    // If still no photoURL, use a default avatar service
    if (!photoURL) {
      // Use ui-avatars.com which generates avatars from initials
      const name = displayName || user.email.split('@')[0] || 'ME';
      const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      photoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=200&background=random&color=000`;
    }

    return {
      uid: user.uid,
      email: user.email,
      displayName: displayName,
      photoURL: photoURL,
      emailVerified: user.emailVerified,
      metadata: user.metadata,
      providerData: user.providerData,
    };
  }

  // Listen for auth state changes (waits for settled state before first callback)
  listen(options = {}, callback) {
    // Handle overloaded signatures - if first param is a function, it's the callback
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    // If Firebase is not enabled, call callback immediately with null
    if (!this.manager.config.firebase?.app?.enabled) {
      callback({
        user: null,
        account: resolveAccount({}, {}),
      });

      return () => {};
    }

    // Build auth state and call the provided callback
    const run = async (user) => {
      const state = { user: this.getUser() };

      // Fetch account data if the user is logged in and Firestore is available
      if (user && this.manager.firebaseFirestore) {
        try {
          state.account = await this._getAccountData(user.uid);
        } catch (error) {
          this.manager.sentry().captureException(new Error('Failed to get account data', { cause: error }));
        }
      }

      // Ensure account is always a resolved object
      state.account = state.account || resolveAccount({}, { uid: user?.uid });

      // Derive resolved subscription state for bindings and consumers
      state.resolved = this.resolveSubscription(state.account);

      // Update bindings and storage once per auth state change
      if (!this._hasProcessedStateChange) {
        this.manager.bindings().update({
          auth: state,
          usage: this._resolveUsage(state),
        });
        this.manager.storage().set('auth', state);

        this._hasProcessedStateChange = true;
      }

      callback(state);
    };

    // Once listeners: wait for auth to settle, fire once, done
    if (options.once) {
      this.manager._authReady.then(() => {
        run(this.manager.firebaseAuth?.currentUser || null);
      });

      return () => {};
    }

    // Persistent listeners: subscribe to all auth state changes (initial + future)
    // If auth already settled, fire the first callback via the promise to catch up
    const unsubscribe = this._subscribe(run);

    if (this.manager._firebaseAuthInitialized) {
      this.manager._authReady.then(() => {
        run(this.manager.firebaseAuth?.currentUser || null);
      });
    }

    return unsubscribe;
  }

  // Subscribe to ongoing auth state changes (sign-in, sign-out after initial settle)
  _subscribe(callback) {
    this._authStateCallbacks.push(callback);

    return () => {
      const index = this._authStateCallbacks.indexOf(callback);
      if (index > -1) {
        this._authStateCallbacks.splice(index, 1);
      }
    };
  }

  // Called by Manager when Firebase auth state changes
  _handleAuthStateChange(user) {
    // Reset state processing flag for new auth state
    this._hasProcessedStateChange = false;

    // Call all persistent listener callbacks
    this._authStateCallbacks.forEach(callback => {
      try {
        callback(user);
      } catch (error) {
        console.error('Auth state callback error:', error);
      }
    });
  }

  // Resolves calculated subscription fields that require derivation logic
  // Raw data (product.id, status, trial, cancellation) is on account.subscription directly
  // Returns: { plan, active, trialing, cancelling }
  // - plan: the plan ID the user effectively has access to RIGHT NOW ('basic' if cancelled/suspended)
  // - active: user has active access (active, trialing, or cancelling)
  // - trialing: user is in an active trial (backend status is 'active' but trial hasn't expired)
  // - cancelling: cancellation is pending (backend status is 'active' but cancellation.pending is true)
  resolveSubscription(account) {
    const subscription = (account || this.manager.storage().get('auth', {})?.account)?.subscription || {};
    const productId = subscription.product?.id || 'basic';

    // Derive trial and cancelling states from raw backend data
    let trialing = false;
    let cancelling = false;

    if (productId !== 'basic' && subscription.status === 'active') {
      trialing = !!(subscription.trial?.claimed
        && subscription.trial?.expires?.timestampUNIX > Math.floor(Date.now() / 1000));
      cancelling = !trialing && !!subscription.cancellation?.pending;
    }

    const active = (productId !== 'basic' && subscription.status === 'active');

    return {
      plan: active ? productId : 'basic',
      active,
      trialing,
      cancelling,
    };
  }

  // Resolve usage bindings from account data + plan limits from config.
  // Returns: { credits: { monthly: 5, limit: 100 }, ... }
  _resolveUsage(state) {
    const accountUsage = state.account?.usage || {};
    const plan = state.resolved?.plan || 'basic';
    const plans = this.manager.config.payment?.plans || [];
    const planConfig = plans.find(p => p.id === plan) || {};
    const limits = planConfig.limits || {};

    // Merge current usage with limits for each feature
    const usage = {};
    const keys = new Set([...Object.keys(accountUsage), ...Object.keys(limits)]);

    for (const key of keys) {
      usage[key] = {
        ...(accountUsage[key] || {}),
        limit: limits[key] || 0,
      };
    }

    return usage;
  }

  // Get ID token for the current user
  async getIdToken(forceRefresh = false) {
    try {
      const user = this.manager.firebaseAuth.currentUser;

      const { getIdToken } = await import('firebase/auth');
      return await getIdToken(user, forceRefresh);
    } catch (error) {
      console.error('Get ID token error:', error);
      throw error;
    }
  }

  // Sign in with custom token
  async signInWithCustomToken(token) {
    try {
      if (!this.manager.firebaseAuth) {
        throw new Error('Firebase Auth is not initialized');
      }

      const { signInWithCustomToken } = await import('firebase/auth');
      const userCredential = await signInWithCustomToken(this.manager.firebaseAuth, token);
      return userCredential.user;
    } catch (error) {
      console.error('Sign in with custom token error:', error);
      throw error;
    }
  }

  // Sign in with email and password
  async signInWithEmailAndPassword(email, password) {
    try {
      if (!this.manager.firebaseAuth) {
        throw new Error('Firebase Auth is not initialized');
      }

      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const userCredential = await signInWithEmailAndPassword(this.manager.firebaseAuth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Sign in with email and password error:', error);
      throw error;
    }
  }

  // Sign out the current user
  async signOut() {
    try {
      const { signOut } = await import('firebase/auth');
      await signOut(this.manager.firebaseAuth);
      return true;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  // Get account data from Firestore
  async _getAccountData(uid) {
    try {
      if (!this.manager.firebaseFirestore) {
        return null;
      }

      const { doc, getDoc } = await import('firebase/firestore');

      const accountDoc = doc(this.manager.firebaseFirestore, 'users', uid);
      const snapshot = await getDoc(accountDoc);

      // Get current Firebase user to pass uid and email to resolver
      const firebaseUser = this.manager.firebaseAuth?.currentUser || { uid };

      if (snapshot.exists()) {
        // Resolve the account data to ensure proper structure and defaults
        const rawData = snapshot.data();
        const resolvedAccount = resolveAccount(rawData, firebaseUser);
        return resolvedAccount;
      }

      // If no account exists, return resolved empty object for consistent structure
      return resolveAccount({}, firebaseUser);
    } catch (error) {
      console.error('Get account data error:', error);
      return null;
    }
  }

  // Set up DOM event listeners for auth buttons
  setupEventListeners() {
    // Only set up once DOM is ready
    if (typeof document === 'undefined') return;

    // Set up sign out button listeners using event delegation
    document.addEventListener('click', async (event) => {
      // Use closest to handle clicks on child elements
      const signOutBtn = event.target.closest('.auth-signout-btn');

      if (signOutBtn) {
        event.preventDefault();
        event.stopPropagation();

        try {
          // Show confirmation
          if (!confirm('Are you sure you want to sign out?')) {
            return;
          }

          // Sign out
          await this.signOut();

          // Show success notification
          this.manager.utilities().showNotification('Successfully signed out.', 'success');

        } catch (error) {
          console.error('Sign out error:', error);
          // Show error notification if utilities are available
          this.manager.utilities().showNotification('Failed to sign out. Please try again.', 'danger');
        }
      }
    });
  }

}

export default Auth;

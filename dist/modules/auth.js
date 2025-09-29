import resolveAccount from 'resolve-account';

class Auth {
  constructor(manager) {
    this.manager = manager;
    this._authStateCallbacks = [];
    this._readyCallbacks = [];
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
      // Call callback with null user and empty account
      callback({
        user: null,
        account: resolveAccount({}, {})
      });

      // Return empty unsubscribe function
      return () => {};
    }

    // Function to get current state and call callback
    const getStateAndCallback = async (user) => {
      // Start with the user which will return null if not authenticated
      const state = { user: this.getUser() };

      // Then, add account data if requested and user exists
      // if (options.account && user && this.manager.firebaseFirestore) {
      // Fetch account if the user is logged in AND Firestore is available
      if (user && this.manager.firebaseFirestore) {
        try {
          state.account = await this._getAccountData(user.uid);
        } catch (error) {
          // Pass error to Sentry
          this.manager.sentry().captureException(new Error('Failed to get account data', { cause: error }));
        }
      }

      // Always ensure account is at least a default resolved object
      state.account = state.account || resolveAccount({}, { uid: user?.uid });

      // Process state change (update bindings and storage) only once across all callbacks
      // Now ONLY the first listener will process the state change until the next auth state change
      if (!this._hasProcessedStateChange) {
        // Run update - nest state under 'auth' key for consistent access
        this.manager.bindings().update({ auth: state });

        // Save to storage
        const storage = this.manager.storage();
        storage.set('auth', state);

        // Mark that we've processed this state change
        this._hasProcessedStateChange = true;
      }

      // Call the provided callback with the state
      callback(state);
    };

    let hasCalledback = false;

    // Set up listener for auth state changes
    const unsubscribe = this.onAuthStateChanged((user) => {
      // If once option is set, unsubscribe
      // We have to do this here because unsubscribe is only available after this call
      if (options.once && unsubscribe) {
        unsubscribe();
        return;
      }

      // Wait for settled state before first callback
      if (!hasCalledback && !this.manager._firebaseAuthInitialized) {
        return; // Auth state not yet determined
      }

      // Mark that we've called back at least once
      hasCalledback = true;

      // Get current state and call the callback
      getStateAndCallback(user);
    });

    return unsubscribe;
  }

  // Listen for auth state changes
  onAuthStateChanged(callback) {
    this._authStateCallbacks.push(callback);

    // If auth is already initialized, call the callback immediately
    if (this.manager._firebaseAuthInitialized) {
      callback(this.manager.firebaseAuth?.currentUser || null);
    }

    // Return unsubscribe function
    return () => {
      const index = this._authStateCallbacks.indexOf(callback);
      if (index > -1) {
        this._authStateCallbacks.splice(index, 1);
      }
    };
  }

  // Internal method to handle auth state changes
  _handleAuthStateChange(user) {
    // Reset state processing flag for new auth state
    this._hasProcessedStateChange = false;

    // Call all registered callbacks
    this._authStateCallbacks.forEach(callback => {
      try {
        callback(user);
      } catch (error) {
        console.error('Auth state callback error:', error);
      }
    });
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

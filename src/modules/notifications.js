class Notifications {
  constructor(manager) {
    this.manager = manager;
    this._requestInProgress = false;
  }

  initialize(config) {
    this._vapidKey = this.manager.config?.firebase?.messaging?.config?.vapidKey || null;

    const storage = this.manager.storage();
    const stored = storage.get('notifications');
    const permission = typeof Notification !== 'undefined' ? Notification.permission : 'default';

    console.log('[WM:push] Page load check:', { storedSubscribed: stored?.subscribed, storedToken: stored?.token?.slice(-8), permission });

    // If localStorage says subscribed but browser permission disagrees, clear it
    if (stored?.subscribed && permission !== 'granted') {
      console.log('[WM:push] Clearing stale subscription — permission is', permission);
      storage.set('notifications', { subscribed: false, token: null });
    }

    // Arm auto-request if not currently subscribed (including just-cleared)
    const autoRequest = config?.autoRequest;
    if ((!stored?.subscribed || permission !== 'granted') && autoRequest > 0) {
      console.log('[WM:push] Arming auto-request (delay:', autoRequest + 'ms)');
      this._setupAutoRequest(autoRequest);
    }

    // Listen for foreground messages (tab is focused)
    if (permission === 'granted') {
      console.log('[WM:push] Setting up foreground listener...', { supported: this.isSupported(), hasMessaging: !!this.manager.firebaseMessaging });
      this.onMessage((payload) => {
        console.log('[WM:push] Foreground message received:', payload);
      }).then(unsub => {
        console.log('[WM:push] Foreground listener registered:', typeof unsub === 'function' ? 'OK' : 'FAILED (got empty fn)');
      });
    }
  }

  _setupAutoRequest(delay) {
    if (typeof document === 'undefined') {
      return;
    }

    const handleClick = () => {
      document.removeEventListener('click', handleClick);

      setTimeout(() => {
        console.log('[WM:push] Auto-requesting notification permissions...');
        this.subscribe().catch(err => {
          console.error('[WM:push] Auto-subscription failed:', err.message);
        });
      }, delay);
    };

    document.addEventListener('click', handleClick);
  }

  // Check if notifications are supported
  isSupported() {
    return 'Notification' in window &&
           'serviceWorker' in navigator &&
           this.manager.firebaseMessaging !== undefined;
  }

  // Check if user is subscribed to notifications
  async isSubscribed() {
    try {
      if (!this.isSupported()) {
        return false;
      }

      return Notification.permission === 'granted';
    } catch (error) {
      console.error('Check subscription error:', error);
      return false;
    }
  }

  // Subscribe to push notifications
  async subscribe(options = {}) {
    try {
      if (!this.isSupported()) {
        throw new Error('Push notifications are not supported');
      }

      if (this._requestInProgress) {
        throw new Error('Subscription request already in progress');
      }

      this._requestInProgress = true;

      // Get Firebase messaging
      const messaging = this.manager.firebaseMessaging;
      if (!messaging) {
        throw new Error('Firebase Messaging not initialized');
      }

      // Get service worker registration
      const swRegistration = this.manager.state.serviceWorker;
      if (!swRegistration) {
        throw new Error('Service Worker not registered');
      }

      // Request notification permission if not already granted
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          throw new Error('Notification permission denied');
        }
      } else if (Notification.permission === 'denied') {
        throw new Error('Notification permission denied');
      }

      // Get FCM token
      const { getToken } = await import('firebase/messaging');
      const tokenOptions = { serviceWorkerRegistration: swRegistration };
      if (this._vapidKey) { tokenOptions.vapidKey = this._vapidKey; }
      const token = await getToken(messaging, tokenOptions);

      if (!token) {
        throw new Error('Failed to get FCM token');
      }

      // Save subscription info
      await this._saveSubscription(token);

      // Track in local storage
      const storage = this.manager.storage();
      storage.set('notifications', {
        subscribed: true,
        token: token,
        timestamp: new Date().toISOString(),
        uid: this.manager.auth().getUser()?.uid || null
      });

      this._requestInProgress = false;
      return { subscribed: true, token };

    } catch (error) {
      this._requestInProgress = false;
      console.error('Subscribe error:', error);
      throw error;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe() {
    try {
      if (!this.isSupported()) {
        return false;
      }

      const { deleteToken } = await import('firebase/messaging');
      const messaging = this.manager.firebaseMessaging;

      if (messaging) {
        await deleteToken(messaging);
      }

      // Clear local storage
      const storage = this.manager.storage();
      storage.remove('notifications');

      return true;
    } catch (error) {
      console.error('Unsubscribe error:', error);
      throw error;
    }
  }

  // Request permission (without subscribing)
  async requestPermission() {
    try {
      if (!this.isSupported()) {
        throw new Error('Notifications not supported');
      }

      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Request permission error:', error);
      return false;
    }
  }

  // Get current FCM token
  async getToken() {
    try {
      if (!this.isSupported()) {
        return null;
      }

      const messaging = this.manager.firebaseMessaging;
      if (!messaging) {
        return null;
      }

      const { getToken } = await import('firebase/messaging');
      const swRegistration = this.manager.state.serviceWorker;

      const tokenOptions = { serviceWorkerRegistration: swRegistration };
      if (this._vapidKey) { tokenOptions.vapidKey = this._vapidKey; }
      return await getToken(messaging, tokenOptions);
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  }

  // Listen for foreground messages
  async onMessage(callback) {
    try {
      if (!this.isSupported()) {
        return () => {};
      }

      const { onMessage } = await import('firebase/messaging');
      const messaging = this.manager.firebaseMessaging;

      if (!messaging) {
        return () => {};
      }

      return onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload);

        // Extract notification data - handle both payload.notification and payload.data formats
        const notificationData = payload.notification || payload.data || {};
        const { title, body, icon, badge, image, click_action, url, tag } = notificationData;

        // Determine the click URL (prioritize click_action, then url, then data.url)
        const clickUrl = click_action || url || payload.data?.click_action || payload.data?.url;

        // Show notification if we have at least a title
        if (title) {
          const notification = new Notification(title, {
            body: body || '',
            icon: icon || '/favicon.ico',
            badge: badge,
            image: image,
            tag: tag || 'default',
            data: { ...payload.data, clickUrl },
            requireInteraction: true,
            renotify: true
          });

          notification.onclick = (event) => {
            event.preventDefault();

            // Focus or open the target window
            if (clickUrl) {
              // Try to find an existing window/tab with this URL
              window.focus();
              window.open(clickUrl, '_blank');
            } else {
              // Just focus the current window if no URL
              window.focus();
            }

            notification.close();
          };
        }

        // Call the user's callback with the full payload
        if (callback) {
          callback(payload);
        }
      });
    } catch (error) {
      console.error('Message listener error:', error);
      return () => {};
    }
  }

  // Sync subscription when auth state changes or on page load.
  // Re-fetches the current FCM token — if it changed (browser rotated it,
  // service worker was re-registered, etc.), saves the new token to Firestore
  // and updates localStorage. Clears the subscribed state if the token is gone.
  async syncSubscription() {
    try {
      const storage = this.manager.storage();
      const storedNotification = storage.get('notifications');

      const permission = typeof Notification !== 'undefined' ? Notification.permission : 'default';

      console.log('[WM:push:sync] Starting sync:', { storedSubscribed: storedNotification?.subscribed, storedToken: storedNotification?.token?.slice(-8), permission });

      if (permission !== 'granted') {
        if (storedNotification?.subscribed) {
          console.log('[WM:push:sync] Permission not granted — clearing localStorage');
          storage.set('notifications', { subscribed: false, token: null });
        } else {
          console.log('[WM:push:sync] Permission not granted and not subscribed — nothing to do');
        }
        return false;
      }

      // Permission is granted — check if there's a live token (covers localStorage cleared, new browser, etc.)
      const currentToken = await this.getToken();

      if (!currentToken) {
        console.log('[WM:push:sync] Token fetch returned null — clearing localStorage');
        storage.set('notifications', { subscribed: false, token: null });
        return false;
      }

      console.log('[WM:push:sync] Token valid:', currentToken.slice(-8), storedNotification?.token ? (storedNotification.token.slice(-8) === currentToken.slice(-8) ? '(unchanged)' : '(CHANGED from ' + storedNotification.token.slice(-8) + ')') : '(recovered — localStorage was empty)');

      await this._saveSubscription(currentToken);

      const user = this.manager.auth().getUser();
      storage.set('notifications', {
        subscribed: true,
        token: currentToken,
        uid: user?.uid || null,
        timestamp: new Date().toISOString(),
      });

      console.log('[WM:push:sync] Sync complete — subscribed');
      return true;
    } catch (error) {
      console.error('[WM:push:sync] Sync error:', error);
      return false;
    }
  }

  // Save subscription to Firestore
  async _saveSubscription(token) {
    try {
      const firestore = this.manager.firestore();
      const user = this.manager.auth().getUser();
      const storage = this.manager.storage();

      if (!token) {
        return;
      }

      const now = new Date();
      const timestamp = now.toISOString();
      const timestampUNIX = Math.floor(now.getTime() / 1000);

      // Get context for client information
      const context = this.manager.utilities().getContext();
      const clientData = context.client;

      // Reference to the notification document (ID is the token)
      const notificationDoc = firestore.doc(`notifications/${token}`);

      // Check if document already exists
      const existingDoc = await notificationDoc.get();
      const existingData = existingDoc.exists() ? existingDoc.data() : null;

      // Determine if we need to update
      const currentUid = user?.uid || null;
      const existingOwner = existingData?.owner || null;
      const needsUpdate = existingOwner !== currentUid;

      // Create or update the document as needed
      if (!existingData) {
        // New subscription - create the document
        await notificationDoc.set({
          token,
          owner: currentUid,
          tags: ['general'],
          attribution: storage.get('attribution', {}),
          context: { client: clientData },
          metadata: {
            created: { timestamp, timestampUNIX },
            updated: { timestamp, timestampUNIX },
          },
        });
      } else if (needsUpdate) {
        // Existing subscription needs update (userId changed)
        // Use dot-notation to avoid overwriting metadata.created
        await notificationDoc.update({
          owner: currentUid,
          context: { client: clientData },
          'metadata.updated': { timestamp, timestampUNIX },
        });
      }
      // If no update needed, do nothing

    } catch (error) {
      console.error('Save subscription error:', error);
      // Don't throw - this is not critical for the subscription process
    }
  }
}

export default Notifications;

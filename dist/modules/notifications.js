class Notifications {
  constructor(manager) {
    this.manager = manager;
    this._requestInProgress = false;
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
      const token = await getToken(messaging, {
        serviceWorkerRegistration: swRegistration,
        vapidKey: options.vapidKey
      });

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

      return await getToken(messaging, {
        serviceWorkerRegistration: swRegistration
      });
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

  // Sync subscription when auth state changes
  async syncSubscription() {
    try {
      // Check if we have a stored notification token
      const storage = this.manager.storage();
      const storedNotification = storage.get('notifications');

      if (!storedNotification?.token) {
        return false;
      }

      // Update the subscription in Firestore with current auth state
      await this._saveSubscription(storedNotification.token);

      // Update local storage with current user ID
      const user = this.manager.auth().getUser();
      storage.set('notifications', {
        ...storedNotification,
        uid: user?.uid || null,
        timestamp: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('Sync subscription error:', error);
      return false;
    }
  }

  // Save subscription to Firestore
  async _saveSubscription(token) {
    try {
      const firestore = this.manager.firebaseFirestore;
      const user = this.manager.auth().getUser();

      if (!firestore || !token) {
        return;
      }

      const { doc, getDoc, setDoc, updateDoc, deleteDoc } = await import('firebase/firestore');
      const { getContext } = await import('./utilities.js');

      const now = new Date();
      const timestamp = now.toISOString();
      const timestampUNIX = Math.floor(now.getTime() / 1000);

      // Get context for client information
      const context = getContext();
      const clientData = context.client;

      // Reference to the notification document (ID is the token)
      const notificationRef = doc(firestore, 'notifications', token);

      // Check if document already exists
      const existingDoc = await getDoc(notificationRef);
      const existingData = existingDoc.exists() ? existingDoc.data() : null;

      // Determine if we need to update
      const currentUid = user?.uid || null;
      const existingUid = existingData?.uid || null;
      const needsUpdate = existingUid !== currentUid;

      if (!existingData) {
        // New subscription - create the document
        const subscriptionData = {
          token,
          context: {
            client: clientData
          },
          tags: ['general'],
          created: {
            timestamp,
            timestampUNIX
          },
          updated: {
            timestamp,
            timestampUNIX
          },
          uid: currentUid
        };

        await setDoc(notificationRef, subscriptionData);

      } else if (needsUpdate) {
        // Existing subscription needs update (userId changed)
        const updateData = {
          context: {
            client: clientData
          },
          updated: {
            timestamp,
            timestampUNIX
          },
          uid: currentUid
        };

        await updateDoc(notificationRef, updateData);
      }
      // If no update needed, do nothing

      // Update user's notification reference if authenticated
      if (user && (!existingData || needsUpdate)) {
        await setDoc(
          doc(firestore, 'users', user.uid, 'notifications', token),
          {
            token,
            created: existingData?.created || {
              timestamp,
              timestampUNIX
            },
            updated: {
              timestamp,
              timestampUNIX
            },
            active: true
          },
          { merge: true }
        );
      }

      // Remove old user reference if user changed
      if (existingUid && existingUid !== currentUid && existingUid !== null) {
        try {
          await deleteDoc(doc(firestore, 'users', existingUid, 'notifications', token));
        } catch (err) {
          // Ignore errors when cleaning up old references
          console.log('Could not clean up old user notification reference:', err.message);
        }
      }

    } catch (error) {
      console.error('Save subscription error:', error);
      // Don't throw - this is not critical for the subscription process
    }
  }
}

export default Notifications;

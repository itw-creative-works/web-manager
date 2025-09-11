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
        subscribedAt: new Date().toISOString(),
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
      if (!('Notification' in window)) {
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

  // Listen for token refresh
  async onTokenRefresh(callback) {
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
        if (payload.data?.refreshToken) {
          callback(payload.data.token);
        }
      });
    } catch (error) {
      console.error('Token refresh listener error:', error);
      return () => {};
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
        
        // Show notification if app is in foreground
        if (payload.notification) {
          const { title, body, icon, badge, image } = payload.notification;
          const clickAction = payload.data?.click_action || payload.notification.click_action;
          
          const notification = new Notification(title, {
            body,
            icon,
            badge,
            image,
            data: payload.data,
            requireInteraction: false,
          });

          notification.onclick = (event) => {
            event.preventDefault();
            if (clickAction) {
              window.open(clickAction, '_blank');
            }
            notification.close();
          };
        }

        callback(payload);
      });
    } catch (error) {
      console.error('Message listener error:', error);
      return () => {};
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

      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      
      const subscriptionData = {
        token,
        platform: 'web',
        userAgent: navigator.userAgent,
        tags: ['general'],
        created: serverTimestamp(),
        updated: serverTimestamp(),
      };

      if (user) {
        subscriptionData.userId = user.uid;
        subscriptionData.userEmail = user.email;
      }

      // Save to notifications collection
      await setDoc(
        doc(firestore, 'notifications', token),
        subscriptionData,
        { merge: true }
      );

      // If user is authenticated, also save reference in user document
      if (user) {
        await setDoc(
          doc(firestore, 'users', user.uid, 'notifications', token),
          {
            token,
            created: serverTimestamp(),
            active: true
          },
          { merge: true }
        );
      }
    } catch (error) {
      console.error('Save subscription error:', error);
      // Don't throw - this is not critical for the subscription process
    }
  }
}

export default Notifications;
class ServiceWorker {
  constructor(manager) {
    this.manager = manager;
    this._registration = null;
    this._updateCallbacks = [];
    this._messageHandlers = new Map();
  }

  // Check if service workers are supported
  isSupported() {
    return 'serviceWorker' in navigator;
  }

  // Register service worker
  async register(options = {}) {
    try {
      if (!this.isSupported()) {
        console.warn('Service Workers are not supported');
        return null;
      }

      const swPath = options.path || this.manager.config.serviceWorker?.config?.path || '/service-worker.js';
      const scope = options.scope || '/';

      // Build config object to pass to service worker
      const config = {
        app: this.manager.config.brand?.id,
        environment: this.manager.config.environment,
        buildTime: this.manager.config.buildTime,
        firebase: this.manager.config.firebase?.app?.config || null
      };

      // Get service worker URL with config
      const swUrl = `${swPath}?config=${encodeURIComponent(JSON.stringify(config))}`;

      // Get existing registrations
      const registrations = await navigator.serviceWorker.getRegistrations();

      // Check if service worker is already registered for this scope
      let registration = registrations.find(reg =>
        reg.scope === new URL(scope, window.location.href).href
      );

      // This helps the .register() method NOT HANG FOREVER
      if (registration) {
        console.log('Using existing service worker registration');
        // Check for updates on existing registration
        registration.update();
      } else {
        console.log('Registering new service worker');
        // Register with config in URL
        registration = await navigator.serviceWorker.register(swUrl, {
          scope,
          updateViaCache: options.updateViaCache || 'imports'
        });
      }

      this._registration = registration;
      this.manager.state.serviceWorker = registration;

      // Set up update handlers
      this._setupUpdateHandlers(registration);

      // Check for updates
      if (options.checkForUpdate !== false) {
        registration.update();
      }

      // Set up message channel
      if (registration.active) {
        this._setupMessageChannel();
      }

      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  // Unregister service worker
  async unregister() {
    try {
      if (!this._registration) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      } else {
        await this._registration.unregister();
      }

      this._registration = null;
      this.manager.state.serviceWorker = null;

      return true;
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
      return false;
    }
  }

  // Get current registration
  getRegistration() {
    return this._registration;
  }

  // Check for updates
  async update() {
    try {
      if (!this._registration) {
        throw new Error('No service worker registered');
      }

      await this._registration.update();
      return true;
    } catch (error) {
      console.error('Service Worker update failed:', error);
      return false;
    }
  }

  // Post message to service worker
  postMessage(message, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        return reject(new Error('Service Workers not supported'));
      }

      const controller = this._registration?.active || navigator.serviceWorker.controller;

      if (!controller) {
        return reject(new Error('No active service worker'));
      }

      const messageChannel = new MessageChannel();
      const timeout = options.timeout || 5000;
      let timeoutId;

      // Set up timeout
      if (timeout > 0) {
        timeoutId = setTimeout(() => {
          messageChannel.port1.close();
          reject(new Error('Service worker message timeout'));
        }, timeout);
      }

      // Listen for response
      messageChannel.port1.onmessage = (event) => {
        clearTimeout(timeoutId);

        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data);
        }
      };

      // Send message
      controller.postMessage(message, [messageChannel.port2]);
    });
  }

  // Listen for messages from service worker
  onMessage(type, handler) {
    if (!this.isSupported()) {
      return () => {};
    }

    // Store handler
    if (!this._messageHandlers.has(type)) {
      this._messageHandlers.set(type, new Set());
    }
    this._messageHandlers.get(type).add(handler);

    // Set up global message listener if not already done
    if (this._messageHandlers.size === 1) {
      navigator.serviceWorker.addEventListener('message', this._handleMessage.bind(this));
    }

    // Return unsubscribe function
    return () => {
      const handlers = this._messageHandlers.get(type);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this._messageHandlers.delete(type);
        }
      }
    };
  }

  // Skip waiting and activate new service worker
  async skipWaiting() {
    try {
      if (!this._registration?.waiting) {
        throw new Error('No service worker waiting');
      }

      // Post message to skip waiting
      await this.postMessage({ action: 'skipWaiting' });

      // Reload page after activation
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });

      return true;
    } catch (error) {
      console.error('Skip waiting failed:', error);
      return false;
    }
  }

  // Listen for update events
  onUpdateFound(callback) {
    this._updateCallbacks.push(callback);

    return () => {
      const index = this._updateCallbacks.indexOf(callback);
      if (index > -1) {
        this._updateCallbacks.splice(index, 1);
      }
    };
  }

  // Get service worker state
  getState() {
    if (!this._registration) {
      return 'none';
    }

    if (this._registration.installing) {
      return 'installing';
    } else if (this._registration.waiting) {
      return 'waiting';
    } else if (this._registration.active) {
      return 'active';
    }

    return 'unknown';
  }

  // Private: Set up update handlers
  _setupUpdateHandlers(registration) {
    // Listen for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;

      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker available
          this._notifyUpdateCallbacks({
            type: 'update-available',
            worker: newWorker
          });
          
          // Automatically skip waiting and activate new worker
          if (this.manager.config.serviceWorker?.autoUpdate !== false) {
            this.skipWaiting();
          }
        }
      });
    });

    // Listen for controller changes
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        this._notifyUpdateCallbacks({
          type: 'controller-change'
        });
      }
    });
  }

  // Private: Notify update callbacks
  _notifyUpdateCallbacks(event) {
    this._updateCallbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Update callback error:', error);
      }
    });
  }

  // Private: Handle incoming messages
  _handleMessage(event) {
    const { type, ...data } = event.data || {};

    if (!type) return;

    const handlers = this._messageHandlers.get(type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data, event);
        } catch (error) {
          console.error('Message handler error:', error);
        }
      });
    }
  }

  // Private: Set up message channel
  _setupMessageChannel() {
    // This ensures we can communicate with the service worker
    navigator.serviceWorker.ready.then(() => {
      console.log('Service Worker ready for messaging');
    });
  }
}

export default ServiceWorker;

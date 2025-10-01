class ServiceWorker {
  constructor(manager) {
    this.manager = manager;
    this._registration = null;
    this._messageHandlers = new Map();
  }

  // Check if service workers are supported
  isSupported() {
    return 'serviceWorker' in navigator;
  }

  // Return promise that resolves when service worker is ready
  async ready() {
    if (!this.isSupported()) {
      throw new Error('Service Workers not supported');
    }

    // If already registered and active
    if (this._registration?.active) {
      return this._registration;
    }

    // Wait for service worker to be ready
    const registration = await navigator.serviceWorker.ready;
    return registration;
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

      // Register service worker
      const registration = await navigator.serviceWorker.register(swPath, {
        scope,
        updateViaCache: 'none'
      });

      // Store registration
      this._registration = registration;
      this.manager.state.serviceWorker = registration;

      // Wait for service worker to be ready and send config
      await navigator.serviceWorker.ready;

      // Send config to active service worker
      // Removed due to issues init'ing firebase asynchronously in SW (now config is fetched directly in SW)
      // if (registration.active) {
      //   try {
      //     this.postMessage({
      //       command: 'update-config',
      //       payload: config
      //     });
      //   } catch (error) {
      //     console.warn('Could not send config to service worker:', error);
      //   }
      // }

      // Resolve with registration
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  // Get current registration
  getRegistration() {
    return this._registration;
  }

  // Post message to service worker
  postMessage(message, options = {}) {
    return new Promise((resolve, reject) => {
      // Check support
      if (!this.isSupported()) {
        return reject(new Error('Service Workers not supported'));
      }

      // Get active service worker
      const controller = this._registration?.active || navigator.serviceWorker.controller;

      if (!controller) {
        return reject(new Error('No active service worker'));
      }

      // Create message channel for two-way communication
      const messageChannel = new MessageChannel();
      const timeout = options.timeout || 5000;
      let timeoutId;

      // Set up timeout to prevent hanging
      if (timeout > 0) {
        timeoutId = setTimeout(() => {
          messageChannel.port1.close();
          reject(new Error('Service worker message timeout'));
        }, timeout);
      }

      // Listen for response from service worker
      messageChannel.port1.onmessage = (event) => {
        clearTimeout(timeoutId);

        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data);
        }
      };

      // Send message with port for reply
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
}

export default ServiceWorker;

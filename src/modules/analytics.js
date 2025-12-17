// Dev mode credentials by runtime
const DEV_CREDENTIALS = {
  'browser-extension': {
    id: 'G-5NWE9SPEEM',
    secret: '33E5W1cCQGKPK4lyMMOWOQ',
  },
  'electron': {
    id: 'G-WMNERKK9J2',
    secret: 'UeKzq8UvS3GD5D2aHcuZgQ',
  },
};

// Supported runtimes for analytics
const SUPPORTED_RUNTIMES = ['browser-extension', 'electron'];

class Analytics {
  constructor(manager) {
    this.manager = manager;
    this.initialized = false;
    this.devMode = false;
    this.runtime = null;
    this.config = null;
    this.measurementId = null;
    this.secret = null;
    this.clientId = null;
  }

  // Check if runtime is supported
  _isSupported() {
    return SUPPORTED_RUNTIMES.includes(this.runtime);
  }

  // Initialize analytics
  init(config = {}) {
    // Store config
    this.config = config;

    // Get runtime
    this.runtime = this.manager.utilities().getRuntime();

    // TODO: Add web runtime support
    if (!this._isSupported()) {
      console.log(`[Analytics] Runtime "${this.runtime}" not supported yet, skipping`);
      return;
    }

    // Skip if already initialized
    if (this.initialized) {
      console.log('[Analytics] Already initialized');
      return;
    }

    // Check for development mode
    this.devMode = this.manager.isDevelopment();

    // Get measurement ID and secret (use dev credentials in dev mode)
    if (this.devMode) {
      const devCreds = DEV_CREDENTIALS[this.runtime];
      if (devCreds) {
        this.measurementId = devCreds.id;
        this.secret = devCreds.secret;
        console.log(`[Analytics] Dev mode: using ${this.runtime} dev credentials`);
      } else {
        // No dev credentials for this runtime, use provided config
        this.measurementId = config.measurementId || config.id;
        this.secret = config.secret;
      }
    } else {
      this.measurementId = config.measurementId || config.id;
      this.secret = config.secret;
    }

    // Skip if no measurement ID
    if (!this.measurementId) {
      console.log('[Analytics] No measurement ID provided, skipping initialization');
      return;
    }

    // Generate or retrieve client ID
    this.clientId = this._getClientId();

    // Log initialization
    console.log(`[Analytics] Initializing with measurement ID: ${this.measurementId}${this.devMode ? ' (dev mode)' : ''} [${this.runtime}]`);

    // Mark as initialized
    this.initialized = true;

    // Send initial pageview
    this.event('page_view');
  }

  // Get or generate client ID
  _getClientId() {
    const storageKey = '_ga_client_id';

    // Try to get existing client ID
    let clientId = null;
    try {
      clientId = localStorage.getItem(storageKey);
    } catch (e) {
      // localStorage not available
    }

    // Generate new client ID if needed
    if (!clientId) {
      clientId = `${Math.random().toString(36).substring(2)}.${Date.now()}`;
      try {
        localStorage.setItem(storageKey, clientId);
      } catch (e) {
        // localStorage not available
      }
    }

    return clientId;
  }

  // Get page data to include with all events
  _getPageData() {
    return {
      page_path: window.location.pathname,
      page_title: document.title,
      page_location: window.location.href,
    };
  }

  // Track an event
  event(eventName, params = {}) {
    // TODO: Add web runtime support
    if (!this._isSupported()) {
      return;
    }

    if (!this.initialized) {
      return;
    }

    // Merge page data with provided params
    const eventParams = {
      ...this._getPageData(),
      ...params,
    };

    // Log event
    console.log(`[Analytics] Event: ${eventName}${this.devMode ? ' (dev mode)' : ''}`, eventParams);

    // Send via Measurement Protocol (fetch)
    this._sendViaFetch(eventName, eventParams);
  }

  // Send event via Measurement Protocol (fetch)
  _sendViaFetch(eventName, params = {}) {
    // Measurement Protocol requires api_secret
    if (!this.secret) {
      console.warn('[Analytics] No API secret provided, cannot send via Measurement Protocol');
      return;
    }

    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${this.measurementId}&api_secret=${this.secret}`;

    const payload = {
      client_id: this.clientId,
      events: [{
        name: eventName,
        params: {
          ...params,
          engagement_time_msec: 100,
          session_id: this._getSessionId(),
        },
      }],
    };

    // Send via fetch (fire and forget)
    fetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    }).catch((err) => {
      console.warn('[Analytics] Failed to send event:', err);
    });
  }

  // Get or generate session ID
  _getSessionId() {
    const storageKey = '_ga_session_id';
    const sessionTimeout = 30 * 60 * 1000; // 30 minutes

    let sessionData = null;
    try {
      sessionData = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
    } catch (e) {
      // sessionStorage not available
    }

    const now = Date.now();

    // Check if session is still valid
    if (sessionData && (now - sessionData.lastActive) < sessionTimeout) {
      sessionData.lastActive = now;
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(sessionData));
      } catch (e) {
        // sessionStorage not available
      }
      return sessionData.id;
    }

    // Create new session
    const newSession = {
      id: `${Date.now()}`,
      lastActive: now,
    };

    try {
      sessionStorage.setItem(storageKey, JSON.stringify(newSession));
    } catch (e) {
      // sessionStorage not available
    }

    return newSession.id;
  }

  // Set user properties
  setUserProperties(properties = {}) {
    // TODO: Add web runtime support
    if (!this._isSupported()) {
      return;
    }

    if (!this.initialized) {
      return;
    }

    // TODO: Implement for Measurement Protocol
  }

  // Set user ID
  setUserId(userId) {
    // TODO: Add web runtime support
    if (!this._isSupported()) {
      return;
    }

    if (!this.initialized) {
      return;
    }

    // TODO: Implement for Measurement Protocol
  }
}

export default Analytics;

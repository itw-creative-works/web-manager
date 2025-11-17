// Helper functions
function isLighthouse() {
  try {
    return typeof navigator !== 'undefined' && navigator.userAgent?.includes('Lighthouse');
  } catch (e) {
    return false;
  }
}

function isAutomatedBrowser() {
  try {
    return typeof navigator !== 'undefined' && navigator.webdriver === true;
  } catch (e) {
    return false;
  }
}

class mod {
  constructor(manager) {
    this.manager = manager;
    this.initialized = false;
    this.Sentry = null;
    this.config = null;
  }

  /**
   * Initialize Sentry error tracking
   * @param {Object} config - Sentry configuration object
   * @returns {Promise} Resolves when initialization is complete
   */
  init(config = {}) {
    return new Promise((resolve, reject) => {
      // Dynamically import Sentry to reduce initial bundle size
      import('@sentry/browser')
        .then((mod) => {
          // Store reference and expose globally
          this.Sentry = mod;

          // Add to window if window is defined
          if (typeof window !== 'undefined') {
            window.Sentry = mod;
          }

          // Build configuration with our defaults
          this.config = this._buildConfig(config);

          // Initialize Sentry
          this.Sentry.init(this.config);
          this.initialized = true;

          resolve({ initialized: true });
        })
        .catch((error) => {
          console.error('[Sentry] Failed to initialize:', error);
          reject(error);
        });
    });
  }

  /**
   * Build Sentry configuration with defaults and integrations
   * @private
   */
  _buildConfig(userConfig) {
    const config = { ...userConfig };
    const manager = this.manager;

    // Set release version and environment
    config.release = `${manager.config.brand.id}@${manager.config.buildTime}`;
    config.environment = manager.config.environment || 'production';
    config.integrations = config.integrations || [];

    // Add browser tracing integration if not already present
    if (!config.integrations.some(i => i.name === 'BrowserTracing')) {
      config.integrations.push(this.Sentry.browserTracingIntegration());
    }

    // Add replay integration if sample rates are configured
    const hasReplays = (config.replaysSessionSampleRate > 0) ||
                      (config.replaysOnErrorSampleRate > 0);

    if (hasReplays && !config.integrations.some(i => i.name === 'Replay')) {
      config.integrations.push(this.Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }));
    }

    // Configure beforeSend to enrich events with user data and session info
    config.beforeSend = (event, hint) => {
      const startTime = this.manager.config.page.startTime || Date.now();
      const hoursSinceStart = (Date.now() - startTime) / (1000 * 3600);
      const storage = this.manager.storage();

      // Add custom tags
      event.tags = {
        ...event.tags,
        'process.type': 'browser',
        'usage.session.hours': hoursSinceStart.toFixed(2),
      };

      // Add user info from storage
      event.user = {
        ...event.user,
        email: storage.get('user.auth.email', ''),
        uid: storage.get('user.auth.uid', ''),
      };

      // Log error to console for debugging
      console.error('[Sentry] Caught error:', {
        message: event.message || (event.exception?.values?.[0]?.value) || 'Unknown error',
        level: event.level,
        tags: event.tags,
        user: event.user,
        hint
      });

      // Block sending in development mode
      if (this.manager.isDevelopment()) {
        console.log('[Sentry] Development mode - not sending to Sentry');
        return null;
      }

      // Block sending if Lighthouse is running
      if (isLighthouse()) {
        console.log('[Sentry] Lighthouse detected - not sending to Sentry');
        return null;
      }

      // Block sending if automated browser (Selenium, Puppeteer, etc.)
      if (isAutomatedBrowser()) {
        console.log('[Sentry] Automated browser detected - not sending to Sentry');
        return null;
      }

      return event;
    };

    return config;
  }

  /**
   * Capture an exception and send to Sentry
   * Safe to call even if Sentry is not initialized
   * @param {Error} error - The error to capture
   * @param {Object} captureContext - Additional context for the error
   * @returns {string|null} Event ID if successful, null otherwise
   */
  captureException(error, captureContext) {
    // Log the error
    console.error('[Sentry] Capturing exception:', error);

    // Safe to call - won't throw if not initialized
    if (!this.initialized) {
      console.log('[Sentry] Not initialized, skipping capture');
      return null;
    }

    // Call Sentry to capture the exception
    try {
      return this.Sentry.captureException(error, captureContext);
    } catch (captureError) {
      console.error('[Sentry] Failed to capture exception:', captureError);
      return null;
    }
  }

  // /**
  //  * Capture a message and send to Sentry
  //  * Safe to call even if Sentry is not initialized
  //  * @param {string} message - The message to capture
  //  * @param {string} level - Severity level (debug, info, warning, error, fatal)
  //  * @param {Object} captureContext - Additional context for the message
  //  * @returns {string|null} Event ID if successful, null otherwise
  //  */
  // captureMessage(message, level = 'info', captureContext) {
  //   if (!message) {
  //     console.warn('[Sentry] captureMessage called with no message');
  //     return null;
  //   }

  //   console.log(`[Sentry] Capturing message (${level}):`, message);

  //   // Safe to call - won't throw if not initialized
  //   if (!this.initialized || !this.Sentry) {
  //     console.log('[Sentry] Not initialized, skipping capture');
  //     return null;
  //   }

  //   try {
  //     return this.Sentry.captureMessage(message, level, captureContext);
  //   } catch (captureError) {
  //     console.error('[Sentry] Failed to capture message:', captureError);
  //     return null;
  //   }
  // }
}

export default mod;

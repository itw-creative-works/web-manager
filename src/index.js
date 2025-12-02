import Storage from './modules/storage.js';
import * as utilities from './modules/utilities.js';
import * as domUtils from './modules/dom.js';
import Auth from './modules/auth.js';
import Bindings from './modules/bindings.js';
import Firestore from './modules/firestore.js';
import Notifications from './modules/notifications.js';
import ServiceWorker from './modules/service-worker.js';
import Sentry from './modules/sentry.js';

class Manager {
  constructor() {
    // Configuration from init()
    this.config = {};

    // Runtime state
    this.state = {
      serviceWorker: null
    };

    // Track Firebase auth initialization
    this._firebaseAuthInitialized = false;

    // Initialize modules
    this._storage = new Storage();
    this._auth = new Auth(this);
    this._bindings = new Bindings(this);
    this._firestore = new Firestore(this);
    this._notifications = new Notifications(this);
    this._serviceWorker = new ServiceWorker(this);
    this._sentry = new Sentry(this);
  }

  // Module getters
  storage() {
    return this._storage;
  }

  auth() {
    return this._auth;
  }

  bindings() {
    return this._bindings;
  }

  firestore() {
    return this._firestore;
  }

  notifications() {
    return this._notifications;
  }

  serviceWorker() {
    return this._serviceWorker;
  }

  sentry() {
    return this._sentry;
  }

  // DOM utilities
  dom() {
    return domUtils;
  }

  utilities() {
    return utilities;
  }

  // Initialize the manager
  async initialize(configuration) {
    try {
      // Store configuration as-is
      this.config = this._processConfiguration(configuration);

      // Initialize Firebase if enabled
      if (this.config.firebase?.app?.enabled) {
        await this._initializeFirebase();
      }

      // Initialize Sentry if enabled
      if (this.config.sentry?.enabled) {
        await this._sentry.init(this.config.sentry.config);
      }

      // Initialize service worker if enabled
      if (this.config.serviceWorker?.enabled) {
        this._serviceWorker.register({
          path: this.config.serviceWorker?.config?.path
        });
      }

      // Start version checking if enabled
      if (this.config.refreshNewVersion?.enabled) {
        this._startVersionCheck();
      }

      // Set up auth event listeners (uses event delegation, no need to wait for DOM)
      this._auth.setupEventListeners();

      // Set up push notification auto-request if enabled
      if (this.config.pushNotifications?.enabled && this.config.pushNotifications?.config?.autoRequest > 0) {
        this._setupNotificationAutoRequest();
      }

      // Old IE force polyfill
      // await this._loadPolyfillsIfNeeded();

      // Update bindings with config
      this.bindings().update({ config: this.config });

      return this;
    } catch (error) {
      console.error('Manager initialization error:', error);
      throw error;
    }
  }

  _processConfiguration(configuration) {
    // Default configuration structure
    const defaults = {
      environment: 'production',
      buildTime: Date.now(),
      brand: {
        id: 'app',
        name: 'Application',
        description: '',
        type: 'Organization',
        images: {
          brandmark: '',
          wordmark: '',
          combomark: ''
        },
        contact: {
          email: '',
          phone: '',
          'slapform-form-id': ''
        },
        address: {}
      },
      auth: {
        enabled: true,
        config: {
          policy: null,
          redirects: {
            authenticated: '/account',
            unauthenticated: '/signup'
          }
        }
      },
      firebase: {
        app: {
          enabled: true,
          config: {}
        },
        appCheck: {
          enabled: false,
          config: {
            siteKey: ''
          }
        }
      },
      cookieConsent: {
        enabled: true,
        config: {
          palette: {
            popup: {
              background: '#237afc',
              text: '#fff'
            },
            button: {
              background: '#fff',
              text: '#237afc'
            }
          },
          theme: 'classic',
          position: 'bottom-left',
          // type: '',
          // showLink: false,
          content: {
            message: 'We use cookies to ensure you get the best experience on our website. By continuing to use the site, you agree to our { terms }.',
            dismiss: 'I Understand'
          }
        }
      },
      chatsy: {
        enabled: false,
        config: {
          accountId: '',
          chatId: '',
          settings: {
            openChatButton: {
              background: '#237afc',
              text: '#fff'
            }
          }
        }
      },
      sentry: {
        enabled: true,
        config: {
          dsn: '',
          release: '',
          replaysSessionSampleRate: 0.01,
          replaysOnErrorSampleRate: 0.01
        }
      },
      exitPopup: {
        enabled: true,
        config: {
          timeout: 1000 * 60 * 60 * 4,
          title: 'Want 15% off?',
          message: 'Get 15% off your purchase of our Premium plans.',
          okButton: {
            text: 'Claim 15% Discount',
            link: '/pricing'
          }
        }
      },
      lazyLoading: {
        enabled: true,
        config: {
          selector: '[data-lazy]',
          rootMargin: '50px 0px', // Start loading 50px before element comes into view
          threshold: 0.01, // Trigger when 1% of element is visible
          loadedClass: 'lazy-loaded',
          loadingClass: 'lazy-loading',
          errorClass: 'lazy-error'
        }
      },
      socialSharing: {
        enabled: false,
        config: {
          selector: '[data-social-share]',
          defaultPlatforms: ['facebook', 'twitter', 'linkedin', 'pinterest', 'reddit', 'email', 'copy'],
          buttonClass: '',
          showLabels: false,
          openInNewWindow: true,
          windowWidth: 600,
          windowHeight: 400,
        }
      },
      pushNotifications: {
        enabled: true,
        config: {
          autoRequest: 1000 * 60
        }
      },
      validRedirectHosts: [],

      // Non-configurable defaults
      refreshNewVersion: {
        enabled: true,
        config: {
          interval: 1000 * 60 * 60, // Check every hour
        }
      },
      serviceWorker: {
        enabled: true,
        config: {
          path: '/service-worker.js'
        }
      },
    };

    // Deep merge configuration with defaults
    const merged = this._deepMerge(defaults, configuration);

    // Evaluate string expressions for timeout values
    if (merged.exitPopup?.config?.timeout) {
      merged.exitPopup.config.timeout = safeEvaluate(merged.exitPopup.config.timeout);
    }

    if (merged.pushNotifications?.config?.autoRequest) {
      merged.pushNotifications.config.autoRequest = safeEvaluate(merged.pushNotifications.config.autoRequest);
    }

    if (merged.refreshNewVersion?.config?.interval) {
      merged.refreshNewVersion.config.interval = safeEvaluate(merged.refreshNewVersion.config.interval);
    }

    // Return merged configuration
    return merged;
  }

  _deepMerge(target, source) {
    const output = Object.assign({}, target);
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach(key => {
        if (isObject(source[key])) {
          if (!(key in target))
            Object.assign(output, { [key]: source[key] });
          else
            output[key] = this._deepMerge(target[key], source[key]);
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;

    function isObject(item) {
      return item && typeof item === 'object' && !Array.isArray(item);
    }
  }

  async _initializeFirebase() {
    const firebaseConfig = this.config.firebase.app.config;

    // Dynamically import Firebase v12
    const { initializeApp } = await import('firebase/app');
    const { getAuth, onAuthStateChanged } = await import('firebase/auth');
    const { getFirestore } = await import('firebase/firestore');
    const { getMessaging } = await import('firebase/messaging');

    // If we're in devmode, set the firebase config authDomain to the current host
    // if (this.isDevelopment() && firebaseConfig) {
    //   firebaseConfig.authDomain = window.location.hostname;
    // }

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);

    // Store Firebase references
    this._firebaseApp = app;
    this._firebaseAuth = getAuth(app);
    this._firebaseFirestore = getFirestore(app);

    // Only initialize messaging if service workers are supported
    if ('serviceWorker' in navigator) {
      this._firebaseMessaging = getMessaging(app);
    } else {
      console.warn('Service workers not available - Firebase Messaging disabled');
      this._firebaseMessaging = null;
    }

    // Initialize Firebase App Check if enabled
    if (this.config.firebase.appCheck?.enabled) {
      const { initializeAppCheck, ReCaptchaEnterpriseProvider } = await import('firebase/app-check');
      const siteKey = this.config.firebase.appCheck.config.siteKey;

      if (siteKey) {
        initializeAppCheck(app, {
          provider: new ReCaptchaEnterpriseProvider(siteKey),
          isTokenAutoRefreshEnabled: true
        });
      }
    }

    // Setup auth state listener
    onAuthStateChanged(this._firebaseAuth, (user) => {
      // Mark auth as initialized after first callback
      this._firebaseAuthInitialized = true;

      // Let auth module handle everything including DOM updates
      this._auth._handleAuthStateChange(user);
    });
  }

  // Getters for Firebase services
  get firebaseApp() { return this._firebaseApp; }
  get firebaseAuth() { return this._firebaseAuth; }
  get firebaseFirestore() { return this._firebaseFirestore; }
  get firebaseMessaging() { return this._firebaseMessaging; }

  isDevelopment() {
    return this.config.environment === 'development';
  }

  getFunctionsUrl(environment) {
    const env = environment || this.config.environment;
    const projectId = this.config.firebase?.app?.config?.projectId;

    if (!projectId) {
      throw new Error('Firebase project ID not configured');
    }

    if (env === 'development') {
      return 'http://localhost:5001/' + projectId + '/us-central1';
    }

    return 'https://us-central1-' + projectId + '.cloudfunctions.net';
  }

  getApiUrl(environment, url) {
    // Precedence: passed environment > query string > config.environment
    const searchParams = new URLSearchParams(window.location.search);
    const queryEnv = searchParams.get('_dev_apiEnvironment');
    const env = environment
      || queryEnv
      || this.config.environment;

    if (env === 'development') {
      return 'http://localhost:5002';
    }

    const authDomain = this.config.firebase.app.config.authDomain;
    const baseUrl = url || (authDomain ? `https://${authDomain}` : window.location.origin);
    const urlObj = new URL(baseUrl);
    const hostnameParts = urlObj.hostname.split('.');

    if (hostnameParts.length > 2) {
      hostnameParts[0] = 'api';
    } else {
      hostnameParts.unshift('api');
    }

    urlObj.hostname = hostnameParts.join('.');

    // Strip trailing slash
    return urlObj.toString().replace(/\/$/, '');
  }

  isValidRedirectUrl(url) {
    try {
      const returnUrlObject = new URL(decodeURIComponent(url));
      const currentUrlObject = new URL(window.location.href);

      return returnUrlObject.host === currentUrlObject.host
        || returnUrlObject.protocol === this.config.brand?.id + ':'
        || (this.config.validRedirectHosts || []).includes(returnUrlObject.host);
    } catch (e) {
      return false;
    }
  }

  _startVersionCheck() {
    // Re-focus events
    window.addEventListener('focus', () => {
      this._checkVersion();
    });

    window.addEventListener('online', () => {
      this._checkVersion();
    });

    // Set up interval
    this._versionCheckInterval = setInterval(() => {
      this._checkVersion();
    }, this.config.refreshNewVersion.config.interval);
  }

  _setupNotificationAutoRequest() {
    const handleClick = () => {
      // Remove listener after first click
      document.removeEventListener('click', handleClick);

      // Set timeout to request notifications
      setTimeout(() => {
        console.log('Auto-requesting notification permissions...');
        this._notifications.subscribe().catch(err => {
          console.error('Notification subscription failed:', err.message);
        });
      }, this.config.pushNotifications.config.autoRequest);
    };

    // Wait for user click
    document.addEventListener('click', handleClick);
  }

  // async _loadPolyfillsIfNeeded() {
  //   // Check if polyfills are needed by testing for ES6 features
  //   const featuresPass = (
  //     typeof Symbol !== 'undefined'
  //   );

  //   // If all features are supported, no polyfills needed
  //   if (featuresPass) {
  //     return;
  //   }

  //   // Load polyfills for older browsers (especially IE)
  //   try {
  //     await domUtils.loadScript({
  //       src: 'https://cdnjs.cloudflare.com/polyfill/v3/polyfill.min.js?flags=always%2Cgated&features=default%2Ces5%2Ces6%2Ces7%2CPromise.prototype.finally%2C%7Ehtml5-elements%2ClocalStorage%2Cfetch%2CURLSearchParams',
  //       crossorigin: 'anonymous'
  //     });
  //     console.log('Polyfills loaded for older browser');
  //   } catch (error) {
  //     console.error('Failed to load polyfills:', error);
  //     // Continue initialization even if polyfills fail to load
  //   }
  // }

  async _checkVersion() {
    if (this.isDevelopment()) {
      /* @dev-only:start */
      {
        console.log('[Version] Skipping version check in development mode');
      }
      /* @dev-only:end */
      return;
    }

    try {
      // Try new path first, then fallback to legacy path
      const paths = ['/build.json', '/@output/build/build.json'];
      let data = null;
      let response = null;

      for (const path of paths) {
        try {
          response = await fetch(`${path}?cb=${Date.now()}`);
          if (response.ok) {
            data = await response.json();
            break;
          }
        } catch (e) {
          // Continue to next path
        }
      }

      if (!data) {
        throw new Error('Failed to fetch build.json from any path');
      }

      // Extract timestamp - support both new format (data.timestamp) and legacy format (data['npm-build'].timestamp)
      let buildTimeLive;
      if (data.timestamp) {
        buildTimeLive = new Date(data.timestamp);
      } else if (data?.['npm-build']?.timestamp) {
        buildTimeLive = new Date(data['npm-build'].timestamp);
      } else {
        throw new Error('No timestamp found in build.json');
      }

      const buildTimeCurrent = new Date(this.config.buildTime);

      // Add 1 hour to current build time to account for npm build process
      buildTimeCurrent.setHours(buildTimeCurrent.getHours() + 1);

      // Log version info
      console.log(`[Version] Current build time: ${buildTimeCurrent.toISOString()}, Live build time: ${buildTimeLive.toISOString()}`);

      // If live version is newer, reload the page
      if (buildTimeCurrent >= buildTimeLive) {
        return; // No update needed
      }

      console.log('[Version] New version detected, reloading page...');

      // Force page reload
      window.onbeforeunload = function () {
        return undefined;
      };

      window.location.reload(true);
    } catch (error) {
      console.warn('[Version] Failed version check:', error);
    }
  }
}

// Safely evaluate timeout string expressions
const safeEvaluate = (str) => {
  if (typeof str !== 'string') return str;

  // Only allow numbers, *, +, -, /, parentheses, and whitespace
  if (!/^[\d\s\*\+\-\/\(\)]+$/.test(str)) {
    console.warn('Invalid expression format:', str);
    return str;
  }

  try {
    // Use Function constructor instead of eval for safer evaluation
    return new Function('return ' + str)();
  } catch (e) {
    console.warn('Failed to evaluate expression:', str, e);
    return str;
  }
};

// Create singleton instance
const manager = new Manager();

// Export for different environments
export default manager;
export { Manager };

// For non-ES6 environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = manager;
}

